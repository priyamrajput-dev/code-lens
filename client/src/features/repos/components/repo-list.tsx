import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, Star, Search, RefreshCw } from "lucide-react";
import { SyncRepoButton } from "./sync-repo-button";
import type { DashboardRepo, RepoSyncStatus, GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { apiFetch } from "@/lib/api-client";
import { GitHubIcon } from "@/features/auth/components/github-sign-in-form";

type Filter = "all" | "public" | "private";

export function RepoList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await apiFetch<GithubInstallationStatus>("/api/github/status");
      return res.data;
    },
  });

  const isConnected = statusData?.connected === true;

  const { data: reposData, isLoading: isReposLoading, isError } = useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const res = await apiFetch<{ repos: DashboardRepo[]; totalCount: number }>("/api/github/repos?page=1");
      return res.data;
    },
    enabled: isConnected,
  });

  const isLoading = isStatusLoading || (isConnected && isReposLoading);
  const rawRepos = isConnected ? reposData?.repos || [] : [];

  const { data: syncStatuses } = useQuery({
    queryKey: ["repo-sync-statuses", rawRepos.map((r) => r.fullName)],
    queryFn: async () => {
      if (rawRepos.length === 0) return {};
      const params = new URLSearchParams();
      rawRepos.forEach((r) => params.append("repos", r.fullName));
      const res = await apiFetch<Record<string, RepoSyncStatus>>(`/api/repo-sync/status?${params.toString()}`);
      return res.data || {};
    },
    enabled: rawRepos.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isAnySyncing = Object.values(data).some(
        (status) => status === "pending" || status === "syncing"
      );
      return isAnySyncing ? 2000 : false;
    },
  });

  const repos = useMemo(() => {
    return [...rawRepos]
      .map((repo) => ({
        ...repo,
        syncStatus: syncStatuses?.[repo.fullName] || null,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [rawRepos, syncStatuses]);

  const visibleRepos = useMemo(() => {
    const query = search.toLowerCase();
    return repos.filter((repo) => {
      if (filter !== "all" && repo.visibility !== filter) return false;
      if (query && !repo.fullName.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [repos, filter, search]);

  const counts = {
    all: repos.length,
    public: repos.filter((r) => r.visibility === "public").length,
    private: repos.filter((r) => r.visibility === "private").length,
  };

  if (!isStatusLoading && !isConnected) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Repositories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your GitHub repositories for automated PR reviews.
          </p>
        </div>

        <Card className="border-dashed border-border/60 bg-card/50 text-center p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="size-16 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/60">
              <GitHubIcon className="size-8 text-muted-foreground/60" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                GitHub App Not Connected
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Connect your GitHub account or organization to view, manage, and sync your repositories for automated AI reviews.
              </p>
            </div>
            <Link to="/dashboard/github">
              <Button size="lg" variant="brand" className="font-semibold rounded-xl">
                Connect GitHub App
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Repositories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Installed repositories available for automated PR reviews and vector codebase indexing.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="bg-card/60 border border-border/60 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="public" className="rounded-lg text-xs">Public ({counts.public})</TabsTrigger>
            <TabsTrigger value="private" className="rounded-lg text-xs">Private ({counts.private})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            className="pl-9 bg-card/70 border-border/60 focus:ring-2 focus:ring-amber-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Repositories Table */}
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary-bg/40">
              <TableRow>
                <TableHead className="font-mono text-xs">Repository</TableHead>
                <TableHead className="font-mono text-xs">Visibility</TableHead>
                <TableHead className="font-mono text-xs hidden sm:table-cell">Branch</TableHead>
                <TableHead className="font-mono text-xs">Language</TableHead>
                <TableHead className="text-right font-mono text-xs">Stars</TableHead>
                <TableHead className="text-right font-mono text-xs hidden sm:table-cell">Updated</TableHead>
                <TableHead className="text-right font-mono text-xs">Vector Index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Skeleton className="h-4 w-48" />
                      <div className="grid grid-cols-7 gap-4 w-full">
                        <Skeleton className="h-3 col-span-2" />
                        <Skeleton className="h-3" />
                        <Skeleton className="h-3 hidden sm:block" />
                        <Skeleton className="h-3" />
                        <Skeleton className="h-3" />
                        <Skeleton className="h-3 hidden sm:block" />
                        <Skeleton className="h-3" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-destructive">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="size-6 animate-spin opacity-50" />
                      <span>Failed to load repositories</span>
                      <Link to="/dashboard/github">
                        <Button variant="outline" size="sm">Retry connection</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : visibleRepos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Search className="size-6 opacity-50" />
                      <span className="text-sm">No repositories found</span>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRepos.map((repo) => (
                  <TableRow key={repo.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-sm text-foreground">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-sm text-foreground">{repo.name}</span>
                        <span className="text-xs text-muted-foreground/70 hidden sm:inline">•</span>
                        <span className="text-xs text-muted-foreground font-mono">{repo.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 font-normal text-xs rounded-lg">
                        {repo.visibility === "private" ? (
                          <>
                            <Lock className="size-3 text-amber-500" />
                            <span className="hidden sm:inline">Private</span>
                            <span className="sm:hidden">🔒</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="size-3 text-emerald-500" />
                            <span className="hidden sm:inline">Public</span>
                            <span className="sm:hidden">🔓</span>
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">
                      <span className="bg-muted/60 px-2 py-0.5 rounded border border-border/60 font-mono">
                        {repo.defaultBranch}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {repo.language ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-amber-500/80" />
                          {repo.language}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground font-mono">
                        <Star className="size-3 text-amber-500 fill-amber-500/20" />
                        {repo.stars}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground font-mono hidden sm:table-cell">
                      {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <SyncRepoButton
                        repoFullName={repo.fullName}
                        branch={repo.defaultBranch}
                        syncStatus={repo.syncStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
