import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { pullRequest } from "../../db/schema.js";

export type PullRequestRecord = typeof pullRequest.$inferSelect;

class ReviewsRepository {
  async findById(id: string) {
    const [record] = await db
      .select()
      .from(pullRequest)
      .where(eq(pullRequest.id, id))
      .limit(1);
    return record || null;
  }

  async findByRepoAndPrNumber(repoFullName: string, prNumber: number) {
    const [record] = await db
      .select()
      .from(pullRequest)
      .where(
        and(
          eq(pullRequest.repoFullName, repoFullName),
          eq(pullRequest.prNumber, prNumber),
        ),
      )
      .limit(1);
    return record || null;
  }

  async findByRepoFullName(repoFullName: string) {
    return await db
      .select()
      .from(pullRequest)
      .where(eq(pullRequest.repoFullName, repoFullName))
      .orderBy(desc(pullRequest.createdAt));
  }

  async upsertPullRequest(data: {
    installationId: number;
    repoFullName: string;
    prNumber: number;
    title: string;
    authorLogin?: string | null;
    headSha: string;
    baseBranch: string;
    status?: string;
  }) {
    const [record] = await db
      .insert(pullRequest)
      .values({
        installationId: data.installationId,
        repoFullName: data.repoFullName,
        prNumber: data.prNumber,
        title: data.title,
        authorLogin: data.authorLogin ?? null,
        headSha: data.headSha,
        baseBranch: data.baseBranch,
        status: data.status ?? "pending",
      })
      .onConflictDoUpdate({
        target: [pullRequest.repoFullName, pullRequest.prNumber],
        set: {
          title: data.title,
          headSha: data.headSha,
          baseBranch: data.baseBranch,
          status: data.status ?? "pending",
          updatedAt: new Date(),
        },
      })
      .returning();

    return record;
  }

  async updateReviewResult(
    id: string,
    status: string,
    reviewComment?: string | null,
    reviewedAt?: Date,
  ) {
    const [record] = await db
      .update(pullRequest)
      .set({
        status,
        ...(reviewComment !== undefined ? { reviewComment } : {}),
        ...(reviewedAt ? { reviewedAt } : {}),
        updatedAt: new Date(),
      })
      .where(eq(pullRequest.id, id))
      .returning();

    return record;
  }
}

export default ReviewsRepository;
