"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrintJobStatus } from "@prisma/client";
import { IconPlayerPlay, IconCheck, IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  jobId: string;
  currentStatus: PrintJobStatus;
}

export function PrintJobActions({ jobId, currentStatus }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issueNotes, setIssueNotes] = useState("");
  const [showIssue, setShowIssue] = useState(false);

  async function update(status: PrintJobStatus, notes?: string) {
    setError(null);
    setBusy(status);
    try {
      const res = await fetch(`/api/printer/jobs/${jobId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-card border border-border bg-white p-6">
      <div className="text-xs uppercase tracking-widest text-text-muted">
        Job actions
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => update("PRINTING")}
          disabled={
            busy !== null ||
            currentStatus === "PRINTING" ||
            currentStatus === "COMPLETED"
          }
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-tint-blueText px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <IconPlayerPlay size={16} />
          {busy === "PRINTING"
            ? "Updating…"
            : currentStatus === "PRINTING"
            ? "Already printing"
            : "Mark as printing"}
        </button>
        <button
          type="button"
          onClick={() => update("COMPLETED")}
          disabled={busy !== null || currentStatus === "COMPLETED"}
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-tint-greenText px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <IconCheck size={16} />
          {busy === "COMPLETED"
            ? "Updating…"
            : currentStatus === "COMPLETED"
            ? "Completed"
            : "Mark as completed (ship)"}
        </button>
        <button
          type="button"
          onClick={() => setShowIssue((v) => !v)}
          disabled={busy !== null}
          className="inline-flex h-11 items-center gap-2 rounded-btn border border-tint-redText/30 bg-tint-red px-5 text-sm font-semibold text-tint-redText transition hover:bg-tint-red/80 disabled:opacity-50"
        >
          <IconAlertTriangle size={16} />
          Flag issue
        </button>
      </div>

      {showIssue && (
        <div className="mt-5">
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-text-muted">
            What&apos;s the issue?
          </label>
          <textarea
            value={issueNotes}
            onChange={(e) => setIssueNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Print head misalignment, RFID encoder error, stock out."
            className="w-full rounded-input border border-border bg-white px-3 py-2 text-sm placeholder:text-text-hint focus:border-text-primary focus:outline-none"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={busy !== null || issueNotes.trim().length < 5}
              onClick={() => {
                update("ISSUE", issueNotes.trim());
                setShowIssue(false);
                setIssueNotes("");
              }}
              className="inline-flex h-10 items-center rounded-btn bg-tint-redText px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Flag this job
            </button>
            <button
              type="button"
              onClick={() => {
                setShowIssue(false);
                setIssueNotes("");
              }}
              className="inline-flex h-10 items-center rounded-btn border border-border bg-white px-4 text-xs font-semibold text-text-body transition hover:border-text-primary"
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
