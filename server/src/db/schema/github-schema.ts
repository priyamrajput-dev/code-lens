import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const githubInstallation = pgTable(
  "github_installation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    installationId: integer("installation_id").notNull(),
    accountLogin: text("account_login"),
    accountType: text("account_type"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  }
);

export const pullRequest = pgTable(
  "pull_request",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    installationId: integer("installation_id").notNull(),
    repoFullName: text("repo_full_name").notNull(),
    prNumber: integer("pr_number").notNull(),
    title: text("title").notNull(),
    authorLogin: text("author_login"),
    headSha: text("head_sha").notNull(),
    baseBranch: text("base_branch").notNull(),
    status: text("status").default("pending").notNull(), // pending | processing | reviewed | rate_limited
    reviewComment: text("review_comment"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("pull_request_repo_pr_idx").on(table.repoFullName, table.prNumber),
  ]
);

export const repoSync = pgTable(
  "repo_sync",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    installationId: integer("installation_id").notNull(),
    repoFullName: text("repo_full_name").notNull(),
    branch: text("branch").notNull(),
    status: text("status").default("pending").notNull(), // pending | syncing | synced | failed
    chunkCount: integer("chunk_count").default(0).notNull(),
    syncedAt: timestamp("synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("repo_sync_repo_idx").on(table.repoFullName),
  ]
);

export const userGithubRelations = relations(user, ({ one }) => ({
  githubInstallation: one(githubInstallation, {
    fields: [user.id],
    references: [githubInstallation.userId],
  }),
}));

export const githubInstallationRelations = relations(githubInstallation, ({ one }) => ({
  user: one(user, {
    fields: [githubInstallation.userId],
    references: [user.id],
  }),
}));
