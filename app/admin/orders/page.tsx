import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/pricing";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { displayDesignName } from "@/lib/blank-inkjet";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconPackage } from "@tabler/icons-react";

interface SP {
  status?: string;
  paid?: string;
  search?: string;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "REVISION_NEEDED", label: "Revision needed" },
  { value: "APPROVED", label: "Approved" },
  { value: "PRINTING", label: "Printing" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const status = searchParams.status?.trim();
  const paid = searchParams.paid?.trim();
  const search = searchParams.search?.trim();

  const where: Prisma.OrderWhereInput = {};
  if (status && STATUS_FILTERS.some((f) => f.value === status)) {
    where.status = status as Prisma.OrderWhereInput["status"];
  }
  if (paid === "PAID" || paid === "PENDING" || paid === "FAILED" || paid === "REFUNDED") {
    where.paymentStatus = paid;
  }
  if (search && search.length > 0) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      design: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> ADMIN / ORDERS
      </span>
      <h1 className="h2 mt-3 text-text-primary">All orders</h1>

      {/* Filters */}
      <form className="mt-8 flex flex-wrap items-end gap-3" action="/admin/orders" method="get">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Status
          </label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Payment
          </label>
          <select
            name="paid"
            defaultValue={paid ?? ""}
            className="h-10 rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            <option value="">All payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Search
          </label>
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Order # · customer name · email"
            className="h-10 w-full rounded-input border border-border bg-white px-3 text-sm placeholder:text-text-hint focus:border-text-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-btn bg-text-primary px-5 text-sm font-semibold text-white transition hover:bg-orange"
        >
          Filter
        </button>
        {(status || paid || search) && (
          <Link
            href="/admin/orders"
            className="h-10 inline-flex items-center text-xs font-semibold text-text-muted hover:text-text-primary"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="mt-6 text-xs text-text-muted">
        {orders.length === 200
          ? "Showing the first 200 matches — narrow your filter to see more."
          : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
      </div>

      <div className="mt-3">
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconPackage size={22} />}
            title="No orders match these filters"
            body="Try resetting the filters above, or check back when customers place new orders."
          />
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-page text-xs uppercase tracking-widest text-text-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Design</th>
                  <th className="px-4 py-3 text-left font-semibold">Qty</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
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
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
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
                      <Badge
                        tone={
                          o.paymentStatus === "PAID"
                            ? "green"
                            : o.paymentStatus === "FAILED" ||
                              o.paymentStatus === "REFUNDED"
                            ? "red"
                            : "amber"
                        }
                      >
                        {o.paymentStatus}
                      </Badge>
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
