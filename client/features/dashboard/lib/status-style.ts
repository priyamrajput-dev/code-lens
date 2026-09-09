import type { RepoSyncStatus } from "./types";

export function getSyncStatusBadgeClass(status?: RepoSyncStatus | null) {
  switch (status) {
    case "synced":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "syncing":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "pending":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "failed":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
