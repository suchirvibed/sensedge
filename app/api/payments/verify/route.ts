import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

/**
 * POST /api/payments/verify
 *
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * - Verifies the HMAC signature (real Razorpay) or accepts everything
 *   in stub mode.
 * - Marks Payment.status = PAID and Order.paymentStatus = PAID.
 * - Writes a status log entry so the order timeline reflects the
 *   payment.
 *
 * Returns: { ok: true } on success.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: {
    orderId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  if (
    !orderId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return NextResponse.json(
      { error: "orderId and all razorpay_* fields are required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, paymentStatus: true, payment: true },
  });
  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "PAID") {
    // Idempotent — already marked paid (e.g. webhook fired first)
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const ok = verifyRazorpaySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid payment signature" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "PAID",
          razorpayOrderId: razorpay_order_id,
          razorpayPayId: razorpay_payment_id,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paymentId: razorpay_payment_id,
        },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: "CONFIRMED",
          changedBy: userId,
          notes: "Payment received via Razorpay",
        },
      });
    });
  } catch (err) {
    console.error("[/api/payments/verify]", err);
    return NextResponse.json(
      { error: "Failed to mark order as paid" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
