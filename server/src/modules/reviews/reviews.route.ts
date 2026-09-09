import { Router } from "express";
import ReviewsController from "./reviews.controller.js";
import ReviewsService from "./reviews.service.js";
import ReviewsRepository from "./reviews.repository.js";
import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

export const reviewRoutes = Router();

const reviewsRepository = new ReviewsRepository();
const githubRepository = new GithubRepository();
const billingRepository = new BillingRepository();
const reviewsService = new ReviewsService(reviewsRepository, githubRepository, billingRepository);
const reviewsController = new ReviewsController(reviewsService);

reviewRoutes.post(
  "/webhook",
  asyncHandler(reviewsController.handleWebhook.bind(reviewsController)),
);
reviewRoutes.get(
  "/",
  requireAuth,
  asyncHandler(reviewsController.listReviews.bind(reviewsController)),
);
reviewRoutes.post(
  "/trigger",
  requireAuth,
  asyncHandler(reviewsController.triggerReview.bind(reviewsController)),
);
