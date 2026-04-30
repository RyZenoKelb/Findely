"use client";

import {
  ArrowRight,
  Bookmark,
  Building2,
  Clock,
  Download,
  Filter,
  Gauge,
  Globe2,
  LayoutGrid,
  ListChecks,
  MapPin,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MigrationBanner } from "@/components/migration/MigrationBanner";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
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
import {
  DEFAULT_USAGE,
  ensureDefaultLists,
  getLists,
  getSearches,
  getUsage,
} from "@/lib/storage";
import { formatRelative } from "@/lib/utils";

const TEMPLATES: {
  title: string;
  desc: string;
  businessType: string;
  location: string;
  objective: LeadObjective;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}[] = [
  {
    title: "Local restaurants without websites",
    desc: "Classic web agency prospecting play.",
    businessType: "restaurants",
    location: "Tel Aviv",
    objective: "no_website",
    icon: Building2,
  },
  {
    title: "Dentists for SEO outreach",
    desc: "Competitive local niche with good budgets.",
    businessType: "dentists",
    location: "Paris",
    objective: "seo_outreach",
    icon: Globe2,
  },
  {
    title: "Real estate agencies",
    desc: "High-intent B2B clients for marketing services.",
    businessType: "real estate agents",
    location: "New York",
    objective: "marketing_outreach",
    icon: TrendingUp,
  },
  {
    title: "Boutique shops to contact",
    desc: "Local businesses that respond to calls.",
    businessType: "boutique shops",
    location: "London",
    objective: "local",
    icon: Users,
  },
];

export interface DashboardViewProps {
  /** True when the request came from an authenticated user. */
  authed?: boolean;
  /** Current profiles.onboarding_completed value, if authenticated. */
  onboardingCompleted?: boolean;
}

export default function DashboardView({
  authed = false,
  onboardingCompleted = false,
}: DashboardViewProps = {}) {
  const { t, locale } = useI18n();
  const [searches, setSearches] = React.useState<SearchQuery[]>([]);
  const [lists, setLists] = React.useState<LeadList[]>([]);
  const [usage, setUsage] = React.useState<UsageStats>(DEFAULT_USAGE);
  const [quick, setQuick] = React.useState({
    businessType: "",
    location: "",
    objective: "general" as LeadObjective,
  });

  React.useEffect(() => {
    ensureDefaultLists();
    setSearches(getSearches());
    setLists(getLists());
    setUsage(getUsage());
  }, []);

  const quickHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (quick.businessType) params.set("q", quick.businessType);
    if (quick.location) params.set("where", quick.location);
    if (quick.objective) params.set("obj", quick.objective);
    const qs = params.toString();
    return qs ? `/app/search?${qs}` : "/app/search";
  }, [quick]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">
            {t.app.welcome}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {t.app.welcomeTitle}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-strong">
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
      </section>

      <MigrationBanner authed={authed} />
      <OnboardingPanel
        authed={authed}
        initiallyCompleted={onboardingCompleted}
      />


      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t.app.leadsFound}
          value={usage.leadsFound}
          icon={LayoutGrid}
          accent
        />
        <StatsCard
          label={t.app.searchesRun}
          value={usage.searchesRun}
          icon={Search}
        />
        <StatsCard
          label={t.app.savedLeads}
          value={lists.reduce((s, l) => s + l.leadIds.length, 0)}
          icon={Bookmark}
        />
        <StatsCard label={t.app.exports} value={usage.exports} icon={Download} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.app.quickSearch}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                {t.app.quickSearchTitle}
              </h3>
            </div>
            <Filter size={16} className="text-muted" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  id="ql"
                  value={quick.location}
                  onChange={(e) =>
                    setQuick((s) => ({ ...s, location: e.target.value }))
                  }
                  placeholder="Tel Aviv"
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
          </div>
          <div className="mt-4 flex justify-end">
            <LinkButton href={quickHref} rightIcon={<ArrowRight size={14} />}>
              {t.app.goToSearch}
            </LinkButton>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.app.savedLists}
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                {t.app.savedListsTitle}
              </h3>
            </div>
            <Link
              href="/app/lists"
              className="text-xs text-accent-strong hover:text-accent"
            >
              {t.app.viewAll}
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {lists.slice(0, 5).map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <Link
                  href={`/app/lists?id=${l.id}`}
                  className="flex items-center gap-2 text-foreground hover:text-accent-strong"
                >
                  <ListChecks size={14} className="text-muted" />
                  {displayListName(l.name, locale)}
                </Link>
                <span className="text-xs text-muted">
                  {l.leadIds.length} leads
                </span>
              </li>
            ))}
            {lists.length === 0 ? (
              <li className="py-6 text-center text-xs text-muted">
                No lists yet. Run a search and save a lead to create one.
              </li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-muted" />
              <h3 className="text-sm font-semibold text-foreground">
                {t.app.recentSearches}
              </h3>
            </div>
            <Link
              href="/app/searches"
              className="text-xs text-accent-strong hover:text-accent"
            >
              {t.app.viewAll}
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {searches.length === 0 ? (
              <li className="px-5 py-6 text-center text-xs text-muted">
                {t.app.recentSearches}
              </li>
            ) : (
              searches.slice(0, 6).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Search size={14} className="flex-none text-muted" />
                    <span className="truncate text-foreground">
                      {s.businessType} {locale === "fr" ? "à" : "in"}{" "}
                      {s.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="hidden sm:inline">
                      {objectiveLabel(s.objective ?? "general", locale)}
                    </span>
                    <span>{formatRelative(s.createdAt)}</span>
                    <Link
                      href={`/app/search?q=${encodeURIComponent(
                        s.businessType
                      )}&where=${encodeURIComponent(s.location)}&obj=${
                        s.objective ?? "general"
                      }`}
                      className="text-accent-strong hover:text-accent"
                    >
                      {locale === "fr" ? "Relancer" : "Re-run"}
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-muted" />
            <h3 className="text-sm font-semibold text-foreground">
              {t.app.templates}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-strong">
            {t.app.templatesSub}
          </p>
          <div className="mt-4 grid gap-2.5">
            {TEMPLATES.map((tpl) => {
              const href = `/app/search?q=${encodeURIComponent(
                tpl.businessType
              )}&where=${encodeURIComponent(tpl.location)}&obj=${tpl.objective}`;
              const Icon = tpl.icon;
              return (
                <Link
                  key={tpl.title}
                  href={href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-accent/40"
                >
                  <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md bg-accent/10 text-accent-strong">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {tpl.title}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {tpl.desc}
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="ml-auto mt-1 flex-none text-muted transition-colors group-hover:text-accent-strong"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
