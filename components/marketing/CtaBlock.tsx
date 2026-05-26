import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/shared/Reveal";

export function CtaBlock() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container">
        <div className="relative overflow-hidden rounded-card bg-bg-dark px-8 py-20 text-center text-white md:px-16 md:py-28">
          {/* Faint dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Faint orange wash */}
          <div className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-orange/30 blur-3xl" />

          <Reveal className="relative">
            <h2 className="display mx-auto max-w-3xl text-white">
              Ready to create your <span className="text-orange">perfect card?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <p className="mx-auto mt-6 max-w-lg text-base text-white/70">
              50,000+ teams have used PrintCard to design and ship cards. Your first
              design is five minutes away.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="relative">
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
                Start designing
              </LinkButton>
              <LinkButton href="/templates" variant="ghost" size="lg" className="!text-white hover:!bg-white/10">
                Browse templates
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
