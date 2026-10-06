import { Spinner } from "@/components/ui/spinner";

export function RouteSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full" aria-busy="true" aria-label="Loading page">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-muted/60" />
          <div className="h-4 w-72 rounded-md bg-muted/40" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted/50 hidden sm:block" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border/40 bg-card/40 p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-muted/50" />
            <div className="h-7 w-16 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="h-72 rounded-xl border border-border/40 bg-card/40" />
    </div>
  );
}

export function PageFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-8" aria-busy="true">
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
