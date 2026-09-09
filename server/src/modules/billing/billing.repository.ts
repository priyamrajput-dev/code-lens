import { and, count, eq, gte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { user, githubInstallation, pullRequest } from "../../db/schema.js";

export const FREE_MONTHLY_LIMIT = 5;

class BillingRepository {
  async findUserById(userId: string) {
    const [record] = await db
      .select({
        id: user.id,
        plan: user.plan,
        razorpaySubscriptionId: user.razorpaySubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionRenewsAt: user.subscriptionRenewsAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return record || null;
  }

  async updateUserSubscription(
    userId: string,
    data: {
      plan?: string;
      razorpaySubscriptionId?: string | null;
      subscriptionStatus?: string | null;
      subscriptionRenewsAt?: Date | null;
    },
  ) {
    const [record] = await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return record;
  }

  async findUserByRazorpaySubscriptionId(subscriptionId: string) {
    const [record] = await db
      .select()
      .from(user)
      .where(eq(user.razorpaySubscriptionId, subscriptionId))
      .limit(1);

    return record || null;
  }

  async getReviewsThisMonth(userId: string): Promise<number> {
    const [installation] = await db
      .select({ installationId: githubInstallation.installationId })
      .from(githubInstallation)
      .where(eq(githubInstallation.userId, userId))
      .limit(1);

    if (!installation) return 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [result] = await db
      .select({ count: count() })
      .from(pullRequest)
      .where(
        and(
          eq(pullRequest.installationId, installation.installationId),
          eq(pullRequest.status, "reviewed"),
          gte(pullRequest.reviewedAt, startOfMonth),
        ),
      );

    return result?.count ?? 0;
  }

  async canUserReview(userId: string): Promise<boolean> {
    const userRecord = await this.findUserById(userId);
    if (!userRecord) return false;

    if (userRecord.plan === "pro" && userRecord.subscriptionStatus === "active") {
      return true;
    }

    const used = await this.getReviewsThisMonth(userId);
    return used < FREE_MONTHLY_LIMIT;
  }
}

export default BillingRepository;
