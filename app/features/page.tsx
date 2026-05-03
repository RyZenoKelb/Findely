"use client";

import {
  Database,
  Download,
  Filter,
  Gauge,
  ListChecks,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PublicPageHeader,
  PublicShell,
} from "@/components/landing/PublicShell";
import { ClosingBand } from "@/components/landing/LandingSections";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Block {
  icon: LucideIcon;
  tag: string;
  title: string;
  body: string;
  chart: React.ReactNode;
}

function DiscoveryChart() {
  const labels = ["Google Places", "Directories", "Maps", "Public listings"];
  return (
    <div className="flex flex-col gap-3">
      {labels.map((l, i) => (
        <div
          key={l}
          className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2.5"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-accent/15 text-[11px] font-mono text-accent-cyan">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-foreground">{l}</span>
          <span className="ml-auto font-mono text-xs text-muted">
            {12000 - i * 2200} scanned
          </span>
        </div>
      ))}
    </div>
  );
}

function ScoreChart() {
  const bars = [92, 84, 76, 68, 55, 41];
  return (
    <div className="space-y-2">
      {bars.map((b, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 truncate text-xs text-muted-strong">
            Lead #{1000 + i}
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent-cyan"
              style={{ width: `${b}%` }}
            />
          </div>
          <span className="w-8 text-right font-mono text-xs tabular-nums text-foreground">
            {b}
          </span>
        </div>
      ))}
    </div>
  );
}

function SignalsChart() {
  const sig = [
    { label: "No website", tone: "text-warning" },
    { label: "High opportunity", tone: "text-success" },
    { label: "Outreach ready", tone: "text-accent-cyan" },
    { label: "Needs online presence", tone: "text-warning" },
    { label: "Local business", tone: "text-muted-strong" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {sig.map((s) => (
        <span
          key={s.label}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs",
            s.tone
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function FiltersChart() {
  const chips = [
    "without_website",
    "with_phone",
    "high_score",
    "outreach_ready",
  ];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent-cyan"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.04] p-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted">Minimum score</span>
          <span className="font-mono text-foreground">≥ 75</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-muted">Require phone</span>
          <span className="font-mono text-success">on</span>
        </div>
      </div>
    </div>
  );
}

function ExportChart() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.04] font-mono text-[11px] text-muted-strong">
      <div className="border-b border-white/[0.06] bg-black/20 px-3 py-2 text-foreground">
        findely-leads.csv
      </div>
      <pre className="overflow-x-auto px-3 py-3 leading-relaxed">
{`name,phone,website,score,signals
Saffron & Co.,+33 1...,, 92, no_website|outreach_ready
Atlas Pixel,,atlaspixel.co,81,has_website|high_opp
Harbor Bistro,+1 212...,,74,local_business|…`}
      </pre>
    </div>
  );
}

function ListsChart() {
  const lists = [
    { name: "Web agency prospects", n: 124 },
    { name: "SEO opportunities", n: 87 },
    { name: "To contact · Paris", n: 43 },
    { name: "Contacted · Nov", n: 29 },
  ];
  return (
    <div className="space-y-2">
      {lists.map((l) => (
        <div
          key={l.name}
          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm"
        >
          <span className="text-foreground">{l.name}</span>
          <span className="font-mono text-xs text-muted">{l.n}</span>
        </div>
      ))}
    </div>
  );
}

const ICON_ORDER: LucideIcon[] = [
  Database,
  Filter,
  Gauge,
  Sparkles,
  ListChecks,
  Download,
];
const CHART_ORDER: React.ReactNode[] = [
  <DiscoveryChart key="d" />,
  <FiltersChart key="f" />,
  <ScoreChart key="s" />,
  <SignalsChart key="si" />,
  <ListsChart key="li" />,
  <ExportChart key="e" />,
];

export default function FeaturesPage() {
  const { t } = useI18n();

  const blocks: Block[] = t.features.items.slice(0, 6).map((item, i) => ({
    icon: ICON_ORDER[i],
    tag: String(i + 1).padStart(2, "0"),
    title: item.title,
    body: item.body,
    chart: CHART_ORDER[i],
  }));

  return (
    <PublicShell>
      <PublicPageHeader
        eyebrow={t.features.eyebrow}
        title={t.features.title}
      />

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-24 lg:gap-32">
          {blocks.map((b, i) => {
            const flipped = i % 2 === 1;
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={cn(
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  flipped && "lg:[&>div:first-child]:order-2"
                )}
              >
                <div>
                  <div className="font-mono text-xs text-accent-cyan">
                    {b.tag}
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    <Icon
                      size={20}
                      className="mr-2 inline-block text-accent-cyan"
                    />
                    {b.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-strong">
                    {b.body}
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-aurora pointer-events-none absolute -inset-8 opacity-60" />
                  <div className="glow-accent relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
                    {b.chart}
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
