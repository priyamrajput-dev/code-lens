import { useState } from "react";
import { ExternalLink, Unplug } from "lucide-react";
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
    <Card className={cn("max-w-2xl transition-colors", connected ? "border-emerald-500/30" : "border-border")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border",
                connected
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-muted",
              )}
            >
              <GitHubIcon />
            </span>
            <div>
              <CardTitle className="text-lg">GitHub App</CardTitle>
              <CardDescription>
                Install the CodeLens GitHub App on your account or organization to enable automated PR reviews.
              </CardDescription>
            </div>
          </div>
          <Badge variant={connected ? "default" : "outline"} className={connected ? "bg-emerald-600 text-white" : ""}>
            {connected ? "Connected" : "Not connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <p className="text-sm text-muted-foreground">
            Installed for{" "}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              @{accountLogin}
            </span>
            . CodeLens can read repository changes and post intelligent review comments directly on pull requests.
          </p>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Access public and private repositories you select</li>
            <li>Receive real-time webhooks for pull request changes</li>
            <li>Post AI-generated code review feedback on PRs</li>
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        {connected ? (
          <>
            {installation.installationId && (
              <a
                href={`https://github.com/settings/installations/${installation.installationId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-sm cursor-pointer"
              >
                <GitHubIcon />
                Configure Repositories on GitHub
                <ExternalLink className="size-3 opacity-80" />
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 cursor-pointer"
              onClick={handleDisconnect}
              disabled={loading}
            >
              <Unplug className="size-4" />
              Disconnect GitHub App
            </Button>
          </>
        ) : (
          <a
            href={installUrl || "https://github.com/apps/code-lens-ai-code-reviewer/installations/new"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <GitHubIcon />
            Install GitHub App
            <ExternalLink className="size-3 opacity-80" />
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
