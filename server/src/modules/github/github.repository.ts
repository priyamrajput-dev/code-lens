import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { githubInstallation } from "../../db/schema.js";

export type GithubInstallationRecord = typeof githubInstallation.$inferSelect;

class GithubRepository {
  async findInstallationByUserId(userId: string) {
    const [record] = await db
      .select()
      .from(githubInstallation)
      .where(eq(githubInstallation.userId, userId))
      .limit(1);
    return record || null;
  }

  async findInstallationByInstallationId(installationId: number) {
    const [record] = await db
      .select()
      .from(githubInstallation)
      .where(eq(githubInstallation.installationId, installationId))
      .limit(1);
    return record || null;
  }

  async upsertInstallation(
    userId: string,
    installationId: number,
    accountLogin: string | null,
    accountType: string | null,
  ) {
    const [record] = await db
      .insert(githubInstallation)
      .values({
        userId,
        installationId,
        accountLogin,
        accountType,
      })
      .onConflictDoUpdate({
        target: githubInstallation.userId,
        set: {
          installationId,
          accountLogin,
          accountType,
          updatedAt: new Date(),
        },
      })
      .returning();

    return record;
  }

  async deleteInstallationByUserId(userId: string) {
    return await db.delete(githubInstallation).where(eq(githubInstallation.userId, userId));
  }

  async deleteInstallationByInstallationId(installationId: number) {
    return await db.delete(githubInstallation).where(eq(githubInstallation.installationId, installationId));
  }
}

export default GithubRepository;
