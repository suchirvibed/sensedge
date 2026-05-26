import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/shared/Reveal";

export function CtaBlock() {
  return (
    <section className="relative overflow-hidden bg-bg-page section-pad">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/10 blur-3xl" />
      <div className="container-px relative mx-auto max-w-container text-center">
        <Reveal>
          <h2 className="display text-text-primary">
            Ready to create
            <br />
            your <span className="text-orange">perfect card?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-xl text-lg text-text-body">
            50,000+ teams have used PrintCard to design and order cards. Your design is
            five minutes away.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-10 flex justify-center">
            <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
              Start designing
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
