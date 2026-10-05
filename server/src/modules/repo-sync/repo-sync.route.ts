import { Router } from "express";
import RepoSyncController from "./repo-sync.controller.js";
import RepoSyncService from "./repo-sync.service.js";
import RepoSyncRepository from "./repo-sync.repository.js";
import GithubRepository from "../github/github.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { createRateLimiter } from "../../common/middleware/rate-limit.middleware.js";
import { rateLimitPolicies } from "../../common/config/rate-limits.js";

export const repoSyncRoutes = Router();

const repoSyncRepository = new RepoSyncRepository();
const githubRepository = new GithubRepository();
const repoSyncService = new RepoSyncService(repoSyncRepository, githubRepository);
const repoSyncController = new RepoSyncController(repoSyncService);

const syncLimiter = createRateLimiter({ policy: rateLimitPolicies.repoSync });
const readLimiter = createRateLimiter({ policy: rateLimitPolicies.readOnly });

repoSyncRoutes.post(
  "/",
  requireAuth,
  syncLimiter,
  asyncHandler(repoSyncController.triggerSync.bind(repoSyncController)),
);
repoSyncRoutes.get(
  "/status",
  requireAuth,
  readLimiter,
  asyncHandler(repoSyncController.getStatuses.bind(repoSyncController)),
);

