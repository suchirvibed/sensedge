import { IconCheck } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";

const FEATURES = [
  "Drag & drop, snap-to-grid",
  "50+ fonts and 1000s of icons",
  "RFID, NFC & LED chip options",
  "Bulk pricing built in",
];

export function DesignerPreview() {
  return (
    <section className="bg-bg-darker section-pad text-white">
      <div className="container-px mx-auto grid max-w-container items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        {/* Text */}
        <div>
          <span className="eyebrow text-white/60">
            <span className="text-orange">■</span> THE DESIGNER
          </span>
          <h2 className="h2 mt-3 text-white">
            A full design studio,
            <br />
            in your browser.
          </h2>
          <hr className="orange-divider" />

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/85">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/20 text-orange">
                  <IconCheck size={14} />
                </span>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
              Try the designer
            </LinkButton>
          </div>
        </div>

        {/* Mockup */}
        <div className="relative">
          <div className="rounded-card bg-canvas p-2 shadow-[0_0_60px_-10px_rgba(232,93,4,0.6)] ring-1 ring-orange/40">
            {/* fake toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                designer · untitled
              </div>
              <div className="h-6 w-20 rounded bg-orange/90" />
            </div>

            {/* fake canvas area */}
            <div className="flex h-72 gap-2 p-2 sm:h-80">
              <div className="hidden w-40 rounded bg-white/5 p-3 text-[10px] uppercase tracking-widest text-white/40 sm:block">
                <div className="mb-2 text-white/60">Fields</div>
                <div className="space-y-1.5">
                  <div className="h-5 rounded bg-white/10" />
                  <div className="h-5 rounded bg-white/10" />
                  <div className="h-5 w-3/4 rounded bg-white/10" />
                </div>
              </div>
              <div className="relative flex flex-1 items-center justify-center rounded bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px]">
                <div className="relative aspect-[1.6/1] w-3/4 rounded-md bg-white ring-2 ring-orange/70 shadow-2xl">
                  <div className="absolute left-4 top-4 h-3 w-24 rounded bg-bg-page" />
                  <div className="absolute left-4 top-9 h-2 w-16 rounded bg-bg-page" />
                  <div className="absolute bottom-4 left-4 h-10 w-10 rounded-md bg-bg-page" />
                  <div className="absolute bottom-4 right-4 h-5 w-12 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
