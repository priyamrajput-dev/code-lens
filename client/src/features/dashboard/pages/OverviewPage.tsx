import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Sparkles, CheckCircle2, GitPullRequest } from "lucide-react";
import { Link } from "react-router-dom";

export function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to CodeLens. Automated AI-powered code reviews and repository intelligence.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
            <FolderGit2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sync codebases to Pinecone vector store
            </p>
            <div className="mt-3">
              <Link to="/dashboard/repos" className="text-xs text-primary hover:underline font-medium">
                View repositories →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GitHub App</CardTitle>
            <GitPullRequest className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Automated</div>
            <p className="text-xs text-muted-foreground mt-1">
              Listens for PR open & sync webhooks
            </p>
            <div className="mt-3">
              <Link to="/dashboard/github" className="text-xs text-primary hover:underline font-medium">
                Manage App →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
            <Sparkles className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RAG Powered</div>
            <p className="text-xs text-muted-foreground mt-1">
              High quality actionable PR comments
            </p>
            <div className="mt-3">
              <Link to="/dashboard/settings" className="text-xs text-primary hover:underline font-medium">
                View Usage & Plan →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these simple steps to start reviewing code automatically:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">1. Install GitHub App</p>
              <p className="text-xs text-muted-foreground">
                Connect your GitHub account or organization and select repositories to monitor.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">2. Index Repository Codebases</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Sync&quot; on your repositories to build a vector search index for codebase-aware PR feedback.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">3. Open a Pull Request</p>
              <p className="text-xs text-muted-foreground">
                Whenever a pull request is opened or updated on GitHub, CodeLens automatically generates and posts review comments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
