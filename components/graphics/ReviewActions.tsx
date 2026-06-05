"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconArrowBackUp } from "@tabler/icons-react";

interface Props {
  orderId: string;
  isPending: boolean;
}

export function ReviewActions({ orderId, isPending }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRevision, setShowRevision] = useState(false);
  const [notes, setNotes] = useState("");

  async function approve() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/graphics/orders/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approve failed");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function requestRevision() {
    if (notes.trim().length < 5) {
      setError("Please describe what needs changing (at least 5 characters).");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/graphics/orders/${orderId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not request revision");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!isPending) {
    return (
      <div className="rounded-card border border-dashed border-border bg-white px-5 py-4 text-sm text-text-muted">
        This order isn&apos;t in the active review queue any more.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="text-xs uppercase tracking-widest text-text-muted">
        Decision
      </div>

      {!showRevision ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={approve}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-btn bg-tint-greenText px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <IconCheck size={16} />
            {busy ? "Approving…" : "Approve & send to print"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRevision(true);
              setError(null);
            }}
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-btn border border-tint-redText/30 bg-tint-red px-5 text-sm font-semibold text-tint-redText transition hover:bg-tint-red/80 disabled:opacity-50"
          >
            <IconArrowBackUp size={16} />
            Request revision
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            Notes to the customer (required)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="e.g. The logo is too close to the bottom edge — please move it up 5mm."
            className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm placeholder:text-text-hint focus:border-text-primary focus:outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={requestRevision}
              disabled={busy}
              className="inline-flex h-11 items-center gap-2 rounded-btn bg-tint-redText px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send revision request"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRevision(false);
                setNotes("");
                setError(null);
              }}
              disabled={busy}
              className="inline-flex h-11 items-center rounded-btn border border-border bg-white px-5 text-sm font-semibold text-text-body transition hover:border-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-input bg-tint-red px-3 py-2 text-xs text-tint-redText">
          {error}
        </p>
      )}
    </div>
  );
}
