import { Router } from "express";
import ReviewsController from "./reviews.controller.js";
import ReviewsService from "./reviews.service.js";
import ReviewsRepository from "./reviews.repository.js";
import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";
import { createRateLimiter } from "../../common/middleware/rate-limit.middleware.js";
import { rateLimitPolicies } from "../../common/config/rate-limits.js";

export const reviewRoutes = Router();

const reviewsRepository = new ReviewsRepository();
const githubRepository = new GithubRepository();
const billingRepository = new BillingRepository();
const reviewsService = new ReviewsService(reviewsRepository, githubRepository, billingRepository);
const reviewsController = new ReviewsController(reviewsService, githubRepository);

const reviewAiLimiter = createRateLimiter({ policy: rateLimitPolicies.reviews });
const reviewReadLimiter = createRateLimiter({ policy: rateLimitPolicies.readOnly });

// Webhooks are signature-verified and exempt from rate limiting
reviewRoutes.post(
  "/webhook",
  asyncHandler(reviewsController.handleWebhook.bind(reviewsController)),
);
reviewRoutes.get(
  "/",
  requireAuth,
  reviewReadLimiter,
  asyncHandler(reviewsController.listReviews.bind(reviewsController)),
);
reviewRoutes.post(
  "/trigger",
  requireAuth,
  reviewAiLimiter,
  asyncHandler(reviewsController.triggerReview.bind(reviewsController)),
);
reviewRoutes.post(
  "/snippet",
  reviewAiLimiter,
  asyncHandler(reviewsController.analyzeSnippet.bind(reviewsController)),
);
reviewRoutes.post(
  "/analyze",
  reviewAiLimiter,
  asyncHandler(reviewsController.analyzeSnippet.bind(reviewsController)),
);

