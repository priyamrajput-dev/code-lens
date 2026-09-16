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
import { Lock, Unlock, Star, Search, FolderGit2 } from "lucide-react";
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
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border/80 rounded-2xl bg-card/60">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted mb-4 border border-border/80 shadow-xs">
          <GitHubIcon className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-foreground">GitHub App Not Connected</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 mb-6 leading-relaxed">
          Connect your GitHub account or organization to view, manage, and sync your repositories for automated AI reviews.
        </p>
        <Link to="/dashboard/github">
          <Button size="lg" variant="brand" className="font-semibold rounded-xl">
            Connect GitHub App
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="bg-card/70 border border-border/80 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="public" className="rounded-lg text-xs">Public ({counts.public})</TabsTrigger>
            <TabsTrigger value="private" className="rounded-lg text-xs">Private ({counts.private})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories…"
            className="pl-9 bg-card/80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary-bg/50">
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Stars</TableHead>
              <TableHead className="text-right">Updated</TableHead>
              <TableHead className="text-right">Vector Index</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                  Loading repositories…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-destructive text-xs">
                  Failed to load repositories. Please ensure GitHub App is installed.
                </TableCell>
              </TableRow>
            ) : visibleRepos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                  No repositories found.
                </TableCell>
              </TableRow>
            ) : (
              visibleRepos.map((repo) => (
                <TableRow key={repo.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{repo.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{repo.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 font-normal text-xs rounded-md">
                      {repo.visibility === "private" ? (
                        <Lock className="size-3 text-amber-500" />
                      ) : (
                        <Unlock className="size-3 text-emerald-500" />
                      )}
                      <span className="capitalize">{repo.visibility}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    <span className="bg-muted/60 px-2 py-0.5 rounded border border-border/60">{repo.defaultBranch}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {repo.language ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-amber-500/80" />
                        {repo.language}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground font-mono">
                      <Star className="size-3 text-amber-500 fill-amber-500/20" />
                      {repo.stars}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
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
    </div>
  );
}
