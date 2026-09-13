import type { Request, Response } from "express";
import ReviewsService from "./reviews.service.js";
import AppResponse from "../../common/utils/app-response.js";
import { getGithubApp } from "../../lib/github-app.js";
import { UnauthorizedError, BadRequestError } from "../../common/utils/app-error.js";

import GithubRepository from "../github/github.repository.js";

const REVIEWABLE_ACTIONS = ["opened", "synchronize", "reopened"];

class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly githubRepository?: GithubRepository,
  ) {}

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

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (eventName === "installation" && event.action === "deleted" && event.installation?.id) {
      if (this.githubRepository) {
        await this.githubRepository.deleteInstallationByInstallationId(event.installation.id);
      }
      return AppResponse.ok(res, "Installation deleted webhook handled");
    }

    if (eventName !== "pull_request") {
      return AppResponse.ok(res, "Event ignored");
    }

    if (!REVIEWABLE_ACTIONS.includes(event.action)) {
      return AppResponse.ok(res, "Action not reviewable");
    }

    const result = await this.reviewsService.handleWebhookPayload(event);
    return AppResponse.ok(res, "Webhook processed", result);
  }

  async listReviews(req: Request, res: Response) {
    const repoFullName = req.query.repo as string | undefined;
    if (repoFullName) {
      const reviews = await this.reviewsService.listReviewsForRepo(repoFullName);
      return AppResponse.ok(res, "Reviews retrieved", reviews);
    }

    if (!req.session?.user?.id) throw new UnauthorizedError();
    const reviews = await this.reviewsService.listReviewsForUser(req.session.user.id);
    return AppResponse.ok(res, "User reviews retrieved", reviews);
  }

  async analyzeSnippet(req: Request, res: Response) {
    const { code, language = "javascript", filename = "code.js" } = req.body as {
      code: string;
      language?: string;
      filename?: string;
    };

    if (!code || typeof code !== "string") {
      throw new BadRequestError("Code string is required");
    }

    const reviewResult = await this.reviewsService.analyzeCodeSnippet({
      code,
      language,
      filename,
    });

    return AppResponse.ok(res, "Code review generated", reviewResult);
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
