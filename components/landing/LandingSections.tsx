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
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
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
    <section className="border-y border-white/[0.06] bg-white/[0.02]">
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
          "Signal « sans site » surfacé en un coup d'œil",
        ],
        cta: "Lancer une recherche",
      }
    : {
        eyebrow: "Stop copy-pasting",
        title: "Your team shouldn't scrape by hand.",
        body: "Findely blends Google Places with public directories and ships you clean, scored lists — in seconds, not days.",
        points: [
          "One search, multiple sources",
          "Duplicates detected and merged automatically",
          "'No website' signal surfaced at a glance",
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

        <div className="beam-host relative">
          <div className="bg-aurora pointer-events-none absolute -inset-8" />
          <div className="glow-accent relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <BorderBeam duration={12} size={220} colorFrom="#6366f1" colorTo="#f59e0b" />
            <div className="relative z-[2] flex items-center justify-between border-b border-white/[0.06] pb-4 text-xs text-muted">
              <span className="inline-flex items-center gap-2 text-foreground">
                <Sparkles size={12} className="text-accent-cyan" />
                {locale === "fr" ? "Pipeline en direct" : "Live pipeline"}
              </span>
              <span className="font-mono">findely.app</span>
            </div>
            <div className="relative z-[2] mt-5 space-y-3">
              {[
                {
                  k: locale === "fr" ? "Établissements scannés" : "Places scanned",
                  v: 12480,
                  d: 0,
                },
                {
                  k: locale === "fr" ? "Doublons supprimés" : "Duplicates removed",
                  v: 1204,
                  d: 180,
                },
                {
                  k: locale === "fr" ? "Signaux détectés" : "Signals detected",
                  v: 8337,
                  d: 360,
                },
                {
                  k: locale === "fr" ? "Scorés ≥ 75" : "Scored ≥ 75",
                  v: 2981,
                  d: 540,
                },
              ].map((s) => (
                <div
                  key={s.k}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-3"
                >
                  <span className="text-sm text-muted-strong">{s.k}</span>
                  <NumberTicker
                    value={s.v}
                    delay={s.d}
                    duration={1600}
                    className="font-mono text-base text-foreground"
                  />
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

type StatKind =
  | { kind: "ticker"; prefix?: string; value: number; suffix?: string; delay: number }
  | { kind: "text"; text: string };

export function StatBand() {
  const { locale } = useI18n();
  const labels =
    locale === "fr"
      ? [
          "Recherche accélérée",
          "Score par lead",
          "Recherche moyenne",
          "Export en un clic",
        ]
      : [
          "Faster prospecting",
          "Per-lead score",
          "Average search",
          "One-click export",
        ];

  const values: StatKind[] = [
    { kind: "ticker", value: 10, suffix: "×", delay: 0 },
    { kind: "text", text: "0→100" },
    { kind: "ticker", prefix: "< ", value: 3, suffix: " s", delay: 320 },
    { kind: "text", text: "CSV" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06]">
      <div className="bg-spotlight pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/[0.06] px-5 py-14 text-center sm:grid-cols-4 lg:px-8">
        {values.map((v, i) => (
          <div key={labels[i]} className="group relative px-4">
            <div className="text-gradient text-3xl font-semibold tracking-tight transition-[text-shadow] duration-500 group-hover:[text-shadow:0_0_28px_rgba(99,102,241,0.55)] sm:text-4xl">
              {v.kind === "ticker" ? (
                <NumberTicker
                  value={v.value}
                  prefix={v.prefix}
                  suffix={v.suffix}
                  delay={v.delay}
                  duration={1400}
                />
              ) : (
                <span className="inline-block">{v.text}</span>
              )}
            </div>
            <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {labels[i]}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
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
          subtitle:
            "Quatre étapes. Un seul outil. Votre prochaine liste est prête en moins d'une minute.",
          steps: [
            { n: "Recherche", body: "Niche + localisation", icon: Search },
            { n: "Fusion", body: "Dédup multi-sources", icon: Sparkles },
            { n: "Score", body: "0–100 par objectif", icon: Zap },
            { n: "Export", body: "CSV prêt outreach", icon: ArrowRight },
          ],
        }
      : {
          eyebrow: "The flow",
          title: "From niche to CSV, without friction.",
          subtitle:
            "Four steps. One tool. Your next list is ready in under a minute.",
          steps: [
            { n: "Search", body: "Niche + location", icon: Search },
            { n: "Merge", body: "Multi-source dedup", icon: Sparkles },
            { n: "Score", body: "0–100 per objective", icon: Zap },
            { n: "Export", body: "Outreach-ready CSV", icon: ArrowRight },
          ],
        };
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06]">
      <div className="bg-spotlight pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {c.eyebrow}
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {c.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] text-muted-strong">
            {c.subtitle}
          </p>
        </div>
        <div className="relative mt-14 grid gap-0 sm:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent sm:block"
          />
          {c.steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_0_40px_-12px_rgba(99,102,241,0.3)]">
                  <Icon size={20} className="text-accent-cyan" />
                </div>
                <div className="mt-4 text-[11px] font-mono text-accent-cyan/80">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  {s.n}
                </div>
                <div className="mt-1 text-[13px] text-muted-strong">{s.body}</div>
              </div>
            );
          })}
        </div>
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
          title: "Le même effort, des résultats incomparables.",
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
          title: "Same effort, incomparable results.",
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
    <section className="relative">
      <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-cyan">
            {c.eyebrow}
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {c.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-7">
            <div className="inline-flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              {c.before.title}
            </div>
            <ul className="mt-6 space-y-4">
              {c.before.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px] text-muted-strong"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-danger/60" />
                  <span className="line-through decoration-danger/40">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/[0.04] p-7">
            <div className="inline-flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              {c.after.title}
            </div>
            <ul className="mt-6 space-y-4">
              {c.after.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-foreground">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/15 text-accent-cyan">
                    <Check size={11} />
                  </span>
                  {item}
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
            "J'ai fait plus de RDV en deux semaines qu'en deux mois. Findely a viré le travail ingrat de ma semaine.",
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
    <section className="relative overflow-hidden border-y border-white/[0.06]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(99,102,241,0.12), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-24">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04]">
          <Quote size={16} className="text-accent-cyan" />
        </div>
        <p className="mt-6 text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          &ldquo;{c.quote}&rdquo;
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-cyan" />
          <div className="text-left text-sm">
            <div className="font-medium text-foreground">{c.name}</div>
            <div className="text-[12px] text-muted">{c.role}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Closing CTA */

export function ClosingBand() {
  const { t, locale } = useI18n();
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06]">
      <div className="bg-spotlight pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-24 text-center lg:px-8 lg:py-28">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
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
