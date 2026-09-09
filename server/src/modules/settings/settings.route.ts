import { Router } from "express";
import SettingsController from "./settings.controller.js";
import SettingsService from "./settings.service.js";
import GithubService from "../github/github.service.js";
import GithubRepository from "../github/github.repository.js";
import BillingService from "../billing/billing.service.js";
import BillingRepository from "../billing/billing.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

export const settingsRoutes = Router();

const githubRepository = new GithubRepository();
const githubService = new GithubService(githubRepository);
const billingRepository = new BillingRepository();
const billingService = new BillingService(billingRepository);
const settingsService = new SettingsService(githubService, billingService, billingRepository);
const settingsController = new SettingsController(settingsService);

settingsRoutes.get(
  "/",
  requireAuth,
  asyncHandler(settingsController.getSettings.bind(settingsController)),
);
