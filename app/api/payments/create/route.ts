import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, PUBLIC_RAZORPAY_KEY_ID } from "@/lib/razorpay";

/**
 * POST /api/payments/create
 *
 * Body: { orderId }
 * Verifies the caller owns the order and the order isn't already paid,
 * then creates a Razorpay order (or stub) for it. Stores the
 * razorpayOrderId on the Payment row.
 *
 * Returns: { razorpay_order_id, amount, currency, key_id, stub }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = (await req.json()) as { orderId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.orderId || typeof body.orderId !== "string") {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    include: { payment: true },
  });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
  }
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return NextResponse.json(
      { error: "Order is no longer payable" },
      { status: 400 }
    );
  }

  try {
    const rzpOrder = await createRazorpayOrder({
      amount: Math.round(order.totalPrice * 100), // ₹ → paise
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: session.user.id,
        customer: session.user.email ?? "",
      },
    });

    if (order.payment) {
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { razorpayOrderId: rzpOrder.id },
      });
    }

    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      // Public key id — safe to send to the browser. Empty in stub mode.
      key_id: PUBLIC_RAZORPAY_KEY_ID,
      stub: rzpOrder.stub,
    });
  } catch (err) {
    console.error("[/api/payments/create]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}
