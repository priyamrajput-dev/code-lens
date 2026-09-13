import { Router } from "express";
import GithubController from "./github.controller.js";
import GithubService from "./github.service.js";
import GithubRepository from "./github.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

import ReviewsController from "../reviews/reviews.controller.js";
import ReviewsService from "../reviews/reviews.service.js";
import ReviewsRepository from "../reviews/reviews.repository.js";
import BillingRepository from "../billing/billing.repository.js";

export const githubRoutes = Router();

const githubRepository = new GithubRepository();
const githubService = new GithubService(githubRepository);
const githubController = new GithubController(githubService);

const reviewsRepository = new ReviewsRepository();
const billingRepository = new BillingRepository();
const reviewsService = new ReviewsService(reviewsRepository, githubRepository, billingRepository);
const reviewsController = new ReviewsController(reviewsService);

githubRoutes.post(
  "/webhook",
  asyncHandler(reviewsController.handleWebhook.bind(reviewsController)),
);

githubRoutes.get(
  "/status",
  requireAuth,
  asyncHandler(githubController.getStatus.bind(githubController)),
);
githubRoutes.post(
  "/installation",
  requireAuth,
  asyncHandler(githubController.saveInstallation.bind(githubController)),
);
githubRoutes.delete(
  "/installation",
  requireAuth,
  asyncHandler(githubController.deleteInstallation.bind(githubController)),
);
githubRoutes.get(
  "/repos",
  requireAuth,
  asyncHandler(githubController.listRepos.bind(githubController)),
);
githubRoutes.get(
  "/callback",
  asyncHandler(githubController.handleCallback.bind(githubController)),
);
