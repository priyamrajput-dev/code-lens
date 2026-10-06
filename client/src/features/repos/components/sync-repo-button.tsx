import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { RepoSyncStatus } from "@/features/dashboard/lib/types";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2 } from "lucide-react";

type SyncRepoButtonProps = {
  repoFullName: string;
  branch: string;
  syncStatus?: RepoSyncStatus | null;
};

export const SyncRepoButton = ({
  repoFullName,
  branch,
  syncStatus,
}: SyncRepoButtonProps) => {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      return await apiFetch("/api/repo-sync", {
        method: "POST",
        body: JSON.stringify({ repoFullName, branch }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      queryClient.invalidateQueries({ queryKey: ["repo-sync-statuses"] });
      toast.success(`Vector sync triggered for ${repoFullName}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync: ${error.message}`);
    },
  });

  const isSyncing =
    syncMutation.isPending || syncStatus === "pending" || syncStatus === "syncing";

  return (
    <Button
      size="xs"
      variant={syncStatus === "synced" ? "outline" : syncStatus === "failed" ? "destructive" : "brand"}
      disabled={isSyncing}
      onClick={() => syncMutation.mutate()}
      className="gap-1.5 h-7 text-[11px] font-medium cursor-pointer rounded-lg shadow-2xs"
    >
      {isSyncing ? (
        <>
          <RefreshCw className="size-3 animate-spin text-amber-400" />
          Syncing…
        </>
      ) : syncStatus === "synced" ? (
        <>
          <CheckCircle2 className="size-3 text-emerald-500" />
          Re-sync
        </>
      ) : syncStatus === "failed" ? (
        <>
          <RefreshCw className="size-3" />
          Retry Sync
        </>
      ) : (
        <>
          <RefreshCw className="size-3" />
          Sync Index
        </>
      )}
    </Button>
  );
};
