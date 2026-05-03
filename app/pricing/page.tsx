"use client";

import { PublicShell } from "@/components/landing/PublicShell";
import { ClosingBand } from "@/components/landing/LandingSections";
import {
  ApiPricing,
  ApiPricingFaq,
  Pricing,
  PricingFaq,
} from "@/components/landing/Sections";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-28 text-center lg:px-8 lg:pt-32">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {t.pricing.eyebrow}
          </div>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-strong">
            {t.pricing.subtitle}
          </p>
        </div>
      </section>

      <Pricing />
      <ApiPricing />
      <ApiPricingFaq />
      <PricingFaq />
      <ClosingBand />
    </PublicShell>
  );
}
