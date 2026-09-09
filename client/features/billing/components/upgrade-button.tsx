"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { Sparkles } from "lucide-react";

type RazorpayCheckout = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayCheckout;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export function UpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!window.Razorpay) {
      toast.error("Checkout script is still loading, please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<{ subscriptionId: string; keyId: string }>("/api/billing/subscribe", {
        method: "POST",
      });

      if (!res.data?.subscriptionId) {
        throw new Error("Failed to initialize subscription");
      }

      const checkout = new window.Razorpay({
        key: res.data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: res.data.subscriptionId,
        name: "CodeLens",
        description: "Pro Plan — Unlimited AI PR Code Reviews",
        handler: () => {
          toast.success("Payment successful! Your Pro plan is now active.");
          router.refresh();
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
    <>
      <Script src={RAZORPAY_SCRIPT_URL} strategy="lazyOnload" />
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm"
      >
        <Sparkles className="size-4" />
        {loading ? "Opening checkout…" : "Upgrade to Pro"}
      </Button>
    </>
  );
}
