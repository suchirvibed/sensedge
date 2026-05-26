import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { IconPackage } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const metadata = { title: "Orders — PrintCard" };

export default async function OrdersPage() {
  const session = await auth();
  const userId = session!.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      quantity: true,
      material: true,
      totalPrice: true,
      status: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ORDERS
      </span>
      <h1 className="h2 mt-3 text-text-primary">Orders</h1>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconPackage size={22} />}
            title="No orders yet"
            body="When you place an order, you'll see its status update here in real time — from design review all the way to delivery."
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
                  <th className="px-4 py-3 text-left font-semibold">Material</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border transition hover:bg-bg-page">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="font-mono font-semibold text-orange hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-text-primary">{o.material}</td>
                    <td className="px-4 py-3 text-text-primary">{o.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      ₹{o.totalPrice.toFixed(2)}
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
      </div>
    </div>
  );
}
