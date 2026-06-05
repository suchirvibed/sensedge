"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const STATUSES: { value: OrderStatus; label: string }[] = [
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

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
}

export function OrderStatusOverride({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty =
    status !== currentStatus ||
    paymentStatus !== currentPaymentStatus ||
    notes.trim().length > 0;

  async function save() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus:
            paymentStatus !== currentPaymentStatus ? paymentStatus : undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSavedAt(Date.now());
      setNotes("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="text-xs uppercase tracking-widest text-text-muted">
        Admin · update status
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Order status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="h-10 w-full rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Payment status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="h-10 w-full rounded-input border border-border bg-white px-3 text-sm text-text-primary focus:border-text-primary focus:outline-none"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
          Notes (logged with the change)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional — visible only to admins in the activity log."
          className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm placeholder:text-text-hint focus:border-text-primary focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-input bg-tint-red px-3 py-2 text-xs text-tint-redText">
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="mt-3 rounded-input bg-tint-green px-3 py-2 text-xs text-tint-greenText">
          Saved.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || busy}
          className="inline-flex h-10 items-center gap-2 rounded-btn bg-orange px-5 text-sm font-semibold text-white transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
