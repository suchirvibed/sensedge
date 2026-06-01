import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker";

interface Props {
  params: { id: string };
  searchParams: { placed?: string };
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      design: { select: { id: true, name: true, previewUrl: true } },
      address: true,
      payment: true,
      statusLogs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order || order.userId !== session.user.id) notFound();

  const justPlaced = searchParams.placed === "1";

  return (
    <div className="mx-auto max-w-4xl">
      {justPlaced && (
        <div className="mb-6 rounded-card border border-tint-greenText/20 bg-tint-green/40 px-5 py-4">
          <div className="font-display text-lg font-bold tracking-tight text-tint-greenText">
            🎉 Order placed!
          </div>
          <div className="mt-1 text-sm text-text-body">
            We&apos;ve emailed a confirmation to{" "}
            <span className="font-semibold">{session.user.email}</span>. You can
            track this order&apos;s status here at any time.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-orange"
          >
            ← Back to orders
          </Link>
          <h1 className="h2 mt-3 font-mono text-text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              dateStyle: "long",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left — design + specs */}
        <div className="rounded-card border border-border bg-white p-6">
          <div className="text-xs uppercase tracking-widest text-text-muted">
            Design
          </div>

          <div className="mt-4 flex gap-5">
            <div className="aspect-[1.6/1] w-32 flex-none overflow-hidden rounded-md bg-bg-page">
              {order.design.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.design.previewUrl}
                  alt={order.design.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-text-muted">
                  No preview
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-text-primary">{order.design.name}</div>
              <Link
                href={`/designer/${order.design.id}`}
                className="mt-1 inline-block text-sm font-semibold text-orange hover:underline"
              >
                Open in designer →
              </Link>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <Spec label="Quantity" value={`${order.quantity} cards`} />
            <Spec label="Material" value={order.material} />
            <Spec label="Finish" value={order.finish} />
            <Spec label="Chip" value={order.chipType} />
            <Spec label="Side" value={order.printSide} />
            <Spec label="Printer" value={order.printerType} />
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
                tone={order.paymentStatus === "PAID" ? "green" : "amber"}
                className="uppercase"
              >
                {order.paymentStatus}
              </Badge>
            </div>
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
                value={order.shippingPrice === 0 ? "Free" : formatINR(order.shippingPrice)}
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
