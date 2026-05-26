import { Hero } from "@/components/marketing/Hero";
import { Ticker } from "@/components/marketing/Ticker";
import { CardTypesGrid } from "@/components/marketing/CardTypesGrid";
import { StatsSection } from "@/components/marketing/StatsSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { DesignerPreview } from "@/components/marketing/DesignerPreview";
import { TrustPillars } from "@/components/marketing/TrustPillars";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CtaBlock } from "@/components/marketing/CtaBlock";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <CardTypesGrid />
      <StatsSection />
      <HowItWorks />
      <DesignerPreview />
      <TrustPillars />
      <Testimonials />
      <CtaBlock />
    </>
  );
}
