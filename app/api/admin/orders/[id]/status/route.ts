import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

/**
 * PUT /api/admin/orders/[id]/status
 *
 * Body: { status: OrderStatus, paymentStatus?: PaymentStatus, notes?: string }
 * Admin-only: change an order's status (and optionally payment status).
 * Records the change in OrderStatusLog with the admin's userId.
 */
const ALLOWED_STATUS: OrderStatus[] = [
  "CONFIRMED",
  "IN_REVIEW",
  "REVISION_NEEDED",
  "APPROVED",
  "PRINTING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];
const ALLOWED_PAYMENT: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    status?: string;
    paymentStatus?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newStatus = body.status;
  if (!newStatus || !ALLOWED_STATUS.includes(newStatus as OrderStatus)) {
    return NextResponse.json(
      { error: "Valid `status` is required" },
      { status: 400 }
    );
  }

  const newPaymentStatus = body.paymentStatus;
  if (
    newPaymentStatus !== undefined &&
    !ALLOWED_PAYMENT.includes(newPaymentStatus as PaymentStatus)
  ) {
    return NextResponse.json(
      { error: "Invalid `paymentStatus`" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, paymentStatus: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const data: Prisma.OrderUpdateInput = {
    status: newStatus as OrderStatus,
  };
  if (newPaymentStatus) {
    data.paymentStatus = newPaymentStatus as PaymentStatus;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: newStatus as OrderStatus,
          changedBy: session.user.id,
          notes: body.notes?.slice(0, 1000) ?? null,
        },
      });
      // Mirror Payment.status if the admin tweaked payment manually.
      if (newPaymentStatus) {
        await tx.payment.update({
          where: { orderId: order.id },
          data: { status: newPaymentStatus as PaymentStatus },
        });
      }
    });
  } catch (err) {
    console.error("[/api/admin/orders/[id]/status]", err);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
