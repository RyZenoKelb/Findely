import { Hero } from "@/components/landing/Hero";
import {
  ClosingBand,
  Comparison,
  LogoStrip,
  SplitNarrative,
  StatBand,
  Testimonial,
  WorkflowStrip,
} from "@/components/landing/LandingSections";
import { NavBar } from "@/components/landing/NavBar";
import { Footer } from "@/components/landing/Sections";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <SplitNarrative />
        <StatBand />
        <WorkflowStrip />
        <Comparison />
        <Testimonial />
        <ClosingBand />
      </main>
      <Footer />
    </div>
  );
}
