"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Lock, Unlock, Star, Search } from "lucide-react";
import { SyncRepoButton } from "@/features/repo-sync/components/sync-repo-button";
import type { DashboardRepo, RepoSyncStatus } from "../lib/types";
import { apiFetch } from "@/lib/api-client";

type Filter = "all" | "public" | "private";

export function RepoList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const { data: reposData, isLoading, isError } = useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const res = await apiFetch<{ repos: DashboardRepo[]; totalCount: number }>("/api/github/repos?page=1");
      return res.data;
    },
  });

  const rawRepos = reposData?.repos || [];

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
    return rawRepos.map((repo) => ({
      ...repo,
      syncStatus: syncStatuses?.[repo.fullName] || null,
    }));
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="public">Public ({counts.public})</TabsTrigger>
            <TabsTrigger value="private">Private ({counts.private})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading repositories…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Failed to load repositories. Please ensure GitHub App is installed.
                </TableCell>
              </TableRow>
            ) : visibleRepos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No repositories found.
                </TableCell>
              </TableRow>
            ) : (
              visibleRepos.map((repo) => (
                <TableRow key={repo.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{repo.name}</span>
                      <span className="text-xs text-muted-foreground">{repo.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 font-normal text-xs">
                      {repo.visibility === "private" ? (
                        <Lock className="size-3 text-amber-500" />
                      ) : (
                        <Unlock className="size-3 text-emerald-500" />
                      )}
                      {repo.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {repo.defaultBranch}
                  </TableCell>
                  <TableCell className="text-xs">
                    {repo.language ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 text-amber-500" />
                      {repo.stars}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
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
