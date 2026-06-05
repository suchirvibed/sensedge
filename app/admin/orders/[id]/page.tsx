import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker";
import { OrderStatusOverride } from "@/components/admin/OrderStatusOverride";
import {
  displayDesignName,
  isBlankInkjetDesignName,
} from "@/lib/blank-inkjet";

interface Props {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      design: { select: { id: true, name: true, previewUrl: true } },
      address: true,
      payment: true,
      statusLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          // No relation on changedBy → just show id; for niceness we
          // could fetch the User. Keeping simple for now.
        },
      },
    },
  });
  if (!order) notFound();

  const isInkjet =
    order.printerType === "INKJET" ||
    isBlankInkjetDesignName(order.design.name);
  const designLabel = displayDesignName(order.design.name);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/orders"
        className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-orange"
      >
        ← All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2 font-mono text-text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
            })}{" "}
            by{" "}
            <span className="font-semibold text-text-primary">
              {order.user.name}
            </span>{" "}
            ({order.user.email})
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8">
        <OrderStatusTracker status={order.status} />
      </div>

      {/* Status override card */}
      <div className="mt-8">
        <OrderStatusOverride
          orderId={order.id}
          currentStatus={order.status}
          currentPaymentStatus={order.paymentStatus}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left — design + specs */}
        <div className="rounded-card border border-border bg-white p-6">
          <div className="text-xs uppercase tracking-widest text-text-muted">
            {isInkjet ? "Product" : "Design"}
          </div>

          <div className="mt-4 flex gap-5">
            <div className="aspect-[1.6/1] w-32 flex-none overflow-hidden rounded-md bg-bg-page">
              {isInkjet ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-white p-3 text-center">
                  <Badge tone="orange" className="mb-2 uppercase">
                    Inkjet
                  </Badge>
                  <div className="font-display text-[10px] font-bold text-text-primary">
                    Blank PVC card
                  </div>
                </div>
              ) : order.design.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.design.previewUrl}
                  alt={designLabel}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-text-muted">
                  No preview
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-text-primary">{designLabel}</div>
              {!isInkjet && (
                <Link
                  href={`/designer/${order.design.id}`}
                  className="mt-1 inline-block text-sm font-semibold text-orange hover:underline"
                >
                  Open in designer →
                </Link>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <Spec label="Quantity" value={`${order.quantity} cards`} />
            <Spec label="Printer" value={order.printerType} />
            {!isInkjet && (
              <>
                <Spec label="Material" value={order.material} />
                <Spec label="Finish" value={order.finish} />
                <Spec label="Chip" value={order.chipType} />
                <Spec label="Side" value={order.printSide} />
              </>
            )}
          </dl>
        </div>

        {/* Right — address + payment + totals */}
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-white p-6">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Shipping to
            </div>
            <div className="mt-3 text-sm leading-relaxed text-text-primary">
              <div className="font-semibold">{order.address.name}</div>
              <div className="mt-0.5">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
              </div>
              <div>
                {order.address.city}, {order.address.state} {order.address.pincode}
              </div>
              <div className="mt-1 text-text-muted">{order.address.phone}</div>
            </div>
          </div>

          <div className="rounded-card border border-border bg-white p-6">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Payment
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-text-primary">
                {order.paymentMethod === "COD"
                  ? "Cash on delivery"
                  : order.paymentMethod === "RAZORPAY"
                  ? "Razorpay"
                  : order.paymentMethod ?? "—"}
              </span>
              <Badge
                tone={
                  order.paymentStatus === "PAID"
                    ? "green"
                    : order.paymentStatus === "FAILED" ||
                      order.paymentStatus === "REFUNDED"
                    ? "red"
                    : "amber"
                }
                className="uppercase"
              >
                {order.paymentStatus}
              </Badge>
            </div>
            {order.payment?.razorpayPayId && (
              <div className="mt-3 font-mono text-[10px] tracking-widest text-text-muted">
                {order.payment.razorpayPayId}
              </div>
            )}
          </div>

          <div className="rounded-card border border-border bg-white p-6">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Totals
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Per card" value={formatINR(order.basePrice)} />
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              <Row
                label="Shipping"
                value={
                  order.shippingPrice === 0
                    ? "Free"
                    : formatINR(order.shippingPrice)
                }
              />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-xs uppercase tracking-widest text-text-muted">
                Total
              </span>
              <span className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {formatINR(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity log */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
          Activity log
        </h2>
        {order.statusLogs.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white px-6 py-8 text-center text-sm text-text-muted">
            No status changes yet.
          </div>
        ) : (
          <ol className="space-y-3">
            {order.statusLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-card border border-border bg-white p-4"
              >
                <div className="flex items-baseline justify-between">
                  <StatusBadge status={log.status} />
                  <span className="text-xs text-text-muted">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {log.notes && (
                  <p className="mt-2 text-sm text-text-body">{log.notes}</p>
                )}
                <div className="mt-2 font-mono text-[10px] text-text-muted">
                  by user {log.changedBy}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  );
}
