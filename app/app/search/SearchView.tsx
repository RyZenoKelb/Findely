"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { LeadTable } from "@/components/leads/LeadTable";
import { LoadingSteps } from "@/components/search/LoadingSteps";
import {
  SearchForm,
  type SearchFormState,
} from "@/components/search/SearchForm";
import { countryLabel } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";
import type { Lead, LeadObjective, SearchResponse } from "@/lib/leadTypes";
import { objectiveLabel } from "@/lib/localizedLabels";
import { annotateSeen, markSeen } from "@/lib/seenLeads";
import { saveLeads } from "@/lib/storage";

export default function SearchView({
  authed = false,
}: {
  authed?: boolean;
} = {}) {
  return (
    <React.Suspense fallback={null}>
      <SearchPageInner authed={authed} />
    </React.Suspense>
  );
}

function SearchPageInner({ authed }: { authed: boolean }) {
  const params = useSearchParams();
  const { t, locale } = useI18n();
  const [response, setResponse] = React.useState<SearchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [largeSearch, setLargeSearch] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hiddenSeen, setHiddenSeen] = React.useState(0);
  const [showSeen, setShowSeen] = React.useState(false);
  const [excludeSeen, setExcludeSeen] = React.useState(true);
  const currentStateRef = React.useRef<SearchFormState | null>(null);

  const initial: Partial<SearchFormState> = React.useMemo(() => {
    const out: Partial<SearchFormState> = {};
    const q = params.get("q");
    const where = params.get("where");
    const obj = params.get("obj") as LeadObjective | null;
    const country = params.get("country");
    if (q) out.businessType = q;
    if (where) out.location = where;
    if (obj) out.objective = obj;
    if (country) out.country = country;
    return out;
  }, [params]);

  function handleResults(resp: SearchResponse) {
    const state = currentStateRef.current;
    const wantExclude = state?.excludeSeen ?? true;
    const userLimit = state?.limit ?? 40;
    setExcludeSeen(wantExclude);

    const annotated = annotateSeen(resp.leads);
    const visible = wantExclude
      ? annotated.filter((l) => !l.seenBefore)
      : annotated;

    // Trim to the user's requested limit (backend over-fetches to compensate)
    const trimmed = visible.slice(0, userLimit);
    setHiddenSeen(0);

    const finalResp: SearchResponse = {
      ...resp,
      leads: trimmed as Lead[],
      meta: {
        ...resp.meta,
        total: trimmed.length,
        requestedLimit: userLimit,
        returnedCount: trimmed.length,
      },
    };
    setResponse(finalResp);
    setLoading(false);
    setError(null);
    saveLeads(trimmed as Lead[]);
    markSeen(trimmed as Lead[]);
    setShowSeen(!wantExclude);
  }

  return (
    <div className="space-y-6">
      <SearchForm
        initial={initial}
        onStart={(state) => {
          currentStateRef.current = state;
          setLoading(true);
          setLargeSearch(state.limit > 60);
          setError(null);
        }}
        onResults={handleResults}
        onError={(msg) => {
          setLoading(false);
          setError(msg);
        }}
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          <AlertTriangle size={14} /> {error}
        </div>
      ) : null}

      <LoadingSteps running={loading} large={largeSearch} locale={locale} />

      {!loading && response ? (
        <div className="space-y-3">
          {response.meta.fallbackUsed ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
              <Info size={14} className="mt-0.5 flex-none" />
              <div className="leading-relaxed">
                <p>{t.common.fallbackUsed}</p>
                {response.meta.warnings && response.meta.warnings.length > 0 ? (
                  <ul className="mt-1 list-disc pl-4 text-warning/80">
                    {response.meta.warnings.map((w, i) => (
                      <li key={i}>{w.source}: {w.message}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}

          {hiddenSeen > 0 && excludeSeen ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-muted">
              <span>
                {locale === "fr"
                  ? `${hiddenSeen} lead${hiddenSeen > 1 ? "s" : ""} déjà vu${hiddenSeen > 1 ? "s" : ""} masqué${hiddenSeen > 1 ? "s" : ""}.`
                  : `${hiddenSeen} previously seen lead${hiddenSeen > 1 ? "s" : ""} hidden.`}
              </span>
              <button
                type="button"
                className="text-accent-cyan hover:text-accent-strong"
                onClick={() => setShowSeen((s) => !s)}
              >
                {showSeen
                  ? locale === "fr"
                    ? "Masquer à nouveau"
                    : "Hide again"
                  : locale === "fr"
                    ? "Afficher les leads déjà vus"
                    : "Show previously seen leads"}
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-muted">
              {response.meta.requestedLimit != null &&
              response.meta.requestedLimit > response.meta.total ? (
                <span className="text-foreground">
                  {locale === "fr"
                    ? `${response.meta.requestedLimit} demandés · ${response.meta.total} trouvés`
                    : `${response.meta.requestedLimit} requested · ${response.meta.total} found`}
                </span>
              ) : (
                <span className="text-foreground">
                  {response.meta.total} {t.table.leadsFound}
                </span>
              )}
              <span>·</span>
              {response.meta.batchesRun != null && response.meta.batchesRun > 1 ? (
                <>
                  <span>
                    {locale === "fr"
                      ? `${response.meta.batchesRun} lots`
                      : `${response.meta.batchesRun} batches`}
                  </span>
                  <span>·</span>
                </>
              ) : null}
              <span>{(response.meta.durationMs / 1000).toFixed(1)} s</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {response.meta.sourcesUsed.map((s) => (
                  <Badge key={s} tone="outline">
                    {s === "google_maps" ? "Google Places" : s}
                  </Badge>
                ))}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-muted">
              <Badge tone="accent">{response.meta.query.businessType}</Badge>
              <Badge tone="muted">{response.meta.query.location}</Badge>
              {response.meta.query.country ? (
                <Badge tone="muted">
                  {countryLabel(response.meta.query.country, locale)}
                </Badge>
              ) : null}
              <Badge tone="outline">
                {objectiveLabel(
                  response.meta.query.objective ?? "general",
                  locale
                )}
              </Badge>
            </div>
          </div>

          {response.leads.length > 0 ? (
            <TopOpportunities leads={response.leads as Lead[]} />
          ) : null}

          <LeadTable
            leads={response.leads as Lead[]}
            defaultFilename="findely-search.csv"
            authed={authed}
          />
        </div>
      ) : null}

      {!loading && !response ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)",
            }}
          />
          <div className="relative grid gap-6 md:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                {locale === "fr" ? "Prêt à lancer" : "Ready to launch"}
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                {locale === "fr"
                  ? "Construisez votre prochaine liste en quelques secondes."
                  : "Build your next outreach list in seconds."}
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-strong">
                {locale === "fr"
                  ? "Choisissez une niche et une ville ci-dessus, puis lancez une recherche. Vos leads sont scorés, qualifiés et prêts à exporter."
                  : "Pick a niche and a city above, then run a search. Your leads come scored, qualified, and ready to export."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1">
                  {locale === "fr"
                    ? "Essayez « restaurants à Paris »"
                    : "Try “restaurants in Paris”"}
                </span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1">
                  {locale === "fr"
                    ? "Ou « agences web à New York »"
                    : "Or “web agencies in New York”"}
                </span>
              </div>
            </div>
            <ul className="grid gap-2 self-center">
              {[
                locale === "fr"
                  ? "Priorité calculée par lead"
                  : "Priority computed per lead",
                locale === "fr"
                  ? "Raison d’opportunité claire"
                  : "Clear opportunity reason",
                locale === "fr"
                  ? "Action recommandée pour chacun"
                  : "A recommended next action",
                locale === "fr"
                  ? "Export CSV prêt pour le CRM"
                  : "CRM-ready CSV export",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-foreground"
                >
                  <span className="mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-accent/15 text-accent-cyan">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TopOpportunities({ leads }: { leads: Lead[] }) {
  const { locale } = useI18n();
  const top = [...leads]
    .filter((l) => l.priorityLevel === "high")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (top.length === 0) return null;
  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/[0.08] to-transparent px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-cyan">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-cyan" />
        {locale === "fr" ? "Top opportunités" : "Top opportunities"}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((l) => (
          <div
            key={l.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {l.name}
              </span>
              <span className="font-mono text-xs text-success">{l.score}</span>
            </div>
            <div className="mt-0.5 truncate text-xs text-muted">
              {l.opportunityLabel ?? l.category ?? "Business"}
            </div>
            {l.recommendedAction ? (
              <div className="mt-1.5 text-[11px] leading-relaxed text-muted-strong">
                {l.recommendedAction}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
