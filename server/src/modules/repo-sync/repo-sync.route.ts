import { Router } from "express";
import RepoSyncController from "./repo-sync.controller.js";
import RepoSyncService from "./repo-sync.service.js";
import RepoSyncRepository from "./repo-sync.repository.js";
import GithubRepository from "../github/github.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

export const repoSyncRoutes = Router();

const repoSyncRepository = new RepoSyncRepository();
const githubRepository = new GithubRepository();
const repoSyncService = new RepoSyncService(repoSyncRepository, githubRepository);
const repoSyncController = new RepoSyncController(repoSyncService);

repoSyncRoutes.post(
  "/",
  requireAuth,
  asyncHandler(repoSyncController.triggerSync.bind(repoSyncController)),
);
repoSyncRoutes.get(
  "/status",
  requireAuth,
  asyncHandler(repoSyncController.getStatuses.bind(repoSyncController)),
);
