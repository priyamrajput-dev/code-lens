import type { Request, Response } from "express";
import RepoSyncService from "./repo-sync.service.js";
import AppResponse from "../../common/utils/app-response.js";
import { triggerRepoSyncSchema, getRepoSyncStatusSchema } from "./repo-sync.validation.js";
import { ValidationError, UnauthorizedError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";

class RepoSyncController {
  constructor(private readonly repoSyncService: RepoSyncService) {}

  private parseTriggerBody(body: unknown) {
    const parsed = triggerRepoSyncSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseStatusQuery(query: unknown) {
    const parsed = getRepoSyncStatusSchema.safeParse(query);
    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  async triggerSync(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const input = this.parseTriggerBody(req.body);
    const syncRecord = await this.repoSyncService.triggerSync(
      req.session.user.id,
      input.repoFullName,
      input.branch,
      input.installationId,
    );
    AppResponse.ok(res, "Repository sync triggered", syncRecord);
  }

  async getStatuses(req: Request, res: Response) {
    const { repos } = this.parseStatusQuery(req.query);
    const statuses = await this.repoSyncService.getStatuses(repos);
    AppResponse.ok(res, "Sync statuses retrieved", statuses);
  }
}

export default RepoSyncController;
