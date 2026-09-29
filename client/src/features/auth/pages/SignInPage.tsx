import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { GithubSignInForm } from "../components/github-sign-in-form";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-amber-500/20">
      {/* Background Technical Grid & Radiant Glow */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 mask-radial-hero pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/8 dark:bg-amber-500/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Bar with Back and Theme Switcher */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium bg-card/50 px-3 py-1.5 rounded-lg border border-border/60 backdrop-blur-sm"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>
        <ModeToggle />
      </header>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="border-border/70 bg-card/90 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardHeader className="items-center text-center pb-4">
            <div className="mb-4 flex justify-center pt-2">
              <BrandLogo size={48} showText={false} variant="glow" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Welcome to CodeLens
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Sign in with GitHub to link repositories and enable autonomous AI code reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorParam && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Authentication failed</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {errorDescription ||
                      (errorParam === "state_mismatch"
                        ? "Session expired or state mismatch during GitHub OAuth. Please try signing in again."
                        : `Error: ${errorParam}`)}
                  </p>
                </div>
              </div>
            )}
            <FieldSet>
              <FieldGroup>
                <Field>
                  <GithubSignInForm callbackUrl={callbackUrl} />
                  <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-secondary-bg/50">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <FieldDescription className="text-[11px] text-muted-foreground leading-relaxed">
                      We only request basic read permissions required to authenticate your identity. You can revoke access anytime in your GitHub settings.
                    </FieldDescription>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6 font-mono">
          CodeLens • Autonomous RAG Code Reviews
        </p>
      </div>
    </div>
  );
}