import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GithubConnectCard } from "../components/github-connect-card";
import { apiFetch } from "@/lib/api-client";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function GithubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await apiFetch<GithubInstallationStatus>("/api/github/status");
      return res.data;
    },
  });

  useEffect(() => {
    const installed = searchParams.get("installed");
    const installationId = searchParams.get("installation_id");

    if (installed === "true") {
      toast.success("GitHub App installed and connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["github-status"] });
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      setSearchParams({}, { replace: true });
    } else if (installationId) {
      // If direct frontend redirect, save installation
      apiFetch("/api/github/installation", {
        method: "POST",
        body: JSON.stringify({ installationId: Number(installationId) }),
      })
        .then(() => {
          toast.success("GitHub App connected successfully!");
          queryClient.invalidateQueries({ queryKey: ["github-status"] });
          queryClient.invalidateQueries({ queryKey: ["repos"] });
        })
        .catch((err) => {
          console.error("Error saving installation:", err);
        })
        .finally(() => {
          setSearchParams({}, { replace: true });
        });
    }
  }, [searchParams, setSearchParams, queryClient]);

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
