"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your Pro subscription?")) return;

    setLoading(true);
    try {
      await apiFetch("/api/billing/cancel", { method: "POST" });
      toast.success("Subscription canceled successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={disabled || loading}
      onClick={handleCancel}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {loading ? "Canceling…" : "Cancel Subscription"}
    </Button>
  );
}
