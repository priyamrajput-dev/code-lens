export type RepoSyncStatus = "pending" | "syncing" | "synced" | "failed";

export type RepoVisibility = "public" | "private";

export type DashboardRepo = {
  id: string;
  name: string;
  fullName: string;
  visibility: RepoVisibility;
  defaultBranch: string;
  updatedAt: string;
  language: string | null;
  stars: number;
  syncStatus?: RepoSyncStatus | null;
};

export type GithubInstallationStatus = {
  connected: boolean;
  accountLogin: string | null;
  installedAt: string | null;
  installationId?: number | null;
  installUrl?: string;
};

export type SubscriptionPlan = "free" | "pro";

export type UserSubscription = {
  plan: SubscriptionPlan;
  status: "active" | "canceled" | "trialing";
  renewsAt: string | null;
};

export type UsageSummary = {
  used: number;
  limit: number | null;
};
