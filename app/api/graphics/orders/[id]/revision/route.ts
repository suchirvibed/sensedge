import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/resend";

/**
 * POST /api/graphics/orders/[id]/revision
 *
 * Graphics or Admin sends a design back for revision.
 * Body: { notes: string (required) }
 *
 * Atomic:
 *   - Order.status   → REVISION_NEEDED
 *   - Design.status  → REVISION_NEEDED
 *   - Design.notes   ← latest reviewer notes (overwrites)
 *   - OrderStatusLog with notes
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["GRAPHICS", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const notes = body.notes?.trim();
  if (!notes || notes.length < 5) {
    return NextResponse.json(
      { error: "Notes describing the required changes are required (≥5 chars)" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      designId: true,
      printerType: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.printerType === "INKJET") {
    return NextResponse.json(
      { error: "Inkjet orders don't go through review" },
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
        data: { status: "REVISION_NEEDED" },
      });
      await tx.design.update({
        where: { id: order.designId },
        data: { status: "REVISION_NEEDED", notes: notes.slice(0, 1000) },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: "REVISION_NEEDED",
          changedBy: session.user.id,
          notes: notes.slice(0, 1000),
        },
      });
    });
  } catch (err) {
    console.error("[/api/graphics/orders/[id]/revision]", err);
    return NextResponse.json(
      { error: "Could not request revision" },
      { status: 500 }
    );
  }

  try {
    await sendOrderEmail({
      to: order.user.email,
      orderNumber: order.orderNumber,
      status: "REVISION_NEEDED",
      customerName: order.user.name,
      notes,
    });
  } catch (mailErr) {
    console.warn("Revision email failed (non-fatal):", mailErr);
  }

  return NextResponse.json({ ok: true });
}
