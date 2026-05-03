import { PublicBackground } from "@/components/landing/Backgrounds";
import { Hero } from "@/components/landing/Hero";
import {
  ClosingBand,
  Comparison,
  SplitNarrative,
  StatBand,
  Testimonial,
  WorkflowStrip,
} from "@/components/landing/LandingSections";
import { NavBar } from "@/components/landing/NavBar";
import { Features, Pricing, Footer } from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <PublicBackground />
      <NavBar />
      <main className="relative z-10 flex-1">
        <Hero />
        <WorkflowStrip />
        <SplitNarrative />
        <StatBand />
        <Comparison />
        <Features compact />
        <Testimonial />
        <Pricing />
        <ClosingBand />
      </main>
      <Footer />
    </div>
  );
}
