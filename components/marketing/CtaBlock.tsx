import { LinkButton } from "@/components/ui/Button";

export function CtaBlock() {
  return (
    <section className="bg-bg-page section-pad">
      <div className="container-px mx-auto max-w-container text-center">
        <h2 className="display text-text-primary">
          Ready to create
          <br />
          your <span className="text-orange">perfect card?</span>
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-lg text-text-body">
          50,000+ teams have used PrintCard to design and order cards. Your design is
          five minutes away.
        </p>
        <div className="mt-10 flex justify-center">
          <LinkButton href="/designer/new" variant="primary" size="lg" showArrow>
            Start designing
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
