import crypto from "crypto";
import BillingRepository, { FREE_MONTHLY_LIMIT } from "./billing.repository.js";
import { getRazorpay } from "../../lib/razorpay.js";
import { env } from "../../common/config/env.js";
import { BadRequestError, NotFoundError } from "../../common/utils/app-error.js";

export type UserSubscription = {
  plan: "free" | "pro";
  status: "active" | "canceled" | "trialing";
  renewsAt: string | null;
};

export type UsageSummary = {
  used: number;
  limit: number | null;
};

class BillingService {
  constructor(private readonly billingRepository: BillingRepository) {}

  async getUserSubscription(userId: string): Promise<UserSubscription> {
    const user = await this.billingRepository.findUserById(userId);
    if (!user) {
      return { plan: "free", status: "active", renewsAt: null };
    }

    const renewsAt = user.subscriptionRenewsAt?.toISOString() ?? null;

    if (user.plan !== "pro") {
      return { plan: "free", status: "active", renewsAt };
    }

    if (user.subscriptionStatus === "pending") {
      return { plan: "free", status: "trialing", renewsAt };
    }

    if (user.subscriptionStatus === "canceled") {
      const stillActive = user.subscriptionRenewsAt !== null && user.subscriptionRenewsAt > new Date();
      if (stillActive) {
        return { plan: "pro", status: "active", renewsAt };
      }
      return { plan: "free", status: "canceled", renewsAt };
    }

    if (user.subscriptionStatus === "active") {
      return { plan: "pro", status: "active", renewsAt };
    }

    return { plan: "free", status: "canceled", renewsAt };
  }

  async getUsageSummary(userId: string): Promise<UsageSummary> {
    const subscription = await this.getUserSubscription(userId);
    const used = await this.billingRepository.getReviewsThisMonth(userId);

    if (subscription.plan === "pro" && subscription.status === "active") {
      return { used, limit: null };
    }

    return { used, limit: FREE_MONTHLY_LIMIT };
  }

  async createProSubscription(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    if (subscription.plan === "pro" && subscription.status === "active") {
      throw new BadRequestError("You already have an active Pro subscription.");
    }

    const planId = env.RAZORPAY_PRO_PLAN_ID || "plan_dummy_id";
    const razorpay = getRazorpay();

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12,
      customer_notify: 1,
      notes: { userId },
    });

    await this.billingRepository.updateUserSubscription(userId, {
      razorpaySubscriptionId: razorpaySubscription.id,
      subscriptionStatus: "pending",
    });

    return {
      subscriptionId: razorpaySubscription.id,
      keyId: env.RAZORPAY_KEY_ID,
    };
  }

  async cancelProSubscription(userId: string) {
    const user = await this.billingRepository.findUserById(userId);
    if (!user?.razorpaySubscriptionId) {
      throw new NotFoundError("No active subscription found.");
    }

    const razorpay = getRazorpay();
    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, false);

    await this.billingRepository.updateUserSubscription(userId, {
      subscriptionStatus: "canceled",
    });

    return { success: true };
  }

  verifyWebhookSignature(body: string, signature: string | undefined): boolean {
    if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) return false;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  }

  async handleWebhook(event: {
    event: string;
    payload: {
      subscription?: {
        entity?: {
          id: string;
          status: string;
          current_end?: number;
          notes?: { userId?: string };
        };
      };
    };
  }) {
    const subscription = event.payload.subscription?.entity;
    if (!subscription) return;

    let user = subscription.notes?.userId
      ? await this.billingRepository.findUserById(subscription.notes.userId)
      : await this.billingRepository.findUserByRazorpaySubscriptionId(subscription.id);

    if (!user) return;

    if (event.event === "subscription.charged" || event.event === "subscription.activated") {
      const renewsAt = subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : null;

      await this.billingRepository.updateUserSubscription(user.id, {
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionRenewsAt: renewsAt,
      });
    } else if (event.event === "subscription.cancelled") {
      await this.billingRepository.updateUserSubscription(user.id, {
        subscriptionStatus: "canceled",
      });
    }
  }
}

export default BillingService;
