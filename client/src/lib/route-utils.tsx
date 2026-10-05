import React, { Component, type ReactNode } from "react";

export const routeLoaders = {
  landing: () => import("@/features/landing/pages/LandingPage").then((m) => ({ default: m.LandingPage })),
  signIn: () => import("@/features/auth/pages/SignInPage").then((m) => ({ default: m.SignInPage })),
  overview: () => import("@/features/dashboard/pages/OverviewPage").then((m) => ({ default: m.OverviewPage })),
  repos: () => import("@/features/repos/pages/ReposPage").then((m) => ({ default: m.ReposPage })),
  github: () => import("@/features/github/pages/GithubPage").then((m) => ({ default: m.GithubPage })),
  history: () => import("@/features/history/pages/ReviewHistoryPage").then((m) => ({ default: m.ReviewHistoryPage })),
  settings: () => import("@/features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
};

export type RouteKey = keyof typeof routeLoaders;

export function preloadRoute(key: RouteKey) {
  try {
    const loader = routeLoaders[key];
    if (loader) {
      loader();
    }
  } catch {
    // Ignore prefetch failures
  }
}

export function routePreloadProps(key: RouteKey) {
  return {
    onMouseEnter: () => preloadRoute(key),
    onFocus: () => preloadRoute(key),
  };
}

export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      const component = await factory();
      sessionStorage.removeItem("chunk_retry_pending");
      return component;
    } catch (error) {
      const retryPending = sessionStorage.getItem("chunk_retry_pending");
      if (!retryPending) {
        sessionStorage.setItem("chunk_retry_pending", "true");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChunkErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chunk load error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    sessionStorage.removeItem("chunk_retry_pending");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Update Available</h3>
            <p className="text-xs text-muted-foreground">
              A newer version of the application is available. Please reload to load the latest changes.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
