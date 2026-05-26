import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { IconLayoutGrid, IconPackage, IconPlus, IconArrowRight } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = { title: "Dashboard — PrintCard" };

export default async function DashboardOverview() {
  const session = await auth();
  const userId = session!.user.id; // layout already guards

  // Pull stats in parallel
  const [designCount, orderCount, recentOrders] = await Promise.all([
    prisma.design.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        quantity: true,
        totalPrice: true,
        status: true,
      },
    }),
  ]);

  const firstName = session!.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-text-muted">
            <span className="text-orange">■</span> DASHBOARD
          </span>
          <h1 className="h2 mt-3 text-text-primary">Hi {firstName} 👋</h1>
          <p className="mt-2 text-sm text-text-muted">
            Pick up where you left off or start a fresh card design.
          </p>
        </div>
        <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
          <IconPlus size={16} /> New design
        </LinkButton>
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Saved designs"
          value={designCount}
          href="/dashboard/designs"
          tone="orange"
          icon={<IconLayoutGrid size={20} />}
        />
        <StatCard
          label="Orders placed"
          value={orderCount}
          href="/dashboard/orders"
          tone="blue"
          icon={<IconPackage size={20} />}
        />
        <StatCard
          label="In progress"
          value={
            recentOrders.filter((o) =>
              ["CONFIRMED", "IN_REVIEW", "APPROVED", "PRINTING", "DISPATCHED"].includes(o.status)
            ).length
          }
          href="/dashboard/orders"
          tone="purple"
          icon={<IconPackage size={20} />}
        />
      </div>

      {/* Recent orders */}
      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary">Recent orders</h2>
          {recentOrders.length > 0 && (
            <Link href="/dashboard/orders" className="text-sm font-semibold text-orange hover:underline">
              View all →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            icon={<IconPackage size={22} />}
            title="No orders yet"
            body="When you place your first order, it'll show up here with live status updates."
            action={
              <LinkButton href="/designer/new" variant="primary" showArrow>
                Design your first card
              </LinkButton>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-bg-page">
                    <td className="px-4 py-3 font-mono text-text-primary">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{o.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      ₹{o.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{o.status}</td>
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

function StatCard({
  label,
  value,
  href,
  icon,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  tone: "orange" | "blue" | "purple";
}) {
  const toneClass = {
    orange: "bg-orange-tint text-orange",
    blue: "bg-tint-blue text-tint-blueText",
    purple: "bg-tint-purple text-tint-purpleText",
  }[tone];

  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
    >
      <div>
        <div className="text-xs uppercase tracking-widest text-text-muted">{label}</div>
        <div className="mt-1 font-display text-3xl font-extrabold text-text-primary">{value}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`flex h-11 w-11 items-center justify-center rounded-card ${toneClass}`}>
          {icon}
        </span>
        <IconArrowRight
          size={16}
          className="text-text-muted opacity-0 transition group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
