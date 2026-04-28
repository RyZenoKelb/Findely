"use client";

import {
  Bookmark,
  Building2,
  CheckCircle2,
  Database,
  Download,
  Filter,
  Gauge,
  Globe2,
  Layers,
  ListChecks,
  MailCheck,
  MapPin,
  Rocket,
  Search,
  Sparkles,
  Stethoscope,
  Store,
  Target,
  Users,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";

function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28 ${className ?? ""}`}
    >
      <div className="mb-12 max-w-2xl">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent-cyan">
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-strong">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function Problem() {
  const { t } = useI18n();
  return (
    <SectionShell
      id="problem"
      eyebrow={t.problem.eyebrow}
      title={t.problem.title}
      subtitle={t.problem.subtitle}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {t.problem.items.map((it) => (
          <div
            key={it.title}
            className="rounded-xl border border-border bg-surface bg-panel p-5"
          >
            <div className="inline-flex rounded-md bg-danger/10 p-2 text-danger">
              <Target size={16} />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-foreground">
              {it.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
              {it.body}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function Solution() {
  const { t } = useI18n();
  return (
    <SectionShell
      id="solution"
      eyebrow={t.solution.eyebrow}
      title={t.solution.title}
      subtitle={t.solution.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <ul className="space-y-3">
            {t.solution.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md bg-accent/15 text-accent-cyan">
                  <CheckCircle2 size={14} />
                </span>
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <LinkButton
              href="/app/search"
              size="md"
              rightIcon={<Search size={14} />}
            >
              {t.solution.tryIt}
            </LinkButton>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
          <div className="bg-radial-cyan pointer-events-none absolute inset-0" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { k: "Sources", v: "Multi" },
              { k: "Scoring", v: "0–100" },
              { k: "Cleaning", v: "Auto" },
              { k: "Export", v: "CSV" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-xl border border-border bg-surface-2 p-4"
              >
                <div className="text-xs uppercase tracking-wide text-muted">
                  {s.k}
                </div>
                <div className="mt-1 bg-gradient-to-r from-foreground to-accent-cyan bg-clip-text text-2xl font-semibold text-transparent">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2 text-xs">
            <Badge tone="accent">No website</Badge>
            <Badge tone="accent">High opportunity</Badge>
            <Badge tone="success">Outreach ready</Badge>
            <Badge tone="muted">Local business</Badge>
            <Badge tone="warning">Missing contact</Badge>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

const USE_CASE_ICONS = [
  Building2,
  Gauge,
  Globe2,
  Users,
  Workflow,
  Layers,
  Stethoscope,
  Store,
];

export function UseCases({ compact }: { compact?: boolean } = {}) {
  const { t } = useI18n();
  const cases = compact ? t.useCases.cases.slice(0, 6) : t.useCases.cases;
  return (
    <SectionShell
      id="use-cases"
      eyebrow={t.useCases.eyebrow}
      title={t.useCases.title}
      subtitle={t.useCases.subtitle}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => {
          const Icon = USE_CASE_ICONS[i % USE_CASE_ICONS.length];
          return (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface bg-panel p-5 transition-all hover:border-border-strong hover:-translate-y-0.5"
            >
              <div className="inline-flex rounded-md border border-border bg-surface-2 p-2 text-accent-cyan">
                <Icon size={16} />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
                {c.desc}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

const FEATURE_ICONS = [
  Search,
  Filter,
  Gauge,
  Sparkles,
  ListChecks,
  Download,
  Bookmark,
  Database,
  Rocket,
];

export function Features({ compact }: { compact?: boolean } = {}) {
  const { t } = useI18n();
  const items = compact ? t.features.items.slice(0, 6) : t.features.items;
  return (
    <SectionShell
      id="features"
      eyebrow={t.features.eyebrow}
      title={t.features.title}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          return (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-surface bg-panel p-5 transition-all hover:border-border-strong"
            >
              <div className="inline-flex rounded-md bg-accent/10 p-2 text-accent-cyan">
                <Icon size={16} />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <SectionShell
      id="how-it-works"
      eyebrow={t.howItWorks.eyebrow}
      title={t.howItWorks.title}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {t.howItWorks.steps.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-xl border border-border bg-surface bg-panel p-5"
          >
            <div className="font-mono text-xs text-accent-cyan">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-foreground">
              {s.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

const PLANS = [
  {
    key: "starter" as const,
    price: "$0",
    features: [
      "100 leads / month",
      "1 source",
      "CSV export",
      "Local lists",
    ],
    featuresFr: [
      "100 leads / mois",
      "1 source",
      "Export CSV",
      "Listes locales",
    ],
    cta: "Start free",
    ctaFr: "Commencer gratuitement",
    href: "/app/search",
  },
  {
    key: "pro" as const,
    price: "$39",
    features: [
      "2,000 leads / month",
      "All sources",
      "Lead scoring",
      "Saved searches",
      "Priority support",
    ],
    featuresFr: [
      "2 000 leads / mois",
      "Toutes les sources",
      "Scoring de leads",
      "Recherches enregistrées",
      "Support prioritaire",
    ],
    cta: "Start Pro",
    ctaFr: "Commencer Pro",
    highlighted: true,
    href: "/app/search",
  },
  {
    key: "agency" as const,
    price: "$129",
    features: [
      "15,000 leads / month",
      "All sources + custom",
      "Advanced scoring",
      "Team seats",
      "Account manager",
    ],
    featuresFr: [
      "15 000 leads / mois",
      "Toutes sources + custom",
      "Scoring avancé",
      "Sièges équipe",
      "Account manager",
    ],
    cta: "Talk to sales",
    ctaFr: "Contacter l’équipe",
    href: "mailto:sales@findely.app",
  },
];

export function Pricing() {
  const { t, locale } = useI18n();
  const names: Record<"starter" | "pro" | "agency", string> =
    locale === "fr"
      ? { starter: "Starter", pro: "Pro", agency: "Agence" }
      : { starter: "Starter", pro: "Pro", agency: "Agency" };
  const descs: Record<"starter" | "pro" | "agency", string> =
    locale === "fr"
      ? {
          starter: "Pour les freelances qui testent Findely.",
          pro: "Pour les agences qui font de l’outbound chaque semaine.",
          agency: "Pour les équipes qui opèrent à l’échelle.",
        }
      : {
          starter: "For freelancers trying Findely on the side.",
          pro: "For agencies running weekly outbound.",
          agency: "For teams operating at scale.",
        };
  return (
    <SectionShell
      id="pricing"
      eyebrow={t.pricing.eyebrow}
      title={t.pricing.title}
      subtitle={t.pricing.subtitle}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`relative rounded-2xl border bg-surface p-6 ${
              p.highlighted
                ? "border-accent/40 bg-gradient-to-b from-accent/[0.1] to-transparent glow-accent"
                : "border-border"
            }`}
          >
            {p.highlighted ? (
              <Badge
                tone="accent"
                className="absolute right-5 top-5 text-[10px]"
              >
                {t.pricing.mostPopular}
              </Badge>
            ) : null}
            <div className="text-sm font-medium text-muted-strong">
              {names[p.key]}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-foreground">
                {p.price}
              </span>
              <span className="text-sm text-muted">{t.pricing.month}</span>
            </div>
            <p className="mt-2 text-sm text-muted-strong">{descs[p.key]}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {(locale === "fr" ? p.featuresFr : p.features).map((f) => (
                <li key={f} className="flex items-start gap-2 text-foreground">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 flex-none text-accent-cyan"
                  />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <LinkButton
                href={p.href}
                size="md"
                variant={p.highlighted ? "primary" : "outline"}
                className="w-full"
              >
                {locale === "fr" ? p.ctaFr : p.cta}
              </LinkButton>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function PricingFaq() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 lg:px-8">
      <h3 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        {t.pricing.faqTitle}
      </h3>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {t.pricing.faq.map((f) => (
          <div
            key={f.q}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="text-sm font-semibold text-foreground">{f.q}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-strong">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="bg-radial-fade pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t.finalCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-strong">
          {t.finalCta.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton
            href="/app/search"
            size="lg"
            rightIcon={<MailCheck size={16} />}
          >
            {t.finalCta.primary}
          </LinkButton>
          <LinkButton href="/app" size="lg" variant="outline">
            {t.finalCta.secondary}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Logo href="/" />
          <span className="hidden text-muted md:inline">
            · Find targeted leads in seconds.
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-muted-strong">
            <MapPin size={12} /> Worldwide
          </span>
          <span>© {new Date().getFullYear()} Findely</span>
        </div>
      </div>
    </footer>
  );
}
