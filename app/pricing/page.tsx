"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import { PublicShell } from "@/components/landing/PublicShell";
import { ClosingBand } from "@/components/landing/LandingSections";
import { Pricing, PricingFaq } from "@/components/landing/Sections";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t, locale } = useI18n();

  const benefits =
    locale === "fr"
      ? [
          "Pas de carte pour commencer",
          "Annulation à tout moment",
          "Vos CSV vous appartiennent",
          "Aucun piège sur les sièges",
        ]
      : [
          "No card to get started",
          "Cancel anytime",
          "Your CSVs stay yours",
          "No seat tricks",
        ];

  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <div className="bg-aurora pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-5xl px-5 pb-6 pt-24 text-center lg:px-8 lg:pt-28">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {t.pricing.eyebrow}
          </div>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-strong">
            {t.pricing.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            {benefits.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/5 px-3 py-1 text-muted-strong"
              >
                <Check size={12} className="text-accent-cyan" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      <section className="mx-auto max-w-5xl px-5 pb-8 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white/5 p-5">
            <Sparkles size={14} className="text-accent-cyan" />
            <div className="mt-3 text-sm font-semibold text-foreground">
              {locale === "fr" ? "Mock inclus" : "Mock included"}
            </div>
            <p className="mt-1 text-xs text-muted-strong">
              {locale === "fr"
                ? "Fonctionne hors-ligne avec des données réalistes, sans carte."
                : "Works offline with realistic data, no card needed."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white/5 p-5">
            <Zap size={14} className="text-accent-cyan" />
            <div className="mt-3 text-sm font-semibold text-foreground">
              Google Places
            </div>
            <p className="mt-1 text-xs text-muted-strong">
              {locale === "fr"
                ? "Branchez votre clé API pour débloquer les données réelles."
                : "Plug in your API key to unlock real-time data."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white/5 p-5">
            <Check size={14} className="text-accent-cyan" />
            <div className="mt-3 text-sm font-semibold text-foreground">
              {locale === "fr" ? "Export CRM-ready" : "CRM-ready export"}
            </div>
            <p className="mt-1 text-xs text-muted-strong">
              {locale === "fr"
                ? "CSV ouvert par HubSpot, Instantly ou Excel en un clic."
                : "CSV opens in HubSpot, Instantly or Excel in one click."}
            </p>
          </div>
        </div>
      </section>

      <PricingFaq />
      <ClosingBand />
    </PublicShell>
  );
}
