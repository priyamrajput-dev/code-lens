"use client";

import { useQuery } from "@tanstack/react-query";
import { GithubConnectCard } from "@/features/github/components/github-connect-card";
import { apiFetch } from "@/lib/api-client";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function GithubPage() {
  const { data: status, isLoading } = useQuery({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await apiFetch<GithubInstallationStatus>("/api/github/status");
      return res.data;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub App</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your GitHub App connection and webhook integration.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 max-w-2xl rounded-lg" />
      ) : (
        <GithubConnectCard
          installation={
            status || {
              connected: false,
              accountLogin: null,
              installedAt: null,
            }
          }
        />
      )}
    </div>
  );
}
