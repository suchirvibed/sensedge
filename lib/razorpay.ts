/**
 * Razorpay client — uses Razorpay's REST API directly (no SDK dependency).
 *
 * Modes:
 *  - configured = RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are set →
 *    real API calls + real HMAC signature verification
 *  - unconfigured (stub) = development mode, fake order ids and
 *    auto-accepting signatures so the checkout flow can be exercised
 *    end-to-end without real Razorpay credentials
 *
 * Both modes return the same shape so callers don't have to branch
 * (apart from the explicit `stub` flag for client-side UI decisions).
 */

import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const razorpayConfigured = Boolean(KEY_ID && KEY_SECRET);

export interface CreateOrderInput {
  /** Total amount in paise (₹1 = 100 paise). Must be a positive integer. */
  amount: number;
  /** Optional receipt id — we pass the orderNumber. Max 40 chars. */
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: "created" | "attempted" | "paid";
  /** True when we're in stub mode (no real Razorpay call). */
  stub: boolean;
}

interface RazorpayApiOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: "created" | "attempted" | "paid";
}

export async function createRazorpayOrder(
  input: CreateOrderInput
): Promise<RazorpayOrderResult> {
  if (!razorpayConfigured) {
    return {
      id: `rzp_stub_${Date.now()}`,
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      status: "created",
      stub: true,
    };
  }

  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt?.slice(0, 40),
      notes: input.notes,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Razorpay order create failed (${res.status}): ${errText.slice(0, 300)}`);
  }
  const body = (await res.json()) as RazorpayApiOrder;
  return {
    id: body.id,
    amount: body.amount,
    currency: body.currency,
    receipt: body.receipt,
    status: body.status,
    stub: false,
  };
}

export interface VerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function verifyRazorpaySignature(payload: VerifyPayload): boolean {
  // In stub mode, accept everything so the flow can be tested without keys.
  if (!razorpayConfigured) return true;

  // Razorpay's signed string is `order_id|payment_id`.
  // HMAC-SHA256 with the secret should match the signature.
  const expected = crypto
    .createHmac("sha256", KEY_SECRET!)
    .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
    .digest("hex");

  // Constant-time compare to avoid timing attacks
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(payload.razorpay_signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Public key id exposed to the browser. Empty string in stub mode. */
export const PUBLIC_RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
