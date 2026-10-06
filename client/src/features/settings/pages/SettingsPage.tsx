import { useQuery } from "@tanstack/react-query";
import { SettingsContent } from "../components/settings-content";
import { apiFetch } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import type { UserSubscription, UsageSummary, GithubInstallationStatus } from "@/features/dashboard/lib/types";

type SettingsApiResponse = {
  user: {
    id: string;
    plan: "free" | "pro";
    subscriptionStatus?: string | null;
    subscriptionRenewsAt?: string | null;
  };
  subscription: UserSubscription;
  usage: UsageSummary;
  githubStatus: GithubInstallationStatus;
};

export function SettingsPage() {
  const { data: session } = useSession();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await apiFetch<SettingsApiResponse>("/api/settings");
      return res.data;
    },
  });

  const profile = {
    id: session?.user?.id || settingsData?.user?.id || "",
    name: session?.user?.name || "Developer",
    email: session?.user?.email || "",
    image: session?.user?.image,
  };

  const subscription: UserSubscription = settingsData?.subscription || {
    plan: "free",
    status: "active",
    renewsAt: null,
  };

  const usage: UsageSummary = settingsData?.usage || {
    used: 0,
    limit: 5,
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1.5">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-foreground font-semibold">Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account profile, review quota limits, and billing subscription.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-3xl rounded-2xl" />
      ) : (
        <SettingsContent
          profile={profile}
          subscription={subscription}
          usage={usage}
        />
      )}
    </div>
  );
}
