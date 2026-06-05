import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PrintJobActions } from "@/components/printer/PrintJobActions";
import { displayDesignName } from "@/lib/blank-inkjet";

interface Props {
  params: { jobId: string };
}

export const dynamic = "force-dynamic";

export default async function PrintJobDetailPage({ params }: Props) {
  const job = await prisma.printJob.findUnique({
    where: { id: params.jobId },
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
          design: {
            select: { id: true, name: true, previewUrl: true, canvasJson: true },
          },
          address: true,
          statusLogs: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      },
    },
  });
  if (!job) notFound();

  const isInkjet = job.order.printerType === "INKJET";
  const designLabel = displayDesignName(job.order.design.name);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/printer"
        className="text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-orange"
      >
        ← Job queue
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2 font-mono text-text-primary">
            {job.order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Job · {job.id} · Created{" "}
            {new Date(job.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone="neutral" className="uppercase">
            {job.status}
          </Badge>
          <StatusBadge status={job.order.status} />
        </div>
      </div>

      {/* Job actions */}
      <div className="mt-8">
        <PrintJobActions jobId={job.id} currentStatus={job.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Big design preview */}
        <div className="rounded-card border border-border bg-white p-4">
          <div className="overflow-hidden rounded-md bg-bg-page">
            {isInkjet ? (
              <div className="flex aspect-[1.6/1] w-full flex-col items-center justify-center bg-white p-6 text-center">
                <Badge tone="orange" className="mb-3 uppercase">
                  Inkjet
                </Badge>
                <div className="font-display text-base font-bold text-text-primary">
                  Blank PVC card
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-text-muted">
                  No design — feed blank stock
                </div>
              </div>
            ) : job.order.design.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.order.design.previewUrl}
                alt={designLabel}
                className="aspect-[1.6/1] w-full object-contain"
              />
            ) : (
              <div className="flex aspect-[1.6/1] w-full items-center justify-center text-sm uppercase tracking-widest text-text-muted">
                Design has no preview
              </div>
            )}
          </div>
          {!isInkjet && (
            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>
                Design:{" "}
                <span className="font-semibold text-text-primary">
                  {designLabel}
                </span>
              </span>
              <a
                href={`data:application/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(job.order.design.canvasJson, null, 2)
                )}`}
                download={`${job.order.orderNumber}-design.json`}
                className="font-semibold text-orange hover:underline"
              >
                Download canvas JSON ↓
              </a>
            </div>
          )}
        </div>

        {/* Side panel — customer / specs */}
        <div className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Customer
            </div>
            <div className="mt-2 text-sm">
              <div className="font-semibold text-text-primary">
                {job.order.user.name}
              </div>
              <div className="text-text-muted">{job.order.user.email}</div>
              {job.order.user.phone && (
                <div className="text-text-muted">{job.order.user.phone}</div>
              )}
            </div>
          </div>

          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Print specs
            </div>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row label="Quantity" value={`${job.order.quantity} cards`} />
              <Row label="Printer" value={job.order.printerType} />
              <Row label="Material" value={job.order.material} />
              <Row label="Finish" value={job.order.finish} />
              <Row label="Chip" value={job.order.chipType} />
              <Row label="Side" value={job.order.printSide} />
            </dl>
          </div>

          <div className="rounded-card border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-widest text-text-muted">
              Ship to
            </div>
            <div className="mt-2 text-sm leading-relaxed text-text-primary">
              <div className="font-semibold">{job.order.address.name}</div>
              <div>{job.order.address.line1}</div>
              {job.order.address.line2 && <div>{job.order.address.line2}</div>}
              <div>
                {job.order.address.city}, {job.order.address.state}{" "}
                {job.order.address.pincode}
              </div>
              <div className="mt-1 text-text-muted">{job.order.address.phone}</div>
            </div>
          </div>

          {job.notes && (
            <div className="rounded-card border border-tint-redText/30 bg-tint-red/40 p-5">
              <div className="text-xs uppercase tracking-widest text-tint-redText">
                Job notes
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text-primary">
                {job.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">
          Recent activity
        </h2>
        {job.order.statusLogs.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white p-5 text-sm text-text-muted">
            No log entries yet.
          </div>
        ) : (
          <ol className="space-y-2">
            {job.order.statusLogs.map((log) => (
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
