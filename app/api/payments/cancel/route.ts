import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/payments/cancel
 *
 * Body: { orderId }
 * Called when the user dismisses the Razorpay modal without paying.
 * Marks the order as CANCELLED so it's clear it didn't go through;
 * the user can place a new order if they change their mind.
 *
 * Idempotent.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: body.orderId },
    select: { id: true, userId: true, status: true, paymentStatus: true },
  });
  if (!order || order.userId !== userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Don't cancel an already-paid order
  if (order.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "Order is already paid; cannot cancel from here" },
      { status: 400 }
    );
  }
  // Idempotent on already-cancelled
  if (order.status === "CANCELLED") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });
      await tx.payment.update({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          changedBy: userId,
          notes: "User dismissed payment modal",
        },
      });
    });
  } catch (err) {
    console.error("[/api/payments/cancel]", err);
    return NextResponse.json(
      { error: "Could not cancel order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
