import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/resend";
import type {
  OrderStatus,
  PrintJobStatus,
  Prisma,
} from "@prisma/client";

/**
 * PUT /api/printer/jobs/[id]/status
 *
 * Body: { status: PrintJobStatus, notes?: string }
 * Printer or Admin only.
 *
 * Side effects (single transaction):
 *   PrintJob.status = body.status
 *   PrintJob.notes  ← appended when provided
 *   Order.status mirrors where it makes sense:
 *       PRINTING   → Order.PRINTING
 *       COMPLETED  → Order.DISPATCHED
 *       ISSUE      → Order.status unchanged
 *   OrderStatusLog entry written for printable transitions.
 */
const ALLOWED: PrintJobStatus[] = ["QUEUED", "PRINTING", "COMPLETED", "ISSUE"];

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!["PRINTER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const status = body.status;
  if (!status || !ALLOWED.includes(status as PrintJobStatus)) {
    return NextResponse.json(
      { error: "Valid `status` is required" },
      { status: 400 }
    );
  }
  const newStatus = status as PrintJobStatus;
  const notes = body.notes?.trim();

  const job = await prisma.printJob.findUnique({
    where: { id: params.id },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });
  if (!job) {
    return NextResponse.json({ error: "Print job not found" }, { status: 404 });
  }

  // Decide whether to mirror Order.status.
  let mirroredOrderStatus: OrderStatus | null = null;
  if (newStatus === "PRINTING") mirroredOrderStatus = "PRINTING";
  if (newStatus === "COMPLETED") mirroredOrderStatus = "DISPATCHED";

  try {
    await prisma.$transaction(async (tx) => {
      const jobData: Prisma.PrintJobUpdateInput = { status: newStatus };
      if (notes) jobData.notes = notes.slice(0, 2000);
      if (newStatus !== "QUEUED") {
        jobData.assignedTo = session.user.id;
      }
      await tx.printJob.update({ where: { id: job.id }, data: jobData });

      if (mirroredOrderStatus) {
        await tx.order.update({
          where: { id: job.order.id },
          data: { status: mirroredOrderStatus },
        });
        await tx.orderStatusLog.create({
          data: {
            orderId: job.order.id,
            status: mirroredOrderStatus,
            changedBy: session.user.id,
            notes:
              newStatus === "PRINTING"
                ? "Print job started"
                : "Print job completed — dispatched for delivery",
          },
        });
      } else if (newStatus === "ISSUE") {
        // Don't change Order.status, but log it so the timeline reflects it.
        await tx.orderStatusLog.create({
          data: {
            orderId: job.order.id,
            status: job.order.status,
            changedBy: session.user.id,
            notes: notes
              ? `Print job flagged: ${notes}`
              : "Print job flagged with an issue",
          },
        });
      }
    });
  } catch (err) {
    console.error("[/api/printer/jobs/[id]/status]", err);
    return NextResponse.json(
      { error: "Could not update job" },
      { status: 500 }
    );
  }

  // Customer notification on transitions that they care about.
  if (mirroredOrderStatus) {
    try {
      await sendOrderEmail({
        to: job.order.user.email,
        orderNumber: job.order.orderNumber,
        status: mirroredOrderStatus,
        customerName: job.order.user.name,
      });
    } catch (mailErr) {
      console.warn("Print-job email failed (non-fatal):", mailErr);
    }
  }

  return NextResponse.json({ ok: true });
}
