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
