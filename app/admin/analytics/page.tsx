import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/pricing";
import { displayDesignName } from "@/lib/blank-inkjet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — Admin" };

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const past30 = new Date(now);
  past30.setDate(past30.getDate() - 30);
  const past7 = new Date(now);
  past7.setDate(past7.getDate() - 7);

  const [
    revenue30,
    revenue7,
    orderCount30,
    orderCount7,
    topCustomers,
    statusBreakdown,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: "PAID", createdAt: { gte: past30 } },
    }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: "PAID", createdAt: { gte: past7 } },
    }),
    prisma.order.count({ where: { createdAt: { gte: past30 } } }),
    prisma.order.count({ where: { createdAt: { gte: past7 } } }),
    prisma.order.groupBy({
      by: ["userId"],
      _sum: { totalPrice: true },
      _count: { _all: true },
      where: { paymentStatus: "PAID" },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const topIds = topCustomers.map((c) => c.userId);
  const customerMap = await prisma.user.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true, email: true },
  });
  const byId = new Map(customerMap.map((u) => [u.id, u]));

  return (
    <div className="mx-auto max-w-5xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN / ANALYTICS
      </span>
      <h1 className="h2 mt-3 text-text-primary">Analytics</h1>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <PeriodCard
          label="Last 7 days"
          revenue={revenue7._sum.totalPrice ?? 0}
          orders={orderCount7}
        />
        <PeriodCard
          label="Last 30 days"
          revenue={revenue30._sum.totalPrice ?? 0}
          orders={orderCount30}
        />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          Status breakdown
        </h2>
        {statusBreakdown.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white p-6 text-sm text-text-muted">
            No orders yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {statusBreakdown.map((s) => (
              <div
                key={s.status}
                className="rounded-card border border-border bg-white p-4"
              >
                <div className="text-[10px] uppercase tracking-widest text-text-muted">
                  {s.status}
                </div>
                <div className="mt-1 font-display text-2xl font-extrabold text-text-primary">
                  {s._count._all}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          Top customers (by revenue)
        </h2>
        {topCustomers.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-white p-6 text-sm text-text-muted">
            No paid orders yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => {
                  const user = byId.get(c.userId);
                  return (
                    <tr
                      key={c.userId}
                      className="border-t border-border transition hover:bg-bg-page"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-text-primary">
                          {user?.name ?? "—"}
                        </div>
                        <div className="text-xs text-text-muted">
                          {user?.email ?? c.userId}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {c._count._all}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text-primary">
                        {formatINR(c._sum.totalPrice ?? 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-12 text-xs text-text-muted">
        Chart-driven views (revenue over time, conversion funnel) are the next
        slice. {displayDesignName.length > 0 ? "" : ""}
      </p>
    </div>
  );
}

function PeriodCard({
  label,
  revenue,
  orders,
}: {
  label: string;
  revenue: number;
  orders: number;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="text-xs uppercase tracking-widest text-text-muted">
        {label}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">
            Revenue
          </div>
          <div className="mt-0.5 font-display text-2xl font-extrabold text-text-primary">
            {formatINR(revenue)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">
            Orders
          </div>
          <div className="mt-0.5 font-display text-2xl font-extrabold text-text-primary">
            {orders}
          </div>
        </div>
      </div>
    </div>
  );
}
