import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { ReviewActions } from "@/components/graphics/ReviewActions";
import { displayDesignName } from "@/lib/blank-inkjet";

interface Props {
  params: { orderId: string };
}

export const dynamic = "force-dynamic";

export default async function GraphicsReviewPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      design: {
        select: {
          id: true,
          name: true,
          previewUrl: true,
          status: true,
          notes: true,
          updatedAt: true,
        },
      },
      address: true,
      statusLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!order) notFound();

  // Inkjet doesn't go through graphics — bounce away if someone navigates here.
  if (order.printerType === "INKJET") {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-border bg-white p-10 text-center">
        <h1 className="font-display text-xl font-bold text-text-primary">
          Inkjet orders skip review
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Inkjet cards are blank and go straight to the printer queue.
        </p>
        <Link
          href="/graphics"
          className="mt-6 inline-block text-sm font-semibold text-orange hover:underline"
        >
          ← Back to review queue
        </Link>
      </div>
    );
  }

  const isPending = order.status === "CONFIRMED" || order.status === "IN_REVIEW";

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/graphics"
        className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-orange"
      >
        ← Review queue
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2 font-mono text-text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Big design preview */}
        <div className="rounded-card border border-border bg-white p-4">
          <div className="overflow-hidden rounded-md bg-bg-page">
            {order.design.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.design.previewUrl}
                alt={order.design.name}
                className="aspect-[1.6/1] w-full object-contain"
              />
            ) : (
              <div className="flex aspect-[1.6/1] w-full items-center justify-center text-sm uppercase tracking-widest text-text-muted">
                Design has no preview yet
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
            <span>
              Design:{" "}
              <span className="font-semibold text-text-primary">
                {displayDesignName(order.design.name)}
              </span>
            </span>
            <Link
              href={`/designer/${order.design.id}`}
              className="font-semibold text-orange hover:underline"
            >
              Open in designer ↗
            </Link>
          </div>
        </div>

        {/* Side panel — customer / specs / current notes */}
        <div className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Customer
            </div>
            <div className="mt-2 text-sm">
              <div className="font-semibold text-text-primary">
                {order.user.name}
              </div>
              <div className="text-text-muted">{order.user.email}</div>
              {order.user.phone && (
                <div className="text-text-muted">{order.user.phone}</div>
              )}
            </div>
          </div>

          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Specs
            </div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row label="Quantity" value={`${order.quantity} cards`} />
              <Row label="Printer" value={order.printerType} />
              <Row label="Material" value={order.material} />
              <Row label="Finish" value={order.finish} />
              <Row label="Chip" value={order.chipType} />
              <Row label="Side" value={order.printSide} />
              <Row label="Order total" value={formatINR(order.totalPrice)} />
            </dl>
          </div>

          {order.design.notes && (
            <div className="rounded-card border border-border bg-white p-5">
              <div className="text-xs uppercase tracking-widest text-text-muted">
                Previous notes
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-body">
                {order.design.notes}
              </p>
            </div>
          )}

          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Ship to
            </div>
            <div className="mt-2 text-sm leading-relaxed text-text-primary">
              <div className="font-semibold">{order.address.name}</div>
              <div>{order.address.line1}</div>
              {order.address.line2 && <div>{order.address.line2}</div>}
              <div>
                {order.address.city}, {order.address.state} {order.address.pincode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision card */}
      <div className="mt-8">
        <ReviewActions orderId={order.id} isPending={isPending} />
      </div>

      {/* Recent log */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">
          Recent activity
        </h2>
        {order.statusLogs.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white p-5 text-sm text-text-muted">
            No log entries yet.
          </div>
        ) : (
          <ol className="space-y-2">
            {order.statusLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-baseline justify-between rounded-card border border-border bg-white px-4 py-3 text-sm"
              >
                <div className="flex items-baseline gap-3">
                  <StatusBadge status={log.status} />
                  {log.notes && (
                    <span className="text-text-body">{log.notes}</span>
                  )}
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
