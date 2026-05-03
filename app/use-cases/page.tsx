"use client";

import {
  Building2,
  Gauge,
  Globe2,
  Layers,
  Store,
  Stethoscope,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PublicPageHeader,
  PublicShell,
} from "@/components/landing/PublicShell";
import { ClosingBand } from "@/components/landing/LandingSections";
import { useI18n } from "@/lib/i18n";

const ICONS: LucideIcon[] = [
  Building2,
  Gauge,
  Globe2,
  Users,
  Workflow,
  Layers,
  Stethoscope,
  Store,
];

export default function UseCasesPage() {
  const { t, locale } = useI18n();

  const forLabel = locale === "fr" ? "Pour" : "For";
  const liftCopy =
    locale === "fr"
      ? "Typiquement utilisé pour : prospection sortante ciblée, qualification rapide, listes prêtes à l’outreach."
      : "Typically used for: targeted outbound, fast qualification, outreach-ready lists.";
  const chips =
    locale === "fr"
      ? ["Listes ciblées", "Leads scorés", "Export CSV"]
      : ["Targeted lists", "Scored leads", "CSV export"];

  return (
    <PublicShell>
      <PublicPageHeader
        eyebrow={t.useCases.eyebrow}
        title={t.useCases.title}
        subtitle={t.useCases.subtitle}
      />

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="space-y-28 lg:space-y-32">
          {t.useCases.cases.map((c, i) => {
            const Icon = ICONS[i % ICONS.length];
            const flipped = i % 2 === 1;
            return (
              <div
                key={c.title}
                className={`grid items-start gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16 ${flipped ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-accent/10 text-accent-cyan">
                    <Icon size={22} />
                  </div>
                  <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
                    {forLabel} · {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {c.title}
                  </h2>
                </div>
                <div>
                  <p className="text-lg leading-relaxed text-muted-strong">
                    {c.desc}
                  </p>
                  <p className="mt-4 text-sm text-muted">{liftCopy}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs text-muted-strong"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ClosingBand />
    </PublicShell>
  );
}
