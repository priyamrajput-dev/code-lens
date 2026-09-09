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

export function createApplication(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json());

  // Better Auth handler
  app.all("/api/auth/*", toNodeHandler(auth));

  // Feature Module Routes
  app.use("/api/github", githubRoutes);
  app.use("/api/repo-sync", repoSyncRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/settings", settingsRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
