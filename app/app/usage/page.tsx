"use client";

import {
  Bookmark,
  Download,
  Gauge,
  LayoutGrid,
  Search,
  Sparkles,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  DEFAULT_USAGE,
  getLists,
  getSearches,
  getUsage,
} from "@/lib/storage";
import { cn, formatNumber } from "@/lib/utils";

const PLAN = {
  name: "Starter",
  limits: {
    searches: 10,
    leads: 100,
    exports: 5,
  },
};

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, max === 0 ? 0 : (value / max) * 100);
  const tone = pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-accent";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function UsagePage() {
  const [usage, setUsage] = React.useState(DEFAULT_USAGE);
  const [savedCount, setSavedCount] = React.useState(0);
  const [searchCount, setSearchCount] = React.useState(0);

  React.useEffect(() => {
    setUsage(getUsage());
    setSavedCount(getLists().reduce((s, l) => s + l.leadIds.length, 0));
    setSearchCount(getSearches().length);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-strong">
            <Sparkles size={16} />
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">
              Current plan
            </div>
            <div className="text-lg font-semibold text-foreground">
              {PLAN.name}
              <Badge tone="outline" className="ml-2">
                Demo
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href="#" variant="outline" size="sm">
            Compare plans
          </LinkButton>
          <LinkButton href="#" size="sm">
            Upgrade to Pro
          </LinkButton>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Leads found"
          value={usage.leadsFound}
          icon={LayoutGrid}
          accent
        />
        <StatsCard
          label="Searches run"
          value={usage.searchesRun}
          icon={Search}
        />
        <StatsCard label="Saved leads" value={savedCount} icon={Bookmark} />
        <StatsCard label="Exports" value={usage.exports} icon={Download} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-muted" />
          <h3 className="text-sm font-semibold text-foreground">
            This billing cycle
          </h3>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">Searches</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(usage.searchesRun)} / {PLAN.limits.searches}
              </span>
            </div>
            <Bar value={usage.searchesRun} max={PLAN.limits.searches} />
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">Leads</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(usage.leadsFound)} / {PLAN.limits.leads}
              </span>
            </div>
            <Bar value={usage.leadsFound} max={PLAN.limits.leads} />
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">Exports</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(usage.exports)} / {PLAN.limits.exports}
              </span>
            </div>
            <Bar value={usage.exports} max={PLAN.limits.exports} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            name: "Starter",
            price: "$0",
            period: "/mo",
            features: ["100 leads / mo", "1 source", "CSV export"],
            cta: "Current plan",
            current: true,
          },
          {
            name: "Pro",
            price: "$39",
            period: "/mo",
            features: ["2,000 leads / mo", "All sources", "Lead scoring"],
            cta: "Upgrade",
            highlight: true,
          },
          {
            name: "Agency",
            price: "$129",
            period: "/mo",
            features: ["15,000 leads / mo", "Advanced scoring", "Team seats"],
            cta: "Talk to sales",
          },
        ].map((p) => (
          <div
            key={p.name}
            className={cn(
              "relative rounded-xl border bg-surface p-5",
              p.highlight
                ? "border-accent/40 bg-gradient-to-b from-accent/[0.06] to-transparent"
                : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-strong">
                {p.name}
              </div>
              {p.current ? <Badge tone="accent">Current</Badge> : null}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">
                {p.price}
              </span>
              <span className="text-sm text-muted">{p.period}</span>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground">
              {p.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
            <LinkButton
              href="#"
              size="sm"
              variant={p.highlight ? "primary" : "outline"}
              className="mt-5 w-full"
            >
              {p.cta}
            </LinkButton>
          </div>
        ))}
      </section>

      <div className="text-xs text-muted">
        You have {savedCount} saved leads across your lists and {searchCount}{" "}
        saved searches on this device.
      </div>
    </div>
  );
}
