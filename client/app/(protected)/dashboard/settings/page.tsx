"use client";

import { useQuery } from "@tanstack/react-query";
import { SettingsContent } from "@/features/dashboard/components/settings-content";
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

export default function SettingsPage() {
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
    name: session?.user?.name || "User",
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile, review limits, and billing subscription.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 max-w-3xl rounded-lg" />
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
