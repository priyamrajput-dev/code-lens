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
import { useSearchParams } from "react-router-dom";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-6 flex justify-center pt-2">
              <img
                src="/globe.svg"
                alt="CodeLens"
                width={64}
                height={64}
                className="text-foreground"
              />
            </div>
            <CardTitle className="text-xl font-bold">Welcome to CodeLens</CardTitle>
            <CardDescription>
              Sign in with GitHub to review and manage your code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <GithubSignInForm callbackUrl={callbackUrl} />
                  <FieldDescription className="text-center mt-4 text-xs text-muted-foreground">
                    We only request the permissions needed to identify your account.
                    You can revoke access anytime from GitHub settings.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
