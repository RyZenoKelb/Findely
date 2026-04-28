"use client";

import {
  AlertTriangle,
  Check,
  Globe,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Label, Select } from "@/components/ui/Field";
import { sortedCountries } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";
import type {
  LeadFilterKey,
  LeadObjective,
  SearchResponse,
} from "@/lib/leadTypes";
import {
  localizedSource,
  objectiveEntries,
  sourceStatusLabel,
} from "@/lib/localizedLabels";
import type { SourceMetadata } from "@/lib/sources";
import { bumpUsage, getSettings, saveSearch } from "@/lib/storage";
import { cn } from "@/lib/utils";

export interface SearchFormState {
  businessType: string;
  location: string;
  country: string;
  language: string;
  objective: LeadObjective;
  limit: number;
  sources: string[];
  filters: LeadFilterKey[];
  minScore: number | null;
  requirePhone: boolean;
  requireWebsite: boolean;
  includeOnlyContactable: boolean;
  excludeSeen: boolean;
}

export function defaultState(): SearchFormState {
  return {
    businessType: "",
    location: "",
    country: "",
    language: "",
    objective: "general",
    limit: 40,
    sources: ["mock"],
    filters: [],
    minScore: null,
    requirePhone: false,
    requireWebsite: false,
    includeOnlyContactable: false,
    excludeSeen: true,
  };
}

const FILTER_ORDER: LeadFilterKey[] = [
  "all",
  "without_website",
  "with_website",
  "with_phone",
  "missing_contact",
  "has_address",
  "high_score",
  "needs_online_presence",
  "outreach_ready",
];

function filterLabel(
  k: LeadFilterKey,
  t: ReturnType<typeof useI18n>["t"],
  locale: "en" | "fr"
): string {
  switch (k) {
    case "all":
      return locale === "fr" ? "Tous" : "All";
    case "without_website":
      return t.table.withoutWebsite;
    case "with_website":
      return t.table.withWebsite;
    case "with_phone":
      return t.table.withPhone;
    case "missing_contact":
      return t.table.missingContact;
    case "has_address":
      return t.table.hasAddress;
    case "high_score":
      return t.table.highScore;
    case "needs_online_presence":
      return t.table.needsOnlinePresence;
    case "outreach_ready":
      return t.table.outreachReady;
  }
}

function Section({
  step,
  title,
  children,
  hint,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-5 border-b border-border px-6 py-6 md:grid-cols-[160px_1fr] md:gap-8 md:px-8">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-accent-cyan">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-[10px] font-semibold">
            {String(step).padStart(2, "0")}
          </span>
          {title}
        </div>
        {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SearchForm({
  initial,
  onResults,
  onStart,
  onError,
}: {
  initial?: Partial<SearchFormState>;
  onResults: (response: SearchResponse) => void;
  onStart?: (state: SearchFormState) => void;
  onError?: (msg: string) => void;
}) {
  const { t, locale } = useI18n();
  const [state, setState] = React.useState<SearchFormState>(() => ({
    ...defaultState(),
    ...initial,
  }));

  const [sources, setSources] = React.useState<SourceMetadata[]>([]);
  const [sourcesLoaded, setSourcesLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const s = getSettings();
    setState((prev) => ({
      ...prev,
      country: prev.country || s.defaultCountry,
      language: prev.language || s.defaultLanguage,
      sources: prev.sources.length > 0 ? prev.sources : s.defaultSources,
      limit: prev.limit || s.defaultLimit,
    }));

    void fetch("/api/sources", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { sources: SourceMetadata[] }) => {
        const all = data.sources ?? [];
        setSources(all);
        setSourcesLoaded(true);
        // Prefer Google Places when it's available.
        const places = all.find(
          (src) => src.id === "google_maps" && src.enabled
        );
        if (places) {
          setState((prev) =>
            prev.sources.includes("google_maps")
              ? prev
              : {
                  ...prev,
                  sources: ["google_maps", ...prev.sources.filter((s) => s !== "mock")],
                }
          );
        }
      })
      .catch(() => setSourcesLoaded(true));
  }, []);

  // Hide the internal mock source from the UI unless no real source is enabled.
  const anyRealEnabled = sources.some(
    (src) => src.id !== "mock" && src.enabled
  );
  const visibleSources = sources.filter(
    (src) => src.id !== "mock" || !anyRealEnabled
  );

  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function patch<K extends keyof SearchFormState>(
    key: K,
    value: SearchFormState[K]
  ) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleFilter(key: LeadFilterKey) {
    if (key === "all") {
      patch("filters", []);
      return;
    }
    setState((s) => ({
      ...s,
      filters: s.filters.includes(key)
        ? s.filters.filter((k) => k !== key)
        : [...s.filters, key],
    }));
  }

  function toggleSource(id: string, selectable: boolean) {
    if (!selectable) return;
    setState((s) => ({
      ...s,
      sources: s.sources.includes(id)
        ? s.sources.filter((x) => x !== id)
        : [...s.sources, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.businessType.trim() || !state.location.trim()) {
      onError?.(
        locale === "fr"
          ? "Indiquez un type d’entreprise et une localisation."
          : "Enter a business type and a location to continue."
      );
      return;
    }
    setLoading(true);
    onStart?.(state);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessType: state.businessType.trim(),
          location: state.location.trim(),
          country: state.country.trim() || undefined,
          language: state.language.trim() || undefined,
          objective: state.objective,
          filters: state.filters,
          sources: state.sources,
          limit: state.limit,
          advanced: {
            minScore: state.minScore ?? undefined,
            requirePhone: state.requirePhone || undefined,
            requireWebsite: state.requireWebsite || undefined,
            includeOnlyContactable: state.includeOnlyContactable || undefined,
          },
        }),
      });
      if (!res.ok) {
        onError?.(`Search failed (${res.status}).`);
        return;
      }
      const data = (await res.json()) as SearchResponse;
      saveSearch(data.meta.query);
      bumpUsage({ searchesRun: 1, leadsFound: data.leads.length });
      onResults(data);
    } catch {
      onError?.(
        locale === "fr"
          ? "Erreur côté serveur. Réessayez."
          : "Something went wrong talking to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-accent/[0.08] to-transparent px-6 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent-cyan" />
          <span className="text-sm font-semibold text-foreground">
            {locale === "fr" ? "Assistant de recherche" : "Search builder"}
          </span>
        </div>
        <span className="hidden text-xs text-muted sm:inline">
          {locale === "fr"
            ? "5 étapes · quelques secondes"
            : "5 steps · seconds to finish"}
        </span>
      </div>

      <Section
        step={1}
        title={
          locale === "fr" ? "Ce que vous cherchez" : "What you’re looking for"
        }
        hint={
          locale === "fr"
            ? "Restaurants, dentistes, agences…"
            : "Restaurants, dentists, agencies…"
        }
      >
        <div>
          <Label htmlFor="bt">{t.searchForm.businessType}</Label>
          <div className="relative">
            <Target
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              id="bt"
              value={state.businessType}
              onChange={(e) => patch("businessType", e.target.value)}
              placeholder={t.searchForm.businessType}
              className="pl-9"
            />
          </div>
        </div>
      </Section>

      <Section
        step={2}
        title={locale === "fr" ? "Où chercher" : "Where"}
        hint={
          locale === "fr" ? "Ville, région, ou pays" : "City, region, or country"
        }
      >
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_100px]">
          <div>
            <Label htmlFor="loc">{t.searchForm.location}</Label>
            <div className="relative">
              <MapPin
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                id="loc"
                value={state.location}
                onChange={(e) => patch("location", e.target.value)}
                placeholder="Paris, Tel Aviv, New York…"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">
              <span className="inline-flex items-center gap-1.5">
                <Globe size={12} /> {t.searchForm.country}
              </span>
            </Label>
            <Select
              id="country"
              value={state.country}
              onChange={(e) => patch("country", e.target.value)}
            >
              <option value="">
                {locale === "fr" ? "Tous les pays" : "Any country"}
              </option>
              {sortedCountries(locale).map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === "fr" ? c.fr : c.en}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="limit">{t.searchForm.resultLimit}</Label>
            <Input
              id="limit"
              type="number"
              min={10}
              max={120}
              value={state.limit}
              onChange={(e) =>
                patch(
                  "limit",
                  Math.max(1, Math.min(120, Number(e.target.value) || 40))
                )
              }
            />
          </div>
        </div>
      </Section>

      <Section
        step={3}
        title={t.searchForm.sources}
        hint={
          locale === "fr"
            ? "Cliquez pour activer. Statut live à droite."
            : "Click to toggle. Live status on the right."
        }
      >
        <div className="space-y-2">
          {visibleSources.map((s) => {
            const active = state.sources.includes(s.id);
            const selectable = s.enabled;
            const copy = sourceStatusLabel(s.status, locale);
            const loc = localizedSource(s.id, locale);
            const displayName = loc?.name ?? s.name;
            const displayDescription = loc?.description ?? s.description;
            const displayBadge = loc?.badge ?? s.badge;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSource(s.id, selectable)}
                aria-pressed={active}
                disabled={!selectable}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-white/[0.02] hover:border-border-strong hover:bg-white/5",
                  !selectable && "cursor-not-allowed opacity-70"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border",
                    active
                      ? "border-accent/50 bg-accent text-white"
                      : "border-border-strong bg-white/5 text-muted"
                  )}
                >
                  {active ? <Check size={12} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {displayName}
                    {displayBadge ? (
                      <Badge tone={s.id === "google_maps" ? "accent" : "outline"}>
                        {displayBadge}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-strong">
                    {displayDescription}
                  </span>
                </span>
                <Badge tone={copy.tone}>{copy.label}</Badge>
              </button>
            );
          })}
          {!sourcesLoaded ? (
            <p className="text-xs text-muted">Loading sources…</p>
          ) : null}
          {sourcesLoaded &&
          sources.find(
            (s) => s.id === "google_maps" && s.status !== "available"
          ) ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              <AlertTriangle size={12} className="mt-0.5 flex-none" />
              {
                sourceStatusLabel(
                  sources.find((s) => s.id === "google_maps")?.status ??
                    "missing_key",
                  locale
                ).label
              }
            </div>
          ) : null}
        </div>
      </Section>

      <Section
        step={4}
        title={t.searchForm.objective}
        hint={
          locale === "fr"
            ? "Adapte le scoring à votre objectif."
            : "Tunes the scoring to your objective."
        }
      >
        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <div>
            <Label htmlFor="obj">{t.searchForm.objective}</Label>
            <Select
              id="obj"
              value={state.objective}
              onChange={(e) =>
                patch("objective", e.target.value as LeadObjective)
              }
            >
              {objectiveEntries(locale).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="lang">{t.searchForm.language}</Label>
            <Input
              id="lang"
              value={state.language}
              onChange={(e) => patch("language", e.target.value)}
              placeholder="en"
            />
          </div>
        </div>
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {t.searchForm.filters}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FILTER_ORDER.map((k) => {
              const active =
                k === "all"
                  ? state.filters.length === 0
                  : state.filters.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleFilter(k)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-white/[0.02] text-muted-strong hover:bg-white/5"
                  )}
                >
                  {filterLabel(k, t, locale)}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <div className="border-b border-border">
        <button
          type="button"
          onClick={() => setAdvancedOpen((s) => !s)}
          className="flex w-full items-center justify-between px-6 py-4 text-left text-sm text-muted-strong hover:text-foreground md:px-8"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-accent-cyan" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-cyan">
              05
            </span>
            {t.searchForm.advanced}
          </span>
          <span className="text-xs text-muted">
            {advancedOpen ? t.searchForm.hide : t.searchForm.show}
          </span>
        </button>
        {advancedOpen ? (
          <div className="grid gap-4 px-6 pb-6 md:grid-cols-2 md:px-8 lg:grid-cols-4">
            <div>
              <Label htmlFor="minscore">{t.searchForm.minScore}</Label>
              <Input
                id="minscore"
                type="number"
                min={0}
                max={100}
                placeholder="75"
                value={state.minScore ?? ""}
                onChange={(e) =>
                  patch(
                    "minScore",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm">
              <Checkbox
                checked={state.requirePhone}
                onChange={(e) => patch("requirePhone", e.target.checked)}
              />
              {t.searchForm.requirePhone}
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm">
              <Checkbox
                checked={state.requireWebsite}
                onChange={(e) => patch("requireWebsite", e.target.checked)}
              />
              {t.searchForm.requireWebsite}
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm">
              <Checkbox
                checked={state.includeOnlyContactable}
                onChange={(e) =>
                  patch("includeOnlyContactable", e.target.checked)
                }
              />
              {t.searchForm.onlyContactable}
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm md:col-span-2 lg:col-span-4">
              <Checkbox
                checked={state.excludeSeen}
                onChange={(e) => patch("excludeSeen", e.target.checked)}
              />
              {locale === "fr"
                ? "Exclure les leads déjà vus"
                : "Exclude previously seen leads"}
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 md:px-8">
        <div className="max-w-xl text-xs text-muted">{t.searchForm.tip}</div>
        <Button
          type="submit"
          size="lg"
          leftIcon={<Search size={16} />}
          disabled={loading}
        >
          {loading ? t.searchForm.searching : t.searchForm.searchLeads}
        </Button>
      </div>
    </form>
  );
}
