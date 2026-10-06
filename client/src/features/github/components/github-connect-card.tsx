import { useState } from "react";
import { ExternalLink, Unplug, CheckCircle2, ShieldCheck } from "lucide-react";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

type GithubConnectCardProps = {
  installation: GithubInstallationStatus;
};

export function GithubConnectCard({ installation }: GithubConnectCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { connected, accountLogin, installUrl } = installation;

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/github/installation", { method: "DELETE" });
      toast.success("GitHub App disconnected successfully");
      queryClient.setQueryData(["github-status"], {
        connected: false,
        accountLogin: null,
        installedAt: null,
        installationId: null,
        installUrl: installUrl || installation.installUrl,
      });
      queryClient.setQueryData(["repos"], { repos: [], totalCount: 0 });
      await queryClient.invalidateQueries({ queryKey: ["github-status"] });
      await queryClient.invalidateQueries({ queryKey: ["repos"] });
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("max-w-2xl rounded-2xl shadow-xs transition-all", connected ? "border-emerald-500/40 bg-card/80" : "border-border/80 bg-card/80")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-xl border shadow-2xs",
                connected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : "border-border/80 bg-muted text-muted-foreground",
              )}
            >
              <GitHubIcon className="size-5" />
            </span>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">GitHub App Integration</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Install the CodeLens GitHub App on your account or organization to enable automated PR reviews.
              </CardDescription>
            </div>
          </div>
          <Badge variant={connected ? "success" : "outline"} className="shrink-0 text-xs">
            {connected && <CheckCircle2 className="size-3 mr-1" />}
            {connected ? "Connected" : "Not connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              Active Webhook Integration
            </p>
            <p className="leading-relaxed">
              Installed for <span className="font-semibold text-emerald-500 font-mono">@{accountLogin}</span>. CodeLens monitors incoming pull requests and posts intelligent review comments directly to your repo.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Access public and private repositories you select
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Receive real-time webhooks for pull request changes
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Post AI-generated code review feedback on PRs
            </li>
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3 pt-2">
        {connected ? (
          <>
            {installation.installationId && (
              <a
                href={`https://github.com/settings/installations/${installation.installationId}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline" className="font-medium gap-2 rounded-xl">
                  <GitHubIcon className="size-3.5" />
                  Configure Repositories on GitHub
                  <ExternalLink className="size-3 opacity-80" />
                </Button>
              </a>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1.5 cursor-pointer rounded-xl font-medium"
              onClick={handleDisconnect}
              disabled={loading}
            >
              <Unplug className="size-3.5" />
              Disconnect GitHub App
            </Button>
          </>
        ) : (
          <a
            href={installUrl || "https://github.com/apps/code-lens-ai-code-reviewer/installations/new"}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="lg" variant="brand" className="font-semibold gap-2 rounded-xl shadow-sm">
              <GitHubIcon className="size-4" />
              Install GitHub App
              <ExternalLink className="size-3.5 opacity-90" />
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
