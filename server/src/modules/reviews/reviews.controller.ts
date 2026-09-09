import type { Request, Response } from "express";
import ReviewsService from "./reviews.service.js";
import AppResponse from "../../common/utils/app-response.js";
import { getGithubApp } from "../../lib/github-app.js";
import { UnauthorizedError, BadRequestError } from "../../common/utils/app-error.js";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  async handleWebhook(req: Request, res: Response) {
    const rawPayload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const eventName = req.headers["x-github-event"] as string | undefined;

    if (signature) {
      try {
        const app = getGithubApp();
        const isValid = await app.webhooks.verify(rawPayload, signature);
        if (!isValid) {
          throw new BadRequestError("Invalid webhook signature");
        }
      } catch (err) {
        throw new BadRequestError("Webhook verification failed");
      }
    }

    if (eventName !== "pull_request") {
      return AppResponse.ok(res, "Event ignored");
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!REVIEWABLE_ACTIONS.includes(event.action)) {
      return AppResponse.ok(res, "Action not reviewable");
    }

    const result = await this.reviewsService.handleWebhookPayload(event);
    return AppResponse.ok(res, "Webhook processed", result);
  }

  async listReviews(req: Request, res: Response) {
    const repoFullName = req.query.repo as string;
    if (!repoFullName) {
      throw new BadRequestError("repo query parameter is required");
    }

    const reviews = await this.reviewsService.listReviewsForRepo(repoFullName);
    AppResponse.ok(res, "Reviews retrieved", reviews);
  }

  async triggerReview(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const { pullRequestId } = req.body as { pullRequestId: string };
    if (!pullRequestId) {
      throw new BadRequestError("pullRequestId is required");
    }

    await this.reviewsService.processReview(pullRequestId);
    AppResponse.ok(res, "Review triggered");
  }
}

export default ReviewsController;
