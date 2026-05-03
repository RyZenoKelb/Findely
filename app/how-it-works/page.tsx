"use client";

import { ArrowRight, Download, Filter, Gauge, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PublicPageHeader,
  PublicShell,
} from "@/components/landing/PublicShell";
import { ClosingBand } from "@/components/landing/LandingSections";
import { LinkButton } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

const ICONS: LucideIcon[] = [Search, Filter, Gauge, Download];

export default function HowItWorksPage() {
  const { t, locale } = useI18n();
  const stepLabel = locale === "fr" ? "Étape" : "Step";
  return (
    <PublicShell>
      <PublicPageHeader
        eyebrow={t.howItWorks.eyebrow}
        title={t.howItWorks.title}
      />

      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        <ol className="relative border-l border-white/[0.08] pl-10">
          {t.howItWorks.steps.map((s, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={s.title} className="relative mb-16 last:mb-0">
                <span className="absolute -left-[3.25rem] top-0 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-accent-cyan ring-4 ring-background">
                  <Icon size={18} />
                </span>
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
                  {stepLabel} {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {s.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-strong">
                  {s.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20 lg:px-8">
        <div className="glow-accent relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
          <div className="bg-radial-cyan pointer-events-none absolute inset-0" />
          <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {t.solution.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-strong">
                {t.solution.subtitle}
              </p>
              <div className="mt-6">
                <LinkButton
                  href="/app/search"
                  size="md"
                  rightIcon={<ArrowRight size={14} />}
                >
                  {t.solution.tryIt}
                </LinkButton>
              </div>
            </div>
            <ul className="grid gap-2">
              {t.solution.bullets.map((b) => (
                <li
                  key={b}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm text-foreground"
                >
                  · {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ClosingBand />
    </PublicShell>
  );
}
