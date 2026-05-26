// Razorpay stub. Wire to the real SDK once you have keys.
// $ npm install razorpay
// then replace this file with a real client + signature verification.

export const razorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

export interface CreateOrderInput {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: "created" | "attempted" | "paid";
}

export async function createRazorpayOrder(input: CreateOrderInput): Promise<RazorpayOrder> {
  if (!razorpayConfigured) {
    // dev stub — returns a fake order so checkout flow can be exercised
    return {
      id: `rzp_dev_${Date.now()}`,
      amount: input.amount,
      currency: input.currency ?? "INR",
      receipt: input.receipt,
      status: "created",
    };
  }
  throw new Error(
    "Razorpay client not implemented. Install `razorpay` and replace this stub."
  );
}

export function verifyRazorpaySignature(_payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  if (!razorpayConfigured) {
    // dev: accept everything so the flow can be tested
    return true;
  }
  throw new Error(
    "Razorpay signature verification not implemented. Use crypto.createHmac with RAZORPAY_KEY_SECRET."
  );
}
