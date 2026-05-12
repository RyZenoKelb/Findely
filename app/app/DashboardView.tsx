"use client";

import {
  ArrowRight,
  Bookmark,
  Clock,
  Code2,
  Download,
  KeyRound,
  LayoutGrid,
  ListChecks,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { MigrationBanner } from "@/components/migration/MigrationBanner";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import type {
  LeadList,
  LeadObjective,
  SearchQuery,
  UsageStats,
} from "@/lib/leadTypes";
import { displayListName } from "@/lib/listNames";
import { objectiveEntries, objectiveLabel } from "@/lib/localizedLabels";
import { useI18n } from "@/lib/i18n";
import { isUnlimited, type Plan } from "@/lib/plans";
import type { UsageSummary } from "@/lib/quota";
import {
  DEFAULT_USAGE,
  STORAGE_KEYS,
  ensureDefaultLists,
  getEmptySnapshot,
  getRawSnapshot,
  subscribeToLocalStorage,
} from "@/lib/storage";
import { formatNumber, formatRelative } from "@/lib/utils";

export interface DashboardOverviewData {
  recentSearches: {
    id: string;
    businessType: string;
    location: string;
    objective: string | null;
    createdAt: string;
  }[];
  recentLists: {
    id: string;
    name: string;
    leadCount: number;
  }[];
  savedLeadsCount: number;
}

export interface DashboardViewProps {
  authed?: boolean;
  onboardingCompleted?: boolean;
  email?: string | null;
  profileName?: string | null;
  summary?: UsageSummary | null;
  overview?: DashboardOverviewData | null;
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

function formatLimit(n: number): string {
  return isUnlimited(n) ? "∞" : formatNumber(n);
}

function UsageRing({
  value,
  max,
  label,
  icon: Icon,
}: {
  value: number;
  max: number;
  label: string;
  icon: React.ElementType;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const tone = pct >= 90 ? "text-danger" : pct >= 70 ? "text-warning" : "text-accent-cyan";
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 36 36">
          <path
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-white/[0.06]"
          />
          <path
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
            className={tone}
          />
        </svg>
        <Icon size={14} className={tone} />
      </div>
      <div>
        <div className="text-[13px] font-medium text-foreground">
          {formatNumber(value)}{" "}
          <span className="text-muted">/ {formatLimit(max)}</span>
        </div>
        <div className="text-[11px] text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardView({
  authed = false,
  onboardingCompleted = false,
  email = null,
  profileName = null,
  summary = null,
  overview = null,
}: DashboardViewProps = {}) {
  const { t, locale } = useI18n();

  const rawSearches = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.searches),
    getEmptySnapshot
  );
  const rawLists = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.lists),
    getEmptySnapshot
  );
  const rawUsage = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.usage),
    getEmptySnapshot
  );

  const localSearches = React.useMemo<SearchQuery[]>(() => {
    if (!rawSearches) return [];
    try {
      return JSON.parse(rawSearches) as SearchQuery[];
    } catch {
      return [];
    }
  }, [rawSearches]);
  const localLists = React.useMemo<LeadList[]>(() => {
    if (!rawLists) return [];
    try {
      return JSON.parse(rawLists) as LeadList[];
    } catch {
      return [];
    }
  }, [rawLists]);
  const localUsage = React.useMemo<UsageStats>(() => {
    if (!rawUsage) return DEFAULT_USAGE;
    try {
      return JSON.parse(rawUsage) as UsageStats;
    } catch {
      return DEFAULT_USAGE;
    }
  }, [rawUsage]);

  const [quick, setQuick] = React.useState({
    businessType: "",
    location: "",
    objective: "general" as LeadObjective,
  });

  React.useEffect(() => {
    ensureDefaultLists();
  }, []);

  const quickHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (quick.businessType) params.set("q", quick.businessType);
    if (quick.location) params.set("where", quick.location);
    if (quick.objective) params.set("obj", quick.objective);
    const qs = params.toString();
    return qs ? `/app/search?${qs}` : "/app/search";
  }, [quick]);

  const useDb = authed;
  const leadsUsed = useDb ? (summary?.display.leads ?? 0) : localUsage.leadsFound;
  const searchesUsed = useDb
    ? (summary?.display.searches ?? 0)
    : localUsage.searchesRun;
  const exportsUsed = useDb ? (summary?.display.exports ?? 0) : localUsage.exports;
  const savedCount = useDb
    ? (overview?.savedLeadsCount ?? 0)
    : localLists.reduce((s, l) => s + l.leadIds.length, 0);

  const limits = authed ? (summary?.limits ?? null) : null;
  const planId = authed ? (summary?.plan ?? null) : null;
  const canUseApi = limits?.canUseApi ?? false;

  const recentSearchesUi = useDb
    ? overview?.recentSearches ?? []
    : localSearches.slice(0, 6).map((s) => ({
        id: s.id,
        businessType: s.businessType,
        location: s.location,
        objective: s.objective ?? "general",
        createdAt: s.createdAt,
      }));

  const recentListsUi = useDb
    ? overview?.recentLists ?? []
    : localLists.slice(0, 6).map((l) => ({
        id: l.id,
        name: l.name,
        leadCount: l.leadIds.length,
      }));

  const displayName = profileName
    ? profileName
    : email
      ? email.split("@")[0]
      : locale === "fr"
        ? "vous"
        : "there";

  return (
    <div className="space-y-6">
      {/* Welcome + Quick Search */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex-1">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {t.app.welcome}
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {authed
              ? locale === "fr"
                ? `Bonjour ${displayName}`
                : `Hi ${displayName}`
              : t.app.welcomeTitle}
          </h1>
          <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-strong">
            {t.app.welcomeSub}
          </p>
        </div>
        <LinkButton
          href="/app/search"
          size="md"
          rightIcon={<ArrowRight size={14} />}
        >
          {t.app.newSearch}
        </LinkButton>
      </div>

      <MigrationBanner authed={authed} />
      <OnboardingPanel
        authed={authed}
        initiallyCompleted={onboardingCompleted}
      />

      {/* Usage Strip — horizontal, compact */}
      {useDb && planId && limits ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10">
                <Sparkles size={13} className="text-accent-strong" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  {planLabel(planId, t)}
                  {canUseApi ? (
                    <Badge tone="accent" className="text-[9px]">API</Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <UsageRing
                value={searchesUsed}
                max={limits.monthlySearches}
                label={t.usage.searches}
                icon={Search}
              />
              <UsageRing
                value={leadsUsed}
                max={limits.monthlyLeads}
                label={t.usage.leads}
                icon={LayoutGrid}
              />
              <UsageRing
                value={exportsUsed}
                max={limits.monthlyExports}
                label={t.usage.exportsLabel}
                icon={Download}
              />
            </div>
            <LinkButton href="/app/usage" size="sm" variant="ghost">
              {t.sidebar.viewUsage}
            </LinkButton>
          </div>
        </div>
      ) : null}

      {/* Metrics Row — only for non-authed users who don't see the Usage Strip */}
      {!useDb || !planId || !limits ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: t.app.leadsFound, value: leadsUsed, icon: LayoutGrid },
            { label: t.app.searchesRun, value: searchesUsed, icon: Search },
            { label: t.app.savedLeads, value: savedCount, icon: Bookmark },
            { label: t.app.exports, value: exportsUsed, icon: Download },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                <stat.icon size={15} className="text-muted-strong" />
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight text-foreground">
                  {formatNumber(stat.value)}
                </div>
                <div className="text-[11px] text-muted">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Quick Search — full width, inline */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-accent-cyan" />
          <h3 className="text-[14px] font-semibold text-foreground">
            {t.app.quickSearchTitle}
          </h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor="qb">{t.searchForm.businessType}</Label>
            <Input
              id="qb"
              value={quick.businessType}
              onChange={(e) =>
                setQuick((s) => ({ ...s, businessType: e.target.value }))
              }
              placeholder="restaurants"
            />
          </div>
          <div>
            <Label htmlFor="ql">{t.searchForm.location}</Label>
            <div className="relative">
              <MapPin
                size={13}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                id="ql"
                value={quick.location}
                onChange={(e) =>
                  setQuick((s) => ({ ...s, location: e.target.value }))
                }
                placeholder="Paris"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="qo">{t.searchForm.objective}</Label>
            <Select
              id="qo"
              value={quick.objective}
              onChange={(e) =>
                setQuick((s) => ({
                  ...s,
                  objective: e.target.value as LeadObjective,
                }))
              }
            >
              {objectiveEntries(locale).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <LinkButton
              href={quickHref}
              className="w-full"
              rightIcon={<ArrowRight size={14} />}
            >
              {t.app.goToSearch}
            </LinkButton>
          </div>
        </div>
      </div>

      {/* Activity — Two columns */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent Searches */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-muted" />
              <h3 className="text-[13px] font-semibold text-foreground">
                {t.app.recentSearches}
              </h3>
            </div>
            <Link
              href="/app/searches"
              className="text-[11px] font-medium text-accent-strong hover:text-accent"
            >
              {t.app.viewAll}
            </Link>
          </div>
          {recentSearchesUi.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-muted">
              {locale === "fr"
                ? "Aucune recherche encore. Lancez-en une ci-dessus."
                : "No searches yet. Run one from above."}
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {recentSearchesUi.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Search size={13} className="flex-none text-muted" />
                    <span className="truncate text-[13px] text-foreground">
                      {s.businessType} {locale === "fr" ? "à" : "in"}{" "}
                      {s.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="hidden sm:inline">
                      {objectiveLabel(
                        (s.objective as LeadObjective) ?? "general",
                        locale
                      )}
                    </span>
                    <span>{formatRelative(s.createdAt)}</span>
                    <Link
                      href={`/app/search?q=${encodeURIComponent(
                        s.businessType
                      )}&where=${encodeURIComponent(s.location)}&obj=${
                        s.objective ?? "general"
                      }`}
                      className="font-medium text-accent-strong hover:text-accent"
                    >
                      {locale === "fr" ? "Relancer" : "Re-run"}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Lists + Developer */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <ListChecks size={13} className="text-muted" />
                {t.app.savedListsTitle}
              </h3>
              <Link
                href="/app/lists"
                className="text-[11px] font-medium text-accent-strong hover:text-accent"
              >
                {t.app.viewAll}
              </Link>
            </div>
            <ul className="mt-3 space-y-1.5">
              {recentListsUi.slice(0, 4).map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/app/lists?id=${l.id}`}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="text-foreground">
                      {displayListName(l.name, locale)}
                    </span>
                    <span className="text-[11px] text-muted">
                      {l.leadCount} leads
                    </span>
                  </Link>
                </li>
              ))}
              {recentListsUi.length === 0 ? (
                <li className="py-4 text-center text-[12px] text-muted">
                  {locale === "fr"
                    ? "Aucune liste. Enregistrez un lead."
                    : "No lists yet. Save a lead."}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-accent/[0.04] to-surface p-4">
            <div className="flex items-center gap-2">
              <Code2 size={13} className="text-accent-cyan" />
              <h3 className="text-[13px] font-semibold text-foreground">
                {locale === "fr" ? "API v1" : "API v1"}
              </h3>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-strong">
              {canUseApi
                ? locale === "fr"
                  ? "Votre plan inclut l'API. Créez une clé pour intégrer Findely."
                  : "Your plan includes API access. Create a key to integrate."
                : locale === "fr"
                  ? "Intégrez Findely dans vos outils avec l'API REST."
                  : "Ship Findely inside your tools with the REST API."}
            </p>
            <div className="mt-3 flex gap-2">
              <LinkButton
                href={canUseApi ? "/app/api-keys" : "/pricing#api"}
                size="sm"
                variant="outline"
                leftIcon={<KeyRound size={11} />}
              >
                {canUseApi
                  ? locale === "fr" ? "Clés API" : "API keys"
                  : locale === "fr" ? "Offres API" : "API plans"}
              </LinkButton>
              <LinkButton
                href="/developers"
                size="sm"
                variant="ghost"
                leftIcon={<Code2 size={11} />}
              >
                Docs
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
