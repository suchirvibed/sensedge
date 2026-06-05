"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCreditCard } from "@tabler/icons-react";

// ─── Razorpay JS types ───────────────────────────────────
interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler?: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}
type RazorpayConstructor = new (opts: RazorpayOptions) => RazorpayInstance;

let scriptPromise: Promise<void> | null = null;
function ensureRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Razorpay script"));
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

interface Props {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}

export function RetryPaymentButton({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      // Stub fallback — verify with no-op signature so dev mode succeeds.
      if (data.stub) {
        const v = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: `stub_retry_${Date.now()}`,
            razorpay_signature: "stub_signature_accept_in_dev",
          }),
        });
        const vd = await v.json();
        if (!v.ok) throw new Error(vd.error || "Stub verify failed");
        router.refresh();
        return;
      }

      await ensureRazorpayScript();
      const Ctor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (!Ctor) throw new Error("Razorpay script unavailable");
      const rzp = new Ctor({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "PrintCard",
        description: `Retry payment for ${orderNumber}`,
        order_id: data.razorpay_order_id,
        prefill: { name: customerName, email: customerEmail },
        theme: { color: "#E85D04" },
        handler: async (response) => {
          try {
            const v = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vd = await v.json();
            if (!v.ok) {
              setError(vd.error || "Verification failed");
              setBusy(false);
              return;
            }
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. You can try again any time.");
            setBusy(false);
          },
        },
      });
      rzp.open();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={retry}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-btn bg-orange px-4 text-sm font-semibold text-white transition hover:bg-orange-dark disabled:opacity-60"
      >
        <IconCreditCard size={16} />
        {busy ? "Opening payment…" : "Retry payment"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-tint-redText">{error}</p>
      )}
    </div>
  );
}
