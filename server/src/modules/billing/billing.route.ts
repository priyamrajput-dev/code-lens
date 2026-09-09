import { Router } from "express";
import BillingController from "./billing.controller.js";
import BillingService from "./billing.service.js";
import BillingRepository from "./billing.repository.js";
import { requireAuth } from "../../common/middleware/require-auth.middleware.js";
import { asyncHandler } from "../../common/utils/aync-handler.js";

export const billingRoutes = Router();

const billingRepository = new BillingRepository();
const billingService = new BillingService(billingRepository);
const billingController = new BillingController(billingService);

billingRoutes.get(
  "/subscription",
  requireAuth,
  asyncHandler(billingController.getSubscription.bind(billingController)),
);
billingRoutes.get(
  "/usage",
  requireAuth,
  asyncHandler(billingController.getUsage.bind(billingController)),
);
billingRoutes.post(
  "/subscribe",
  requireAuth,
  asyncHandler(billingController.createSubscription.bind(billingController)),
);
billingRoutes.post(
  "/cancel",
  requireAuth,
  asyncHandler(billingController.cancelSubscription.bind(billingController)),
);
billingRoutes.post(
  "/webhook",
  asyncHandler(billingController.handleWebhook.bind(billingController)),
);
