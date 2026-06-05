import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { IconClipboardCheck } from "@tabler/icons-react";
import { displayDesignName } from "@/lib/blank-inkjet";
import { BLANK_INKJET_NAME } from "@/lib/blank-inkjet";

export const dynamic = "force-dynamic";

interface SP {
  tab?: string;
}

const TABS = [
  { id: "PENDING", label: "Pending review" },
  { id: "REVISION", label: "Revision sent" },
  { id: "APPROVED", label: "Approved" },
] as const;

export default async function GraphicsQueuePage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const tab = (TABS.find((t) => t.id === searchParams.tab)?.id ??
    "PENDING") as (typeof TABS)[number]["id"];

  let where: Prisma.OrderWhereInput;
  if (tab === "PENDING") {
    where = {
      status: { in: ["CONFIRMED", "IN_REVIEW"] },
      // Inkjet skips this queue entirely
      printerType: { not: "INKJET" },
      // Exclude the [BLANK INKJET] design just in case
      design: { name: { not: BLANK_INKJET_NAME } },
    };
  } else if (tab === "REVISION") {
    where = { status: "REVISION_NEEDED" };
  } else {
    where = {
      status: { in: ["APPROVED", "PRINTING", "DISPATCHED", "DELIVERED"] },
      printerType: { not: "INKJET" },
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      design: { select: { name: true, previewUrl: true, status: true } },
    },
  });

  const counts = await Promise.all([
    prisma.order.count({
      where: {
        status: { in: ["CONFIRMED", "IN_REVIEW"] },
        printerType: { not: "INKJET" },
        design: { name: { not: BLANK_INKJET_NAME } },
      },
    }),
    prisma.order.count({ where: { status: "REVISION_NEEDED" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <span className="eyebrow text-text-muted">
        <span className="text-orange">■</span> GRAPHICS
      </span>
      <h1 className="h2 mt-3 text-text-primary">Review queue</h1>
      <p className="mt-2 text-sm text-text-muted">
        Approve customer designs for print or send them back for revisions.
        Inkjet orders skip this step.
      </p>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-border">
        {TABS.map((t) => {
          const active = t.id === tab;
          const badge =
            t.id === "PENDING" ? counts[0] : t.id === "REVISION" ? counts[1] : null;
          return (
            <Link
              key={t.id}
              href={`/graphics?tab=${t.id}`}
              className={
                active
                  ? "border-b-2 border-orange px-4 py-2.5 text-sm font-semibold text-text-primary"
                  : "border-b-2 border-transparent px-4 py-2.5 text-sm text-text-muted hover:text-text-primary"
              }
            >
              {t.label}
              {badge !== null && badge > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-tint px-1.5 text-[10px] font-bold text-orange">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconClipboardCheck size={22} />}
            title={
              tab === "PENDING"
                ? "No designs waiting"
                : tab === "REVISION"
                ? "No revisions outstanding"
                : "No approved orders yet"
            }
            body={
              tab === "PENDING"
                ? "When customers place Thermal orders, their designs land here for review."
                : tab === "REVISION"
                ? "Designs you've sent back for revision will appear here until the customer resubmits."
                : "Approved orders move on to the printer queue automatically."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/graphics/review/${o.id}`}
                className="group block overflow-hidden rounded-card border border-border bg-white transition hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-hover"
              >
                <div className="relative aspect-[1.6/1] bg-bg-page">
                  {o.design.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.design.previewUrl}
                      alt={o.design.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-text-muted">
                      No preview
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={o.status} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs font-semibold text-orange">
                      {o.orderNumber}
                    </span>
                    <Badge tone="neutral">{o.quantity} cards</Badge>
                  </div>
                  <div className="mt-2 truncate text-sm font-semibold text-text-primary">
                    {displayDesignName(o.design.name)}
                  </div>
                  <div className="mt-1 truncate text-xs text-text-muted">
                    {o.user.name} · {o.user.email}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
