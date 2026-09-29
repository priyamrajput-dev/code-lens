import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { env } from "./common/config/env.js";
import { githubRoutes } from "./modules/github/github.route.js";
import { repoSyncRoutes } from "./modules/repo-sync/repo-sync.route.js";
import { reviewRoutes } from "./modules/reviews/reviews.route.js";
import { billingRoutes } from "./modules/billing/billing.route.js";
import { settingsRoutes } from "./modules/settings/settings.route.js";
import { errorHandler } from "./common/middleware/error-handler.middleware.js";
import type { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import setCookieParser from "set-cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApplication(): Express {
  const app = express();

  // Trust reverse proxy (Render, Vercel, etc.) for secure cookies & proto detection
  app.set("trust proxy", 1);

  const allowedOrigins = [
    env.CLIENT_URL.replace(/\/$/, ""),
    "https://code-lens-peach.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  // Cross-domain session cookie bridge for Vercel <-> Render split architectures
  app.get("/api/auth/bridge", (req, res) => {
    const token = req.query.token as string | undefined;
    const next = (req.query.next as string | undefined) || "/dashboard";

    if (token) {
      const isSecure = env.BETTER_AUTH_URL.startsWith("https://") || env.NODE_ENV === "production" || req.secure;
      const cookieOptions = {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("better-auth.session_token", token, cookieOptions);
      if (isSecure) {
        res.cookie("__Secure-better-auth.session_token", token, cookieOptions);
      }
    }

    if (next.startsWith("/")) {
      return res.redirect(next);
    }
    try {
      const parsedNext = new URL(next);
      if (
        parsedNext.origin === env.CLIENT_URL.replace(/\/$/, "") ||
        parsedNext.hostname.endsWith("vercel.app")
      ) {
        return res.redirect(next);
      }
    } catch {}
    res.redirect("/dashboard");
  });

  // Intercept OAuth callback redirect to bridge session cookie when callback is on Render but frontend is on Vercel
  app.use((req, res, next) => {
    const originalWriteHead = res.writeHead;
    res.writeHead = function (statusCode: number, ...args: any[]) {
      if (statusCode === 302 && req.path.includes("/callback")) {
        const location = res.getHeader("location");
        const setCookie = res.getHeader("set-cookie");

        if (
          typeof location === "string" &&
          (location.includes("vercel.app") || location.startsWith(env.CLIENT_URL.replace(/\/$/, "")) || location.startsWith("/"))
        ) {
          const rawCookies = Array.isArray(setCookie)
            ? setCookie.map(String)
            : typeof setCookie === "string"
              ? [setCookie]
              : [];
          const parsed = setCookieParser.parse(rawCookies);
          const sessionCookie = parsed.find((c) => c.name.includes("session_token"));

          if (sessionCookie?.value) {
            try {
              let targetUrl: URL;
              try {
                targetUrl = new URL(location);
              } catch {
                targetUrl = new URL(location, env.CLIENT_URL);
              }
              const clientOrigin = targetUrl.hostname.endsWith("vercel.app")
                ? targetUrl.origin
                : env.CLIENT_URL.replace(/\/$/, "");
              const bridgeUrl = `${clientOrigin}/api/auth/bridge?token=${encodeURIComponent(sessionCookie.value)}&next=${encodeURIComponent(targetUrl.pathname + targetUrl.search)}`;
              res.setHeader("location", bridgeUrl);
            } catch (err) {
              console.warn("Failed to construct bridge redirect:", err);
            }
          }
        }
      }
      return (originalWriteHead as any).call(this, statusCode, ...args);
    };
    next();
  });

  // Better Auth handler for Express 5 (path-to-regexp v8 wildcard format)
  app.all(["/api/auth", "/api/auth/*path"], toNodeHandler(auth));

  app.use(express.json());

  // Feature Module Routes
  app.use("/api/github", githubRoutes);
  app.use("/api/repo-sync", repoSyncRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/settings", settingsRoutes);

  // Serve frontend client dist if available
  const clientDistPath = path.resolve(__dirname, "../../client/dist");
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("*path", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  } else {
    // Backend root fallback when client dist is not built locally
    app.get("/", (req, res) => {
      if (req.query.error) {
        const clientRedirectUrl = `${env.CLIENT_URL.replace(/\/$/, "")}/sign-in?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
        return res.redirect(clientRedirectUrl);
      }
      res.json({ status: "ok", name: "code-lens-api" });
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
