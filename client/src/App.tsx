import { useEffect, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/protected-route";
import { PublicRoute } from "./components/layout/public-route";
import {
  lazyWithRetry,
  preloadRoute,
  ChunkErrorBoundary,
} from "./lib/route-utils";
import { PageFallback, RouteSkeleton } from "./components/layout/route-fallbacks";

const LandingPage = lazyWithRetry(() =>
  import("./features/landing/pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const SignInPage = lazyWithRetry(() =>
  import("./features/auth/pages/SignInPage").then((m) => ({ default: m.SignInPage }))
);
const OverviewPage = lazyWithRetry(() =>
  import("./features/dashboard/pages/OverviewPage").then((m) => ({ default: m.OverviewPage }))
);
const ReposPage = lazyWithRetry(() =>
  import("./features/repos/pages/ReposPage").then((m) => ({ default: m.ReposPage }))
);
const GithubPage = lazyWithRetry(() =>
  import("./features/github/pages/GithubPage").then((m) => ({ default: m.GithubPage }))
);
const ReviewHistoryPage = lazyWithRetry(() =>
  import("./features/history/pages/ReviewHistoryPage").then((m) => ({ default: m.ReviewHistoryPage }))
);
const SettingsPage = lazyWithRetry(() =>
  import("./features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

export function App() {
  useEffect(() => {
    const scheduleIdle =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1500);

    const handle = scheduleIdle(() => {
      preloadRoute("signIn");
      preloadRoute("overview");
    });

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle as number);
      } else {
        clearTimeout(handle as any);
      }
    };
  }, []);

  return (
    <ChunkErrorBoundary>
      <Routes>
        {/* Public Pages */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageFallback />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/review" element={<Navigate to="/" replace />} />
        <Route
          path="/history"
          element={
            <Suspense fallback={<PageFallback />}>
              <ReviewHistoryPage />
            </Suspense>
          }
        />

        {/* Public Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route
            path="/sign-in"
            element={
              <Suspense fallback={<PageFallback />}>
                <SignInPage />
              </Suspense>
            }
          />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<RouteSkeleton />}>
                <OverviewPage />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/repos"
            element={
              <Suspense fallback={<RouteSkeleton />}>
                <ReposPage />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/github"
            element={
              <Suspense fallback={<RouteSkeleton />}>
                <GithubPage />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <Suspense fallback={<RouteSkeleton />}>
                <ReviewHistoryPage />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <Suspense fallback={<RouteSkeleton />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChunkErrorBoundary>
  );
}

export default App;
