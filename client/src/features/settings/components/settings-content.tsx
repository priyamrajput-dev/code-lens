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
import { Check, ShieldCheck, Zap } from "lucide-react";

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
    <Card className="rounded-2xl border-border/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Developer Profile</CardTitle>
        <CardDescription>
          Account information linked through GitHub OAuth authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-border/80 shadow-sm">
            {profile.image ? (
              <AvatarImage src={profile.image} alt={profile.name} />
            ) : null}
            <AvatarFallback className="text-base font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-bold text-lg text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{profile.email}</p>
          </div>
        </div>
        <Separator className="bg-border/70" />
        <div className="grid gap-4 max-w-md">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Display name</Label>
            <Input id="name" defaultValue={profile.name} readOnly className="bg-muted/40 font-medium" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
            <Input id="email" type="email" defaultValue={profile.email} readOnly className="bg-muted/40 font-mono text-xs" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary-bg/50 border-t border-border/60 py-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          Profile identity verified by GitHub OAuth.
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
    <Card className="rounded-2xl border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Subscription & Quota</CardTitle>
            <CardDescription>
              Manage your billing plan and review usage limits.
            </CardDescription>
          </div>
          <Badge
            variant={isPro ? "success" : "brand"}
            className="text-xs font-semibold"
          >
            {isPro ? "Pro Tier" : "Free Tier"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border/80 p-5 bg-secondary-bg/60 flex flex-col gap-3.5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Monthly AI Reviews Used</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {usage.limit === null ? `${usage.used} (Unlimited)` : `${usage.used} / ${usage.limit}`}
            </span>
          </div>
          {usage.limit !== null && (
            <Progress value={usagePercent} className="h-2 rounded-full" />
          )}
          {renewsDate && (
            <span className="text-[11px] text-muted-foreground font-mono">
              Renews on {renewsDate}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono">Plan Features</h4>
          <ul className="space-y-2.5">
            {(isPro ? PLAN_FEATURES.pro : PLAN_FEATURES.free).map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Check className="size-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 pt-2">
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
        <TabsList className="mb-6 bg-card/80 border border-border/80 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg text-xs">Profile</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-lg text-xs">Subscription & Quota</TabsTrigger>
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
