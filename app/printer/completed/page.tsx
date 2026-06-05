import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconCircleCheck } from "@tabler/icons-react";
import { displayDesignName } from "@/lib/blank-inkjet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Completed jobs — Printer" };

export default async function CompletedJobsPage() {
  const jobs = await prisma.printJob.findMany({
    where: { status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          quantity: true,
          user: { select: { name: true, email: true } },
          design: { select: { name: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> PRINTER / COMPLETED
      </span>
      <h1 className="h2 mt-3 text-text-primary">Completed jobs</h1>

      <div className="mt-8">
        {jobs.length === 0 ? (
          <EmptyState
            icon={<IconCircleCheck size={22} />}
            title="No completed jobs yet"
            body="Jobs you mark as completed move here for your records."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Design</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Completed</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr
                    key={j.id}
                    className="border-t border-border transition hover:bg-bg-page"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/printer/jobs/${j.id}`}
                        className="font-mono font-semibold text-orange hover:underline"
                      >
                        {j.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <div className="font-medium">{j.order.user.name}</div>
                      <div className="text-xs text-text-muted">
                        {j.order.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {displayDesignName(j.order.design.name)}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {j.order.quantity}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(j.updatedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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
