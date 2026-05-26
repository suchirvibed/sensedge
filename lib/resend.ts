// Resend email stub.
// To wire up: $ npm install resend
// Then replace with: const resend = new Resend(process.env.RESEND_API_KEY!)

import type { OrderStatus } from "@prisma/client";

export const resendConfigured = Boolean(process.env.RESEND_API_KEY);

const SUBJECTS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Order {{orderNumber}} confirmed — PrintCard",
  IN_REVIEW: "Your design is being reviewed",
  REVISION_NEEDED: "Action needed: revision requested for order {{orderNumber}}",
  APPROVED: "Your design is approved and heading to print!",
  PRINTING: "Your cards are being printed",
  DISPATCHED: "Your order has been shipped",
  DELIVERED: "Your order has been delivered",
};

export interface OrderEmailInput {
  to: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  notes?: string;
}

export async function sendOrderEmail(input: OrderEmailInput): Promise<{ ok: boolean }> {
  const subject = (SUBJECTS[input.status] ?? "Order update").replace(
    "{{orderNumber}}",
    input.orderNumber
  );

  if (!resendConfigured) {
    // dev: log to console instead of sending
    console.log("[email:stub]", {
      to: input.to,
      subject,
      orderNumber: input.orderNumber,
      status: input.status,
      notes: input.notes,
    });
    return { ok: true };
  }

  throw new Error(
    "Resend not implemented. Install `resend` and replace this stub."
  );
}
