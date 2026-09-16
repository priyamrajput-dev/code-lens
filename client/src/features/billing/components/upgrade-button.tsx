import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type RazorpayCheckout = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayCheckout;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeButton() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Failed to load payment checkout. Please check your internet connection.");
        return;
      }

      const res = await apiFetch<{ subscriptionId: string; keyId: string }>("/api/billing/subscribe", {
        method: "POST",
      });

      if (!res.data?.subscriptionId) {
        throw new Error("Failed to initialize subscription");
      }

      const checkout = new window.Razorpay({
        key: res.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: res.data.subscriptionId,
        name: "CodeLens",
        description: "Pro Plan — Unlimited AI PR Code Reviews",
        handler: () => {
          toast.success("Payment successful! Your Pro plan is now active.");
          queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
      });

      checkout.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start checkout.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      variant="brand"
      size="lg"
      className="font-semibold gap-2 shadow-sm cursor-pointer rounded-xl"
    >
      <Sparkles className="size-4" />
      {loading ? "Opening checkout…" : "Upgrade to Pro"}
    </Button>
  );
}
