import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/resend";

/**
 * POST /api/graphics/orders/[id]/approve
 *
 * Graphics or Admin approves a design.
 * Atomic write:
 *   - Order.status        → APPROVED
 *   - Design.status       → APPROVED
 *   - OrderStatusLog       row with reviewer id
 *   - PrintJob upsert      (QUEUED) so it appears in the printer queue
 *
 * Idempotent on already-APPROVED orders.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      designId: true,
      printerType: true,
      printJob: { select: { id: true } },
      user: { select: { email: true, name: true } },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.printerType === "INKJET") {
    return NextResponse.json(
      { error: "Inkjet orders don't need design approval" },
      { status: 400 }
    );
  }
  if (
    order.status === "CANCELLED" ||
    order.status === "REFUNDED" ||
    order.status === "DELIVERED"
  ) {
    return NextResponse.json(
      { error: "Order is no longer reviewable" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "APPROVED" },
      });
      await tx.design.update({
        where: { id: order.designId },
        data: { status: "APPROVED" },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: "APPROVED",
          changedBy: session.user.id,
          notes: "Design approved by graphics",
        },
      });
      // Queue a print job. Upsert in case one already existed.
      if (order.printJob) {
        await tx.printJob.update({
          where: { id: order.printJob.id },
          data: { status: "QUEUED" },
        });
      } else {
        await tx.printJob.create({
          data: { orderId: order.id, status: "QUEUED" },
        });
      }
    });
  } catch (err) {
    console.error("[/api/graphics/orders/[id]/approve]", err);
    return NextResponse.json(
      { error: "Failed to approve order" },
      { status: 500 }
    );
  }

  // Notify the customer (non-blocking).
  try {
    await sendOrderEmail({
      to: order.user.email,
      orderNumber: order.orderNumber,
      status: "APPROVED",
      customerName: order.user.name,
    });
  } catch (mailErr) {
    console.warn("Approval email failed (non-fatal):", mailErr);
  }

  return NextResponse.json({ ok: true });
}
