import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="bg-bg-page">
      <div className="container-px mx-auto max-w-container pt-24 pb-28 md:pt-32 md:pb-36">
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr]">
          {/* Left */}
          <div>
            <span className="eyebrow text-text-muted">
              <span className="text-orange">■</span> SMART CARDS · ID CARDS · RFID
            </span>
            <h1 className="display mt-6 text-text-primary">
              Design.
              <br />
              Print.
              <br />
              <span className="text-orange">Deliver.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg text-text-body">
              Professional cards for businesses, schools and organisations — designed
              in minutes, printed and delivered to your door.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
                Start designing
              </LinkButton>
              <LinkButton href="/templates" variant="outline" size="lg">
                View templates
              </LinkButton>
            </div>
          </div>

          {/* Right — floating CSS card mockup */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[1.6/1] w-full">
              {/* back card */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-[6deg] rounded-card bg-bg-dark shadow-hover" />
              {/* front card */}
              <div className="relative h-full w-full -rotate-[3deg] rounded-card bg-white p-6 shadow-hover ring-1 ring-black/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                      Employee ID
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tracking-tight text-text-primary">
                      Aarav Sharma
                    </div>
                    <div className="text-xs text-text-muted">Product · Bengaluru</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <rect x="3" y="6" width="18" height="13" rx="2" />
                      <path d="M7 16h4" />
                    </svg>
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-4">
                  <div className="h-16 w-16 rounded-md bg-bg-page ring-1 ring-black/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-1.5 w-3/4 rounded bg-bg-page" />
                    <div className="h-1.5 w-1/2 rounded bg-bg-page" />
                    <div className="h-1.5 w-2/3 rounded bg-bg-page" />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-[10px] font-mono tracking-widest text-text-muted">
                    ID · PCO-000142
                  </div>
                  <div className="h-5 w-12 rounded-sm bg-gradient-to-tr from-amber-300 to-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
