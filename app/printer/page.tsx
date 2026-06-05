import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconPrinter } from "@tabler/icons-react";
import { displayDesignName } from "@/lib/blank-inkjet";

export const dynamic = "force-dynamic";

export default async function PrinterQueuePage() {
  const jobs = await prisma.printJob.findMany({
    where: { status: { in: ["QUEUED", "PRINTING", "ISSUE"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 200,
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          quantity: true,
          material: true,
          finish: true,
          chipType: true,
          printSide: true,
          printerType: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          design: { select: { name: true, previewUrl: true } },
        },
      },
    },
  });

  const counts = {
    queued: jobs.filter((j) => j.status === "QUEUED").length,
    printing: jobs.filter((j) => j.status === "PRINTING").length,
    issue: jobs.filter((j) => j.status === "ISSUE").length,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> PRINTER
      </span>
      <h1 className="h2 mt-3 text-text-primary">Job queue</h1>
      <p className="mt-2 text-sm text-text-muted">
        Approved orders ready to print. Mark each job as printing, then
        completed once the cards are off the press.
      </p>

      {/* Mini counts */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <CountTile label="Queued" value={counts.queued} tone="amber" />
        <CountTile label="Printing" value={counts.printing} tone="blue" />
        <CountTile label="Issue" value={counts.issue} tone="red" />
      </div>

      <div className="mt-8">
        {jobs.length === 0 ? (
          <EmptyState
            icon={<IconPrinter size={22} />}
            title="No active print jobs"
            body="Once graphics approves designs, they'll queue up here."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Job / Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Design</th>
                  <th className="px-4 py-3 text-left font-semibold">Specs</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Job</th>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-t border-border transition hover:bg-bg-page"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/printer/jobs/${job.id}`}
                        className="font-mono font-semibold text-orange hover:underline"
                      >
                        {job.order.orderNumber}
                      </Link>
                      <div className="mt-0.5 text-[10px] text-text-muted">
                        Job · {job.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <div className="font-medium">{job.order.user.name}</div>
                      <div className="text-xs text-text-muted">
                        {job.order.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {displayDesignName(job.order.design.name)}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {job.order.printerType} · {job.order.material} ·{" "}
                      {job.order.finish} · {job.order.chipType} ·{" "}
                      {job.order.printSide}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {job.order.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <PrintJobBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CountTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "red";
}) {
  const toneCls = {
    amber: "bg-tint-amber text-tint-amberText",
    blue: "bg-tint-blue text-tint-blueText",
    red: "bg-tint-red text-tint-redText",
  }[tone];
  return (
    <div className="flex items-center justify-between rounded-card border border-border bg-white p-5">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-muted">
          {label}
        </div>
        <div className="mt-1 font-display text-2xl font-extrabold text-text-primary">
          {value}
        </div>
      </div>
      <span
        className={`flex h-9 px-3 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-widest ${toneCls}`}
      >
        {label}
      </span>
    </div>
  );
}

function PrintJobBadge({ status }: { status: string }) {
  const map: Record<string, "amber" | "blue" | "green" | "red"> = {
    QUEUED: "amber",
    PRINTING: "blue",
    COMPLETED: "green",
    ISSUE: "red",
  };
  return <Badge tone={map[status] ?? "neutral"}>{status}</Badge>;
}
