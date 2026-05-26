import type { OrderStatus, DesignStatus, PrintJobStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";

type AnyStatus = OrderStatus | DesignStatus | PrintJobStatus;

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  IN_REVIEW: "In review",
  REVISION_NEEDED: "Revision needed",
  APPROVED: "Approved",
  PRINTING: "Printing",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ARCHIVED: "Archived",
  QUEUED: "Queued",
  COMPLETED: "Completed",
  ISSUE: "Issue",
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
};

const STATUS_TONE: Record<string, "orange" | "blue" | "purple" | "green" | "amber" | "red" | "neutral"> = {
  CONFIRMED: "blue",
  IN_REVIEW: "amber",
  REVISION_NEEDED: "red",
  APPROVED: "green",
  PRINTING: "purple",
  DISPATCHED: "blue",
  DELIVERED: "green",
  CANCELLED: "neutral",
  REFUNDED: "neutral",
  DRAFT: "neutral",
  SUBMITTED: "blue",
  ARCHIVED: "neutral",
  QUEUED: "amber",
  COMPLETED: "green",
  ISSUE: "red",
  PENDING: "amber",
  PAID: "green",
  FAILED: "red",
};

export function StatusBadge({ status }: { status: AnyStatus | string }) {
  const key = String(status);
  return <Badge tone={STATUS_TONE[key] ?? "neutral"}>{STATUS_LABEL[key] ?? key}</Badge>;
}
