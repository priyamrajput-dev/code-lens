import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
    <div className="flex flex-col gap-8 pb-10">
      {/* Top Greeting & Action Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/40 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-sm backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Badge variant="brand" className="text-[10px] font-mono tracking-wide uppercase font-semibold">
              Developer Workspace
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-mono">CodeLens v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {userName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Monitor automated pull request reviews, indexed repository namespaces, and AI codebase audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <Link to="/dashboard/repos">
            <Button size="lg" variant="brand" className="font-semibold gap-2 shadow-sm text-xs cursor-pointer rounded-xl">
              <FolderGit2 className="size-4" />
              Manage Repositories
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
          <Link to="/dashboard/github">
            <Button size="lg" variant="outline" className="border-border/80 text-foreground text-xs cursor-pointer rounded-xl">
              GitHub App Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-foreground/20 transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Reviews Run
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {reviews.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automated PR & diff evaluations
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              GitHub Status
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <GitPullRequest className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {isConnected ? "Active" : "Off"}
              </span>
              <span className={isConnected ? "size-2 rounded-full bg-emerald-500 animate-pulse" : "size-2 rounded-full bg-amber-500"} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {isConnected ? `@${statusData?.accountLogin} connected` : "App not connected"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Vector Indexing
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Zap className="size-4" />
            </div>
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

        <Card className="hover:border-foreground/20 transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              AI Engine
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <ShieldCheck className="size-4" />
            </div>
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
              Recent automated evaluations delivered directly to GitHub pull request comment threads.
            </p>
          </div>

          <Link to="/dashboard/history" className="text-xs text-amber-500 hover:text-amber-600 font-medium inline-flex items-center gap-1">
            View All History
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {recentReviews.length === 0 ? (
          <Card className="border-dashed border-border/80 text-center p-8 bg-card/40">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center mb-2">
                <Clock className="size-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-semibold text-foreground">No recent pull request reviews</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Reviews will automatically populate here when pull requests are opened or synchronized on your linked repositories.
              </p>
              <div className="pt-3">
                <Link to="/dashboard/repos">
                  <Button size="sm" variant="outline" className="text-xs rounded-lg">
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
                className="rounded-xl border border-border/80 bg-card p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-foreground/25 hover:shadow-xs transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <GitPullRequest className="size-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-sm text-foreground truncate max-w-md">
                      {review.title}
                    </span>
                    <Badge variant="success" className="text-[10px] font-mono">
                      PR #{review.prNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground flex-wrap">
                    <span className="text-foreground/80 font-medium">{review.repoFullName}</span>
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
                  <Button size="xs" variant="outline" className="text-xs border-border/80 hover:bg-muted rounded-lg">
                    View Details →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground tracking-tight">
            Getting Started with Automated Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">1. Install GitHub App</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Connect your personal GitHub account or organization and grant repository access.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">2. Index Repository Codebases</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                Click &quot;Sync&quot; on your repositories in the Repositories tab to create a Pinecone vector index for codebase-aware PR feedback.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
              <CheckCircle2 className="size-3.5" />
            </div>
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
