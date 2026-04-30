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
import { useI18n } from "@/lib/i18n";
import {
  DEFAULT_USAGE,
  getLists,
  getSearches,
  getUsage,
} from "@/lib/storage";
import {
  PLANS,
  getPlanLimits,
  isUnlimited,
  normalizePlan,
  type Plan,
} from "@/lib/plans";
import { cn, formatNumber } from "@/lib/utils";

function subscribeToStorage(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function Bar({ value, max }: { value: number; max: number }) {
  if (!Number.isFinite(max) || max <= 0) return null;
  const pct = Math.min(100, (value / max) * 100);
  const tone = pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-accent";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <div className={cn("h-full", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export interface UsageViewProps {
  /** Current plan from profiles.plan. Null → fall back to "free". */
  plan: Plan | null;
  /** Authenticated user email, if any. */
  email: string | null;
  /** Server-aggregated DB usage for the current cycle. Null → unauth fallback. */
  dbUsage: {
    searches: number;
    leads: number;
    exports: number;
    cycleEnd: string;
  } | null;
  /** Recent CSV exports for this user. Empty for unauth. */
  exportsHistory?: Array<{
    id: string;
    type: string;
    leadCount: number;
    createdAt: string;
  }>;
}

function planLabel(plan: Plan, t: ReturnType<typeof useI18n>["t"]): string {
  const p = t.plans;
  switch (plan) {
    case "free":
      return p?.free ?? "Free";
    case "starter":
      return p?.starter ?? "Starter";
    case "pro":
      return p?.pro ?? "Pro";
    case "agency":
      return p?.agency ?? "Agency";
    case "api_starter":
      return p?.apiStarter ?? "API Starter";
    case "api_pro":
      return p?.apiPro ?? "API Pro";
    case "api_scale":
      return p?.apiScale ?? "API Scale";
    default:
      return plan;
  }
}

function formatLimit(n: number) {
  return isUnlimited(n) ? "∞" : formatNumber(n);
}

function formatCycleEnd(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function UsageView({
  plan,
  email,
  dbUsage,
  exportsHistory = [],
}: UsageViewProps) {
  const { t, locale } = useI18n();

  // Snapshot localStorage without setState-in-effect.
  const localUsage = React.useSyncExternalStore(
    subscribeToStorage,
    () => getUsage(),
    () => DEFAULT_USAGE,
  );
  const savedCount = React.useSyncExternalStore(
    subscribeToStorage,
    () => getLists().reduce((s, l) => s + l.leadIds.length, 0),
    () => 0,
  );
  const searchCount = React.useSyncExternalStore(
    subscribeToStorage,
    () => getSearches().length,
    () => 0,
  );

  const currentPlan = normalizePlan(plan);
  const limits = getPlanLimits(currentPlan);

  // DB usage wins when authenticated; otherwise fall back to localStorage demo counters.
  const searchesUsed = dbUsage?.searches ?? localUsage.searchesRun;
  const leadsUsed = dbUsage?.leads ?? localUsage.leadsFound;
  const exportsUsed = dbUsage?.exports ?? localUsage.exports;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-strong">
            <Sparkles size={16} />
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">
              {t.usage.currentPlan}
            </div>
            <div className="text-lg font-semibold text-foreground">
              {planLabel(currentPlan, t)}
              {!dbUsage ? (
                <Badge tone="outline" className="ml-2">
                  {t.usage.demo}
                </Badge>
              ) : null}
            </div>
            {email ? (
              <div className="mt-0.5 text-xs text-muted">{email}</div>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/pricing" variant="outline" size="sm">
            {t.usage.comparePlans}
          </LinkButton>
          <LinkButton href="/pricing" size="sm">
            {t.usage.upgrade}
          </LinkButton>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t.app.leadsFound}
          value={leadsUsed}
          icon={LayoutGrid}
          accent
        />
        <StatsCard
          label={t.app.searchesRun}
          value={searchesUsed}
          icon={Search}
        />
        <StatsCard
          label={t.app.savedLeads}
          value={savedCount}
          icon={Bookmark}
        />
        <StatsCard
          label={t.app.exports}
          value={exportsUsed}
          icon={Download}
        />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-muted" />
            <h3 className="text-sm font-semibold text-foreground">
              {t.usage.thisCycle}
            </h3>
          </div>
          {dbUsage?.cycleEnd ? (
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
              {locale === "fr" ? "Réinit. le " : "Resets "}
              {formatCycleEnd(dbUsage.cycleEnd, locale)}
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">{t.usage.searches}</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(searchesUsed)} / {formatLimit(limits.monthlySearches)}
              </span>
            </div>
            <Bar value={searchesUsed} max={limits.monthlySearches} />
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">{t.usage.leads}</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(leadsUsed)} / {formatLimit(limits.monthlyLeads)}
              </span>
            </div>
            <Bar value={leadsUsed} max={limits.monthlyLeads} />
          </div>
          <div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-strong">{t.usage.exportsLabel}</span>
              <span className="font-mono text-xs text-muted">
                {formatNumber(exportsUsed)} / {formatLimit(limits.monthlyExports)}
              </span>
            </div>
            <Bar value={exportsUsed} max={limits.monthlyExports} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(["starter", "pro", "agency"] as Plan[]).map((id) => {
          const p = PLANS[id];
          const isCurrent = id === currentPlan;
          const isHighlight = p.highlight === "popular";
          return (
            <div
              key={id}
              className={cn(
                "relative rounded-xl border bg-surface p-5",
                isHighlight
                  ? "border-accent/40 bg-gradient-to-b from-accent/[0.06] to-transparent"
                  : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-strong">
                  {planLabel(id, t)}
                </div>
                {isCurrent ? <Badge tone="accent">{t.usage.current}</Badge> : null}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-foreground">
                  €{p.priceEur}
                </span>
                <span className="text-sm text-muted">/mo</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                <li>· {formatLimit(p.monthlyLeads)} {t.usage.leads.toLowerCase()} / mo</li>
                <li>· {formatLimit(p.monthlySearches)} {t.usage.searches.toLowerCase()} / mo</li>
                <li>· {formatLimit(p.monthlyExports)} {t.usage.exportsLabel.toLowerCase()}</li>
              </ul>
              <LinkButton
                href="/pricing"
                size="sm"
                variant={isHighlight && !isCurrent ? "primary" : "outline"}
                className="mt-5 w-full"
              >
                {isCurrent ? t.usage.current : t.usage.upgrade}
              </LinkButton>
            </div>
          );
        })}
      </section>

      {exportsHistory.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Download size={14} className="text-muted" />
            <h3 className="text-sm font-semibold text-foreground">
              {locale === "fr" ? "Exports récents" : "Recent exports"}
            </h3>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {exportsHistory.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {e.type}
                  </span>
                  <span className="text-foreground">
                    {formatNumber(e.leadCount)} {t.usage.leads.toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {formatCycleEnd(e.createdAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!dbUsage ? (
        <div className="text-xs text-muted">
          {locale === "fr"
            ? `Vous avez ${savedCount} leads enregistrés et ${searchCount} recherches enregistrées sur cet appareil.`
            : `You have ${savedCount} saved leads across your lists and ${searchCount} saved searches on this device.`}
        </div>
      ) : null}
    </div>
  );
}
