import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code2,
  FolderGit2,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PullRequestReview } from "@/features/history/pages/ReviewHistoryPage";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";

export function OverviewPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Developer";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const { data: reviews = [] } = useQuery<PullRequestReview[]>({
    queryKey: ["reviews-history"],
    queryFn: async () => {
      const res = await apiFetch<PullRequestReview[]>("/api/reviews");
      return res.data || [];
    },
  });

  const { data: statusData } = useQuery<GithubInstallationStatus>({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await apiFetch<GithubInstallationStatus>("/api/github/status");
      return res.data ?? {
        connected: false,
        accountLogin: null,
        installedAt: null,
      };
    },
  });

  const isConnected = statusData?.connected === true;
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Greeting & Quick Review CTA Banner */}
      <div className="rounded-xl border border-border bg-card/60 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono tracking-wide uppercase border-[#C86B16]/30 text-[#C86B16] dark:text-[#D9781C] bg-[#C86B16]/10">
              Developer Workspace
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">CodeLens v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {userName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ready to review some code? Run an instant analysis or monitor incoming pull requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/dashboard/repos">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 shadow-sm text-xs cursor-pointer">
              <FolderGit2 className="size-4" />
              Manage Repositories
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
          <Link to="/dashboard/github">
            <Button size="lg" variant="outline" className="border-border text-foreground text-xs cursor-pointer">
              GitHub App Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Reviews Run
            </CardTitle>
            <Sparkles className="size-4 text-[#C86B16] dark:text-[#D9781C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {reviews.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automated PR & live snippet evaluations
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              GitHub Status
            </CardTitle>
            <GitPullRequest className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {isConnected ? "Active" : "Off"}
              </span>
              <span className={isConnected ? "size-2 rounded-full bg-emerald-500" : "size-2 rounded-full bg-amber-500"} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isConnected ? `@${statusData?.accountLogin} linked` : "App not connected"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Vector Indexing
            </CardTitle>
            <Zap className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              Pinecone
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Codebase-aware RAG vector search
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              AI Engine
            </CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              Gemini 2.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Flash multi-pass static analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews & Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Pull Request Reviews</h2>
            <p className="text-xs text-muted-foreground">
              Recent code reviews posted to GitHub pull requests automatically.
            </p>
          </div>

          <Link to="/dashboard/history" className="text-xs text-[#C86B16] dark:text-[#D9781C] hover:underline font-medium inline-flex items-center gap-1">
            View All History
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <Card className="border-dashed border-border text-center p-8 bg-card/40">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Clock className="size-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">No recent pull request reviews</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Reviews will automatically populate here when pull requests are opened or synchronized on your linked GitHub repositories.
              </p>
              <div className="pt-3">
                <Link to="/dashboard/repos">
                  <Button size="sm" variant="outline" className="text-xs">
                    Connect Repositories →
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-card p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-foreground/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="size-4 text-[#C86B16] dark:text-[#D9781C]" />
                    <span className="font-semibold text-sm text-foreground truncate max-w-lg">
                      {review.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      PR #{review.prNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <span>{review.repoFullName}</span>
                    <span>•</span>
                    <span>@{review.authorLogin || "developer"}</span>
                    <span>•</span>
                    <span>
                      {review.reviewedAt
                        ? formatDistanceToNow(new Date(review.reviewedAt), { addSuffix: true })
                        : "recently"}
                    </span>
                  </div>
                </div>

                <Link to="/dashboard/history" className="shrink-0">
                  <Button size="xs" variant="outline" className="text-xs border-border hover:bg-muted">
                    View Details →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <Card className="border-border bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground tracking-tight">
            Getting Started with Automated Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-xs">1. Install GitHub App</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Connect your personal GitHub account or organization and select repositories to monitor.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-xs">2. Index Repository Codebases</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Click &quot;Sync&quot; on your repositories in the Repositories tab to create a Pinecone vector index for codebase-aware PR feedback.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-xs">3. Open a Pull Request</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Whenever a PR is opened or updated on GitHub, CodeLens automatically analyzes the diff and posts structured feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
