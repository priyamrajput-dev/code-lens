import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/protected-route";
import { PublicRoute } from "./components/layout/public-route";
import { SignInPage } from "./features/auth/pages/SignInPage";
import { OverviewPage } from "./features/dashboard/pages/OverviewPage";
import { ReposPage } from "./features/repos/pages/ReposPage";
import { GithubPage } from "./features/github/pages/GithubPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";

export function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/dashboard/repos" element={<ReposPage />} />
        <Route path="/dashboard/github" element={<GithubPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>

      {/* Root and Fallback redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
