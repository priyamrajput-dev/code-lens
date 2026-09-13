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
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-accent-brand/20">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-30 mask-radial-hero pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C86B16]/10 dark:bg-[#D9781C]/8 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Bar with Back and Theme Switcher */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="size-3.5" />
          Back to Home
        </Link>
        <ModeToggle />
      </header>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="border-border bg-card/85 backdrop-blur-md shadow-xl">
          <CardHeader className="items-center text-center pb-4">
            <div className="mb-4 flex justify-center pt-2">
              <BrandLogo size={42} showText={false} />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Sign in to CodeLens to review code and manage repository integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <GithubSignInForm callbackUrl={callbackUrl} />
                  <div className="mt-4 flex items-start gap-2 text-left p-2.5 rounded-lg border border-border/60 bg-secondary-bg/50">
                    <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <FieldDescription className="text-[11px] text-muted-foreground leading-snug">
                      We only request basic read permissions required to authenticate your identity. You can revoke access anytime in your GitHub account.
                    </FieldDescription>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6 font-mono">
          CodeLens • AI-Powered Code Reviewer
        </p>
      </div>
    </div>
  );
}
