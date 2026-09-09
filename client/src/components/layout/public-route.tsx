import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export function PublicRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
