import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { repoSync } from "../../db/schema.js";

export type RepoSyncRecord = typeof repoSync.$inferSelect;

class RepoSyncRepository {
  async findByRepoFullName(repoFullName: string) {
    const [record] = await db
      .select()
      .from(repoSync)
      .where(eq(repoSync.repoFullName, repoFullName))
      .limit(1);
    return record || null;
  }

  async findByRepoFullNames(repoFullNames: string[]) {
    if (repoFullNames.length === 0) return [];
    return await db
      .select()
      .from(repoSync)
      .where(inArray(repoSync.repoFullName, repoFullNames));
  }

  async upsertRepoSync(
    installationId: number,
    repoFullName: string,
    branch: string,
    status: string = "pending",
  ) {
    const [record] = await db
      .insert(repoSync)
      .values({
        installationId,
        repoFullName,
        branch,
        status,
      })
      .onConflictDoUpdate({
        target: repoSync.repoFullName,
        set: {
          installationId,
          branch,
          status,
          updatedAt: new Date(),
        },
      })
      .returning();

    return record;
  }

  async updateSyncStatus(
    id: string,
    status: string,
    chunkCount?: number,
    syncedAt?: Date,
  ) {
    const [record] = await db
      .update(repoSync)
      .set({
        status,
        ...(chunkCount !== undefined ? { chunkCount } : {}),
        ...(syncedAt ? { syncedAt } : {}),
        updatedAt: new Date(),
      })
      .where(eq(repoSync.id, id))
      .returning();

    return record;
  }
}

export default RepoSyncRepository;
