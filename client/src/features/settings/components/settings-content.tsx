import { format } from "date-fns";
import { UpgradeButton } from "@/features/billing/components/upgrade-button";
import { CancelSubscriptionButton } from "@/features/billing/components/cancel-subscription-button";
import type { UserSubscription, UsageSummary } from "@/features/dashboard/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

type SettingsProfile = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  memberSince?: string;
};

type SettingsContentProps = {
  profile: SettingsProfile;
  subscription: UserSubscription;
  usage: UsageSummary;
};

const PLAN_FEATURES = {
  free: [
    "Up to 5 automated pull request reviews per month",
    "Basic code analysis and quality feedback",
    "Single branch vector repository indexing",
  ],
  pro: [
    "Unlimited automated pull request reviews",
    "Deep contextual codebase RAG retrieval",
    "Real-time GitHub webhook notifications",
    "Priority support & higher token limits",
  ],
};

function ProfileTab({ profile }: { profile: SettingsProfile }) {
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Account information from your GitHub authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {profile.image ? (
              <AvatarImage src={profile.image} alt={profile.name} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" defaultValue={profile.name} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={profile.email} readOnly />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Profile details are managed by GitHub. Update them in your GitHub account settings.
        </p>
      </CardFooter>
    </Card>
  );
}

function SubscriptionTab({
  subscription,
  usage,
}: {
  subscription: UserSubscription;
  usage: UsageSummary;
}) {
  const isPro = subscription.plan === "pro";
  const renewsDate = subscription.renewsAt
    ? format(new Date(subscription.renewsAt), "MMMM d, yyyy")
    : null;

  const usagePercent =
    usage.limit !== null ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Subscription & Usage</CardTitle>
            <CardDescription>
              Manage your billing plan and review usage limits.
            </CardDescription>
          </div>
          <Badge
            variant={isPro ? "default" : "outline"}
            className={isPro ? "bg-emerald-600 text-white" : ""}
          >
            {isPro ? "Pro Plan" : "Free Tier"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 bg-muted/20 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monthly AI Reviews Used</span>
            <span className="text-sm font-semibold">
              {usage.limit === null ? `${usage.used} (Unlimited)` : `${usage.used} / ${usage.limit}`}
            </span>
          </div>
          {usage.limit !== null && (
            <Progress value={usagePercent} className="h-2" />
          )}
          {renewsDate && (
            <span className="text-xs text-muted-foreground">
              Renews on {renewsDate}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Plan Features</h4>
          <ul className="space-y-2">
            {(isPro ? PLAN_FEATURES.pro : PLAN_FEATURES.free).map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        {!isPro ? (
          <UpgradeButton />
        ) : (
          <CancelSubscriptionButton
            disabled={subscription.status === "canceled"}
          />
        )}
      </CardFooter>
    </Card>
  );
}

export function SettingsContent({
  profile,
  subscription,
  usage,
}: SettingsContentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <Tabs defaultValue="profile" className="w-full max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription & Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab subscription={subscription} usage={usage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
