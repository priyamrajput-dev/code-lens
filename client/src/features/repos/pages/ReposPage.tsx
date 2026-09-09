import { RepoList } from "../components/repo-list";

export function ReposPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Installed repositories available for automated PR reviews and vector codebase indexing.
        </p>
      </div>

      <RepoList />
    </div>
  );
}
