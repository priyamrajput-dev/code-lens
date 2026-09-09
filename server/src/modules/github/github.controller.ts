import type { Request, Response } from "express";
import GithubService from "./github.service.js";
import AppResponse from "../../common/utils/app-response.js";
import { saveInstallationSchema, getReposQuerySchema } from "./github.validation.js";
import { ValidationError, UnauthorizedError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";

class GithubController {
  constructor(private readonly githubService: GithubService) {}

  private parseSaveBody(body: unknown) {
    const parsed = saveInstallationSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseReposQuery(query: unknown) {
    const parsed = getReposQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  async getStatus(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const status = await this.githubService.getInstallationStatus(req.session.user.id);
    AppResponse.ok(res, "GitHub status retrieved", status);
  }

  async saveInstallation(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const { installationId } = this.parseSaveBody(req.body);
    const installation = await this.githubService.saveInstallation(
      req.session.user.id,
      installationId,
    );
    AppResponse.created(res, "GitHub installation saved", installation);
  }

  async deleteInstallation(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    await this.githubService.deleteInstallation(req.session.user.id);
    AppResponse.ok(res, "GitHub installation removed");
  }

  async listRepos(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const { page } = this.parseReposQuery(req.query);
    const reposPage = await this.githubService.getRepos(req.session.user.id, page);
    AppResponse.ok(res, "Repositories retrieved", reposPage);
  }
}

export default GithubController;
