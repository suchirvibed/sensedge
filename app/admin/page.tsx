import Link from "next/link";
import {
  IconPackage,
  IconCurrencyRupee,
  IconClipboardCheck,
  IconPrinter,
} from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/pricing";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { displayDesignName } from "@/lib/blank-inkjet";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Run all the reads in parallel so the page snaps in.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todaysOrdersCount,
    totalRevenueAgg,
    pendingReviewCount,
    activePrintJobsCount,
    recentOrders,
    totalOrdersCount,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.design.count({
      where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } },
    }),
    prisma.printJob.count({
      where: { status: { in: ["QUEUED", "PRINTING"] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        design: { select: { name: true } },
      },
    }),
    prisma.order.count(),
  ]);

  const totalRevenue = totalRevenueAgg._sum.totalPrice ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN
      </span>
      <h1 className="h2 mt-3 text-text-primary">Overview</h1>
      <p className="mt-2 text-sm text-text-muted">
        Top-level health of the platform — orders, revenue and operational queues.
      </p>

      {/* KPI grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Today's orders"
          value={String(todaysOrdersCount)}
          icon={<IconPackage size={20} />}
          tone="blue"
          href="/admin/orders"
        />
        <KpiCard
          label="Total revenue (paid)"
          value={formatINR(totalRevenue)}
          icon={<IconCurrencyRupee size={20} />}
          tone="green"
          href="/admin/orders"
        />
        <KpiCard
          label="Designs pending review"
          value={String(pendingReviewCount)}
          icon={<IconClipboardCheck size={20} />}
          tone="amber"
          href="/admin/orders?status=IN_REVIEW"
        />
        <KpiCard
          label="Active print jobs"
          value={String(activePrintJobsCount)}
          icon={<IconPrinter size={20} />}
          tone="purple"
          href="/admin/orders?status=PRINTING"
        />
      </div>

      {/* Recent orders */}
      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-orange hover:underline"
          >
            View all ({totalOrdersCount}) →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white px-6 py-12 text-center text-sm text-text-muted">
            No orders yet. Once a customer checks out, they&apos;ll show up here.
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Design</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-border transition hover:bg-bg-page"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono font-semibold text-orange hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      <div className="font-medium">{o.user.name}</div>
                      <div className="text-xs text-text-muted">{o.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {displayDesignName(o.design.name)}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{o.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {formatINR(o.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "purple";
  href: string;
}) {
  const toneClass = {
    blue: "bg-tint-blue text-tint-blueText",
    green: "bg-tint-green text-tint-greenText",
    amber: "bg-tint-amber text-tint-amberText",
    purple: "bg-tint-purple text-tint-purpleText",
  }[tone];
  return (
    <Link
      href={href}
      className="group flex items-start justify-between rounded-card border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-hover"
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-text-muted">
          {label}
        </div>
        <div className="mt-1 truncate font-display text-2xl font-extrabold text-text-primary">
          {value}
        </div>
      </div>
      <span
        className={`flex h-10 w-10 flex-none items-center justify-center rounded-card ${toneClass}`}
      >
        {icon}
      </span>
    </Link>
  );
}
