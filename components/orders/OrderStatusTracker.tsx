import {
  IconCircleCheck,
  IconLoader2,
  IconClock,
} from "@tabler/icons-react";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/cn";

interface Props {
  status: OrderStatus;
}

interface Step {
  key: OrderStatus | "ANY";
  label: string;
  // Statuses that count as "this step is complete and we've moved past it"
  reached: OrderStatus[];
}

// 6-step happy path. Cancelled / Refunded statuses fall through and we
// surface them via the StatusBadge above the tracker.
const STEPS: Step[] = [
  {
    key: "CONFIRMED",
    label: "Confirmed",
    reached: [
      "CONFIRMED",
      "IN_REVIEW",
      "REVISION_NEEDED",
      "APPROVED",
      "PRINTING",
      "DISPATCHED",
      "DELIVERED",
    ],
  },
  {
    key: "IN_REVIEW",
    label: "Design review",
    reached: [
      "IN_REVIEW",
      "REVISION_NEEDED",
      "APPROVED",
      "PRINTING",
      "DISPATCHED",
      "DELIVERED",
    ],
  },
  {
    key: "APPROVED",
    label: "Approved",
    reached: ["APPROVED", "PRINTING", "DISPATCHED", "DELIVERED"],
  },
  {
    key: "PRINTING",
    label: "Printing",
    reached: ["PRINTING", "DISPATCHED", "DELIVERED"],
  },
  {
    key: "DISPATCHED",
    label: "Dispatched",
    reached: ["DISPATCHED", "DELIVERED"],
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    reached: ["DELIVERED"],
  },
];

export function OrderStatusTracker({ status }: Props) {
  const isUnhappy = status === "CANCELLED" || status === "REFUNDED";

  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="mb-4 text-xs uppercase tracking-widest text-text-muted">
        Order progress
      </div>

      {isUnhappy ? (
        <div className="text-sm text-text-body">
          This order has been{" "}
          <span className="font-semibold text-tint-redText">
            {status === "CANCELLED" ? "cancelled" : "refunded"}
          </span>
          . If this looks like a mistake, contact{" "}
          <a className="text-orange hover:underline" href="mailto:support@printcard.co.in">
            support@printcard.co.in
          </a>
          .
        </div>
      ) : (
        <ol className="relative grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, i) => {
            const reached = step.reached.includes(status);
            const current = step.key === status;
            return (
              <li key={step.key} className="relative flex flex-col items-center">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4 hidden h-px sm:block lg:block",
                      reached ? "bg-orange" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
                    reached
                      ? "border-orange bg-orange text-white"
                      : "border-border bg-white text-text-muted"
                  )}
                >
                  {reached && !current && <IconCircleCheck size={18} />}
                  {current && <IconLoader2 size={18} className="animate-spin" />}
                  {!reached && <IconClock size={16} />}
                </span>
                <span
                  className={cn(
                    "mt-2 text-center text-[11px] uppercase tracking-widest",
                    reached ? "font-semibold text-text-primary" : "text-text-muted"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
