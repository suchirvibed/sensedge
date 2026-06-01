"use client";

/**
 * Per-kind card visuals used in the ServiceCard hover overlay.
 * Each kind renders a large hero card mockup + 2 supporting thumbnails.
 * Swap the inner JSX for real product photos when available.
 */

export type CardKind = "id" | "rfid" | "smart" | "membership" | "student" | "visitor";

export function CardTypePreview({ kind }: { kind: CardKind }) {
  switch (kind) {
    case "id":
      return <IdPreview />;
    case "rfid":
      return <RfidPreview />;
    case "smart":
      return <SmartPreview />;
    case "membership":
      return <MembershipPreview />;
    case "student":
      return <StudentPreview />;
    case "visitor":
      return <VisitorPreview />;
  }
}

// ─── Helpers ─────────────────────────────────────────────
function CardShell({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`relative aspect-[1.6/1] w-full overflow-hidden rounded-card shadow-hover ${className}`}
    >
      {children}
    </div>
  );
}

function ThumbStrip({ thumbs }: { thumbs: React.ReactNode[] }) {
  return (
    <div className="mt-4 flex gap-3">
      {thumbs.map((t, i) => (
        <div key={i} className="aspect-[1.6/1] w-full flex-1 overflow-hidden rounded-md">
          {t}
        </div>
      ))}
    </div>
  );
}

function NfcWaves({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 8 Q4 12, 6 16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 6 Q6 12, 10 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 4 Q8 12, 14 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── 1. ID cards ─────────────────────────────────────────
function IdPreview() {
  return (
    <>
      <CardShell className="bg-text-primary text-white">
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Employee
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight">
                Aarav Sharma
              </div>
              <div className="mt-0.5 text-xs text-white/55">Product · Bengaluru</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
                <rect x="3" y="6" width="18" height="13" rx="2" />
                <path d="M7 16h4" />
              </svg>
            </div>
          </div>
          <div className="mt-auto flex items-end gap-3">
            <div className="h-14 w-14 rounded bg-white/[0.06]" />
            <div className="flex-1 space-y-1.5 pb-1">
              <div className="h-1.5 w-3/4 rounded bg-white/10" />
              <div className="h-1.5 w-1/2 rounded bg-white/10" />
              <div className="h-1.5 w-2/3 rounded bg-white/10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-12 rounded-bl-card bg-orange" />
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div className="h-full w-full bg-white p-2 ring-card" key="white">
            <div className="text-[7px] font-bold uppercase tracking-widest text-text-muted">
              Staff
            </div>
            <div className="mt-1 h-1 w-3/4 rounded bg-bg-subtle" />
            <div className="mt-0.5 h-1 w-1/2 rounded bg-bg-subtle" />
          </div>,
          <div className="h-full w-full bg-orange p-2 text-white" key="orange">
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/70">
              Visitor
            </div>
            <div className="mt-1 h-1 w-3/4 rounded bg-white/30" />
            <div className="mt-0.5 h-1 w-1/2 rounded bg-white/30" />
          </div>,
        ]}
      />
    </>
  );
}

// ─── 2. RFID cards ────────────────────────────────────────
function RfidPreview() {
  return (
    <>
      <CardShell
        style={{ background: "linear-gradient(135deg, #1f4fa8 0%, #112d62 100%)" }}
        className="text-white"
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                Access
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight">
                Tower One
              </div>
              <div className="mt-0.5 text-xs text-white/55">13.56 MHz · Active</div>
            </div>
            <NfcWaves color="rgba(255,255,255,0.85)" />
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="font-mono text-[10px] tracking-widest text-white/55">
              RFID · 442019
            </div>
            <div className="h-5 w-12 rounded-sm bg-white/15" />
          </div>
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div
            className="h-full w-full p-2 text-white"
            style={{ background: "linear-gradient(135deg, #E85D04, #c44e00)" }}
            key="orange"
          >
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/80">
              Tap
            </div>
            <NfcWaves color="rgba(255,255,255,0.9)" />
          </div>,
          <div className="h-full w-full bg-text-primary p-2 text-white" key="dark">
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/65">
              Smart Key
            </div>
            <div className="mt-2 h-1 w-1/2 rounded bg-white/20" />
          </div>,
        ]}
      />
    </>
  );
}

// ─── 3. Smart cards (NFC) ────────────────────────────────
function SmartPreview() {
  return (
    <>
      <CardShell
        style={{ background: "linear-gradient(135deg, #4c45a8 0%, #1a1840 100%)" }}
        className="text-white"
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                NFC Smart
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight">
                Tap to share
              </div>
              <div className="mt-0.5 text-xs text-white/55">NTAG216 · 924 bytes</div>
            </div>
            <NfcWaves color="rgba(232,93,4,0.95)" />
          </div>
          {/* Chip illustration */}
          <div
            className="absolute bottom-6 left-6 h-10 w-12 rounded-sm"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #d4af37 100%)",
            }}
          />
          <div className="absolute bottom-6 left-6 h-10 w-12 rounded-sm">
            <div className="absolute left-0 top-2 h-px w-full bg-bg-darker/30" />
            <div className="absolute left-0 top-5 h-px w-full bg-bg-darker/30" />
            <div className="absolute left-0 top-8 h-px w-full bg-bg-darker/30" />
            <div className="absolute left-3 top-0 h-full w-px bg-bg-darker/30" />
            <div className="absolute left-6 top-0 h-full w-px bg-bg-darker/30" />
            <div className="absolute left-9 top-0 h-full w-px bg-bg-darker/30" />
          </div>
          <div className="absolute bottom-6 right-6 font-mono text-[10px] tracking-widest text-white/55">
            ●●●● 4096
          </div>
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div className="h-full w-full bg-text-primary p-2 text-white" key="black">
            <div className="text-[7px] font-bold uppercase tracking-widest text-orange">
              Metal
            </div>
            <NfcWaves color="rgba(232,93,4,0.95)" />
          </div>,
          <div
            className="h-full w-full p-2 text-white"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #8b5a2b 0px, #8b5a2b 1px, transparent 1px, transparent 4px), linear-gradient(135deg, #b58455, #8b5a2b)",
            }}
            key="wood"
          >
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/80">
              Wooden
            </div>
            <NfcWaves color="rgba(255,255,255,0.9)" />
          </div>,
        ]}
      />
    </>
  );
}

// ─── 4. Membership cards ─────────────────────────────────
function MembershipPreview() {
  return (
    <>
      <CardShell
        style={{ background: "linear-gradient(135deg, #246a14 0%, #102e08 100%)" }}
        className="text-white"
      >
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                </svg>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">
                  Gold tier
                </div>
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight">
                Priya Nair
              </div>
              <div className="mt-0.5 text-xs text-white/55">Member since 2023</div>
            </div>
            <div className="font-display text-sm font-bold tracking-tight text-white/80">
              LUMEN
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="font-mono text-[10px] tracking-widest text-white/55">
              MEM · 009021
            </div>
            <div className="grid grid-cols-5 gap-px">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className={i % 3 === 0 ? "h-1 w-1 bg-white/40" : "h-1 w-1 bg-white/10"}
                />
              ))}
            </div>
          </div>
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div
            className="h-full w-full p-2 text-white"
            style={{
              background:
                "linear-gradient(135deg, #c0c0c0 0%, #8a8a8a 100%)",
            }}
            key="silver"
          >
            <div className="text-[7px] font-bold uppercase tracking-widest text-white">
              Silver
            </div>
          </div>,
          <div
            className="h-full w-full p-2 text-white"
            style={{ background: "linear-gradient(135deg, #1c1c1c, #000)" }}
            key="platinum"
          >
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/70">
              Platinum
            </div>
          </div>,
        ]}
      />
    </>
  );
}

// ─── 5. Student IDs ──────────────────────────────────────
function StudentPreview() {
  return (
    <>
      <CardShell className="bg-white ring-card">
        <div className="flex h-full">
          {/* Coloured stripe */}
          <div
            className="w-1/3 p-4 text-white"
            style={{ background: "linear-gradient(180deg, #E85D04, #c44e00)" }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              BHS
            </div>
            <div className="mt-2 font-display text-xs font-bold leading-tight tracking-tight">
              Bright Horizons School
            </div>
            <div className="mt-auto pt-12 text-[9px] uppercase tracking-widest text-white/70">
              2026 · XII-B
            </div>
          </div>
          {/* Right side */}
          <div className="flex-1 p-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Student
            </div>
            <div className="mt-1 font-display text-lg font-bold tracking-tight text-text-primary">
              Ishani Gupta
            </div>
            <div className="mt-0.5 text-[10px] text-text-muted">Roll · 22</div>
            <div className="mt-3 flex items-end gap-2">
              <div className="h-10 w-10 rounded bg-bg-subtle" />
              <div className="flex-1 space-y-1 pb-1">
                <div className="h-1 w-3/4 rounded bg-bg-subtle" />
                <div className="h-1 w-1/2 rounded bg-bg-subtle" />
              </div>
            </div>
          </div>
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div className="flex h-full" key="blue">
            <div className="w-1/3 bg-tint-blueText" />
            <div className="flex-1 bg-white p-1.5">
              <div className="text-[6px] font-bold uppercase tracking-widest text-text-muted">
                College
              </div>
            </div>
          </div>,
          <div className="flex h-full" key="green">
            <div className="w-1/3 bg-tint-greenText" />
            <div className="flex-1 bg-white p-1.5">
              <div className="text-[6px] font-bold uppercase tracking-widest text-text-muted">
                University
              </div>
            </div>
          </div>,
        ]}
      />
    </>
  );
}

// ─── 6. Visitor cards ────────────────────────────────────
function VisitorPreview() {
  return (
    <>
      <CardShell className="bg-white ring-card">
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                Visitor
              </div>
              <div className="mt-2 font-display text-2xl font-bold tracking-tight text-text-primary">
                Day Pass
              </div>
              <div className="mt-0.5 text-xs text-text-muted">26 May 2026</div>
            </div>
            {/* QR placeholder */}
            <div className="grid h-12 w-12 grid-cols-5 grid-rows-5 gap-px overflow-hidden rounded">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    [0, 2, 3, 5, 7, 8, 10, 11, 13, 16, 18, 19, 22, 24].includes(i)
                      ? "bg-text-primary"
                      : "bg-white"
                  }
                />
              ))}
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="font-mono text-[10px] tracking-widest text-text-muted">
              VST · 220031
            </div>
            {/* barcode */}
            <div className="flex gap-px">
              {[2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1].map((w, i) => (
                <span
                  key={i}
                  className="h-4 bg-text-primary"
                  style={{ width: w + "px" }}
                />
              ))}
            </div>
          </div>
          <div className="absolute left-1/2 top-2 h-3 w-6 -translate-x-1/2 rounded-full border border-text-primary/15" />
        </div>
      </CardShell>
      <ThumbStrip
        thumbs={[
          <div className="h-full w-full bg-orange p-2 text-white" key="orange">
            <div className="text-[7px] font-bold uppercase tracking-widest text-white/85">
              Event
            </div>
          </div>,
          <div className="flex h-full w-full bg-text-primary text-white" key="dark">
            <div className="flex-1 p-2">
              <div className="text-[7px] font-bold uppercase tracking-widest text-white/65">
                Lanyard
              </div>
            </div>
          </div>,
        ]}
      />
    </>
  );
}
