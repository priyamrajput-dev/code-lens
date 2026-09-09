"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { RepoSyncStatus } from "@/features/dashboard/lib/types";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

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
      toast.success(`Sync triggered for ${repoFullName}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync: ${error.message}`);
    },
  });

  const isSyncing =
    syncMutation.isPending || syncStatus === "pending" || syncStatus === "syncing";

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isSyncing}
      onClick={() => syncMutation.mutate()}
      className="gap-2 h-8 text-xs"
    >
      <RefreshCw className={`size-3 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing…" : syncStatus === "synced" ? "Re-sync" : "Sync"}
    </Button>
  );
};
