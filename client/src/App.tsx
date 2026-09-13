import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/protected-route";
import { PublicRoute } from "./components/layout/public-route";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { CodeReviewPage } from "./features/code-review/pages/CodeReviewPage";
import { ReviewHistoryPage } from "./features/history/pages/ReviewHistoryPage";
import { SignInPage } from "./features/auth/pages/SignInPage";
import { OverviewPage } from "./features/dashboard/pages/OverviewPage";
import { ReposPage } from "./features/repos/pages/ReposPage";
import { GithubPage } from "./features/github/pages/GithubPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";

export function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/review" element={<Navigate to="/" replace />} />
      <Route path="/history" element={<ReviewHistoryPage />} />

      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/dashboard/repos" element={<ReposPage />} />
        <Route path="/dashboard/github" element={<GithubPage />} />
        <Route path="/dashboard/history" element={<ReviewHistoryPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
