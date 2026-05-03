"use client";

import { ArrowRight, Download, MapPin, Search, Star, Zap } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useI18n } from "@/lib/i18n";

function LeadCard({
  name,
  location,
  score,
  signal,
  signalTone,
  delay,
}: {
  name: string;
  location: string;
  score: number;
  signal: string;
  signalTone: "warning" | "success" | "accent";
  delay: number;
}) {
  const tones = {
    warning: "bg-warning/10 text-warning border-warning/15",
    success: "bg-success/10 text-success border-success/15",
    accent: "bg-accent/10 text-accent-strong border-accent/15",
  };
  return (
    <div className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] font-mono text-xs font-bold text-accent-strong">
        <NumberTicker value={score} delay={delay} duration={1200} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">
          {name}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <MapPin size={9} />
          {location}
        </div>
      </div>
      <span
        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${tones[signalTone]}`}
      >
        {signal}
      </span>
    </div>
  );
}

function MiniSearchBar({ locale }: { locale: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
      <Search size={14} className="text-muted" />
      <span className="text-[13px] text-muted-strong">
        {locale === "fr" ? "restaurants sans site web" : "restaurants without website"}
      </span>
      <span className="ml-1 text-[11px] text-muted">|</span>
      <span className="flex items-center gap-1 text-[13px] text-muted-strong">
        <MapPin size={11} className="text-accent-cyan" />
        Paris
      </span>
      <div className="ml-auto flex h-7 items-center rounded-md bg-accent px-3 text-[11px] font-medium text-white">
        <Search size={11} />
      </div>
    </div>
  );
}

export function Hero() {
  const { t, locale } = useI18n();

  const leads =
    locale === "fr"
      ? [
          { name: "Saffron & Co.", location: "Paris 11e", score: 94, signal: "Sans site web", signalTone: "warning" as const },
          { name: "Le Comptoir Vert", location: "Lyon 3e", score: 87, signal: "Forte opportunite", signalTone: "success" as const },
          { name: "Harbor Bistro", location: "Marseille", score: 79, signal: "Pret outreach", signalTone: "accent" as const },
        ]
      : [
          { name: "Saffron & Co.", location: "Paris 11th", score: 94, signal: "No website", signalTone: "warning" as const },
          { name: "Le Comptoir Vert", location: "Lyon 3rd", score: 87, signal: "High opportunity", signalTone: "success" as const },
          { name: "Harbor Bistro", location: "Marseille", score: 79, signal: "Outreach ready", signalTone: "accent" as const },
        ];

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(ellipse 40% 30% at 80% 50%, rgba(245,158,11,0.06), transparent 55%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-28 lg:px-8 lg:pb-28 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="max-w-xl">
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
              {t.hero.titleA}
              <br />
              <span className="text-gradient">{t.hero.titleB}</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-strong">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton
                href="/app/search"
                size="lg"
                rightIcon={<ArrowRight size={14} />}
              >
                {t.hero.ctaPrimary}
              </LinkButton>
              <LinkButton href="/developers" size="lg" variant="outline">
                {locale === "fr" ? "Voir l'API" : "View API"}
              </LinkButton>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Zap size={10} className="text-accent-cyan" />
                {locale === "fr" ? "Resultats en < 3s" : "Results in < 3s"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star size={10} className="text-accent-cyan" />
                {locale === "fr" ? "Score 0-100 par lead" : "0-100 score per lead"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download size={10} className="text-accent-cyan" />
                {locale === "fr" ? "Export CSV direct" : "Direct CSV export"}
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-12 rounded-3xl opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.2), transparent 60%)",
              }}
            />
            <div className="relative space-y-3">
              <MiniSearchBar locale={locale} />
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                <div className="flex items-center justify-between rounded-t-lg bg-white/[0.03] px-4 py-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                    {locale === "fr" ? "Resultats - Top 3" : "Results - Top 3"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-success" />
                    <NumberTicker value={48} duration={1000} />{" "}
                    {locale === "fr" ? "leads trouves" : "leads found"}
                  </span>
                </div>
                <div className="space-y-1 p-1.5">
                  {leads.map((lead, i) => (
                    <LeadCard key={lead.name} {...lead} delay={300 + i * 200} />
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-b-lg bg-white/[0.03] px-4 py-2.5">
                  <span className="text-[11px] text-muted">
                    {locale === "fr"
                      ? "3 leads scores >= 75 - prets a contacter"
                      : "3 leads scored >= 75 - ready to contact"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent-strong">
                    <Download size={10} />
                    CSV
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
