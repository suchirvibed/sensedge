"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";

export function SeedTemplatesButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function seed() {
    if (
      !window.confirm(
        "Add 8 sample templates spanning the standard categories? Existing rows with the same name are skipped."
      )
    ) {
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/templates/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setResult(
        `Added ${data.inserted} template${data.inserted === 1 ? "" : "s"}${
          data.skipped > 0 ? ` · ${data.skipped} skipped (already existed)` : ""
        }.`
      );
      router.refresh();
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={seed}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-btn border border-border bg-white px-4 text-sm font-semibold text-text-primary transition hover:border-text-primary hover:bg-bg-subtle disabled:opacity-60"
      >
        <IconSparkles size={16} className="text-orange" />
        {busy ? "Seeding…" : "Seed sample templates"}
      </button>
      {result && <span className="text-xs text-text-muted">{result}</span>}
    </div>
  );
}
