"use client";

import {
  ArrowRight,
  Check,
  Quote,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { useI18n, type Locale } from "@/lib/i18n";

/* Logo marquee */

const LOGO_MARQUEE = [
  "LINEAR",
  "APOLLO",
  "INSTANTLY",
  "HUBSPOT",
  "CLAY",
  "RAYCAST",
  "ATTIO",
  "SMARTLEAD",
];

export function LogoStrip() {
  const { locale } = useI18n();
  const label =
    locale === "fr"
      ? "Compatible avec les outils que vous utilisez déjà"
      : "Built to plug into the modern outreach stack";
  return (
    <section className="border-y border-border bg-background-2/40">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
          {label}
        </p>
        <div className="relative mt-6 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
          <div className="marquee-track flex gap-14 whitespace-nowrap">
            {[...LOGO_MARQUEE, ...LOGO_MARQUEE].map((l, i) => (
              <span
                key={`${l}-${i}`}
                className="font-mono text-[13px] tracking-[0.2em] text-muted-strong/60"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Split narrative */

function splitCopy(locale: Locale) {
  return locale === "fr"
    ? {
        eyebrow: "Arrêtez le copier-coller",
        title: "Votre équipe ne devrait pas scraper à la main.",
        body: "Findely combine Google Places et les annuaires publics pour vous livrer des listes propres et scorées — en quelques secondes, pas en quelques jours.",
        points: [
          "Une seule recherche, plusieurs sources",
          "Doublons détectés et fusionnés automatiquement",
          "Signal « sans site » surfacé en un coup d’œil",
        ],
        cta: "Lancer une recherche",
      }
    : {
        eyebrow: "Stop copy-pasting",
        title: "Your team shouldn’t scrape by hand.",
        body: "Findely blends Google Places with public directories and ships you clean, scored lists — in seconds, not days.",
        points: [
          "One search, multiple sources",
          "Duplicates detected and merged automatically",
          "‘No website’ signal surfaced at a glance",
        ],
        cta: "Run a search",
      };
}

export function SplitNarrative() {
  const { locale } = useI18n();
  const c = splitCopy(locale);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
        <div className="flex flex-col justify-center">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-strong">
            {c.body}
          </p>
          <ul className="mt-6 space-y-3">
            {c.points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md bg-accent/15 text-accent-cyan">
                  <Check size={12} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <LinkButton
              href="/app/search"
              size="md"
              rightIcon={<ArrowRight size={14} />}
            >
              {c.cta}
            </LinkButton>
          </div>
        </div>

        <div className="relative">
          <div className="bg-aurora pointer-events-none absolute -inset-8" />
          <div className="glow-accent relative overflow-hidden rounded-2xl border border-border-strong bg-surface p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 text-xs text-muted">
              <span className="inline-flex items-center gap-2 text-foreground">
                <Sparkles size={12} className="text-accent-cyan" />
                Live pipeline
              </span>
              <span className="font-mono">findely.app</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { k: "Places scanned", v: "12,480" },
                { k: "Duplicates removed", v: "1,204" },
                { k: "Signals detected", v: "8,337" },
                { k: "Scored ≥ 75", v: "2,981" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="flex items-center justify-between rounded-lg border border-border bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-muted-strong">{s.k}</span>
                  <span className="font-mono text-base text-foreground">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Stat band */

export function StatBand() {
  const { locale } = useI18n();
  const stats =
    locale === "fr"
      ? [
          { v: "10×", k: "Recherche accélérée" },
          { v: "0→100", k: "Score par lead" },
          { v: "< 3 s", k: "Recherche moyenne" },
          { v: "CSV", k: "Export en un clic" },
        ]
      : [
          { v: "10×", k: "Faster prospecting" },
          { v: "0→100", k: "Per-lead score" },
          { v: "< 3 s", k: "Average search" },
          { v: "CSV", k: "One-click export" },
        ];
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div className="bg-spotlight pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-5 py-14 text-center sm:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.k} className="px-4">
            <div className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.v}
            </div>
            <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {s.k}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Workflow strip */

export function WorkflowStrip() {
  const { locale } = useI18n();
  const c =
    locale === "fr"
      ? {
          eyebrow: "Le flux",
          title: "De la niche au CSV, sans rupture.",
          steps: [
            { n: "Recherche", body: "niche + localisation" },
            { n: "Fusion", body: "sources, dédup, nettoyage" },
            { n: "Scoring", body: "0–100 selon votre objectif" },
            { n: "Action", body: "liste, CSV, outreach" },
          ],
        }
      : {
          eyebrow: "The flow",
          title: "From niche to CSV, without friction.",
          steps: [
            { n: "Search", body: "niche + location" },
            { n: "Merge", body: "sources, dedup, cleanup" },
            { n: "Score", body: "0–100 per objective" },
            { n: "Act", body: "list, CSV, outreach" },
          ],
        };
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
      <div className="max-w-2xl">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
          {c.eyebrow}
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {c.title}
        </h2>
      </div>
      <div className="mt-12 flex flex-col gap-0 overflow-hidden rounded-2xl border border-border-strong bg-surface/60 md:flex-row md:divide-x md:divide-border">
        {c.steps.map((s, i) => (
          <div key={s.n} className="relative flex-1 p-6 md:p-8">
            <div className="font-mono text-[11px] text-accent-cyan">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              {s.n}
            </div>
            <div className="mt-1 text-sm text-muted-strong">{s.body}</div>
            {i < c.steps.length - 1 ? (
              <ArrowRight
                size={14}
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-muted md:block"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/* Comparison band */

export function Comparison() {
  const { locale } = useI18n();
  const c =
    locale === "fr"
      ? {
          eyebrow: "Avant · Après",
          title: "La différence est brutale.",
          before: {
            title: "Sans Findely",
            items: [
              "Heures perdues sur Google Maps",
              "CSV sales, doublons partout",
              "Priorisation au feeling",
              "Export manuel dans Excel",
            ],
          },
          after: {
            title: "Avec Findely",
            items: [
              "Une recherche, des leads propres",
              "Doublons fusionnés automatiquement",
              "Score 0-100 et signaux visibles",
              "Export CSV en un clic",
            ],
          },
        }
      : {
          eyebrow: "Before · After",
          title: "The difference is brutal.",
          before: {
            title: "Without Findely",
            items: [
              "Hours lost clicking through Maps",
              "Dirty CSVs full of duplicates",
              "Prioritization by gut feeling",
              "Manual copy-paste into Excel",
            ],
          },
          after: {
            title: "With Findely",
            items: [
              "One search, clean leads",
              "Duplicates merged automatically",
              "0–100 score and live signals",
              "One-click CSV export",
            ],
          },
        };
  return (
    <section className="relative border-y border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {c.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-0 overflow-hidden rounded-2xl border border-border-strong md:grid-cols-2">
          <div className="bg-background-2/60 p-8">
            <div className="inline-flex rounded-md bg-danger/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-danger">
              {c.before.title}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {c.before.items.map((i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-muted-strong line-through decoration-danger/50"
                >
                  <span className="mt-1 inline-block h-1 w-1 flex-none rounded-full bg-danger/70" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-accent/[0.08] to-transparent p-8 md:border-l md:border-border">
            <div className="inline-flex rounded-md bg-accent/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-cyan">
              {c.after.title}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {c.after.items.map((i) => (
                <li key={i} className="flex items-start gap-2 text-foreground">
                  <span className="mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-accent/20 text-accent-cyan">
                    <Check size={10} />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Testimonial */

export function Testimonial() {
  const { locale } = useI18n();
  const c =
    locale === "fr"
      ? {
          quote:
            "J’ai fait plus de RDV en deux semaines qu’en deux mois. Findely a viré le travail ingrat de ma semaine.",
          name: "Léa M.",
          role: "Fondatrice, agence web",
        }
      : {
          quote:
            "I booked more meetings in two weeks than I had in two months. Findely simply removed the boring part of my week.",
          name: "Lea M.",
          role: "Founder, web agency",
        };
  return (
    <section className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center lg:px-8 lg:py-28">
        <Quote size={28} className="mx-auto text-accent-cyan" />
        <p className="mt-6 text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
          “{c.quote}”
        </p>
        <div className="mt-6 text-sm text-muted-strong">
          <span className="font-medium text-foreground">{c.name}</span> ·{" "}
          {c.role}
        </div>
      </div>
    </section>
  );
}

/* Closing CTA */

export function ClosingBand() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="bg-spotlight pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-24 text-center lg:px-8 lg:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-3 py-1 text-xs text-muted-strong">
          <Zap size={12} className="text-accent-cyan" />
          Ready in 60 seconds
        </span>
        <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t.finalCta.title}
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-strong">
          {t.finalCta.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton
            href="/app/search"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
          >
            {t.finalCta.primary}
          </LinkButton>
          <LinkButton
            href="/app"
            size="lg"
            variant="outline"
            leftIcon={<Search size={16} />}
          >
            {t.finalCta.secondary}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
