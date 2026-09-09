import type { Request, Response } from "express";
import SettingsService from "./settings.service.js";
import AppResponse from "../../common/utils/app-response.js";
import { UnauthorizedError } from "../../common/utils/app-error.js";

class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getSettings(req: Request, res: Response) {
    if (!req.session?.user?.id) throw new UnauthorizedError();
    const settings = await this.settingsService.getSettings(req.session.user.id);
    AppResponse.ok(res, "Settings retrieved", settings);
  }
}

export default SettingsController;
