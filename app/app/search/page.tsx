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

export default function SearchPage() {
  return (
    <React.Suspense fallback={null}>
      <SearchPageInner />
    </React.Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const { t, locale } = useI18n();
  const [response, setResponse] = React.useState<SearchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
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
    setExcludeSeen(wantExclude);

    const annotated = annotateSeen(resp.leads);
    const visible = wantExclude
      ? annotated.filter((l) => !l.seenBefore)
      : annotated;
    setHiddenSeen(annotated.length - visible.length);

    const finalResp: SearchResponse = {
      ...resp,
      leads: (wantExclude ? visible : annotated) as Lead[],
      meta: {
        ...resp.meta,
        total: (wantExclude ? visible : annotated).length,
      },
    };
    setResponse(finalResp);
    setLoading(false);
    setError(null);
    saveLeads(visible as Lead[]);
    markSeen(resp.leads);
    setShowSeen(!wantExclude);
  }

  return (
    <div className="space-y-6">
      <SearchForm
        initial={initial}
        onStart={(state) => {
          currentStateRef.current = state;
          setLoading(true);
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

      <LoadingSteps running={loading} />

      {!loading && response ? (
        <div className="space-y-3">
          {response.meta.fallbackUsed ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
              <Info size={14} className="mt-0.5 flex-none" />
              <span className="leading-relaxed">{t.common.fallbackUsed}</span>
            </div>
          ) : null}

          {hiddenSeen > 0 && excludeSeen ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs text-muted">
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-muted">
              <span className="text-foreground">
                {response.meta.total} {t.table.leadsFound}
              </span>
              <span>·</span>
              <span>{response.meta.durationMs} ms</span>
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
          <LeadTable
            leads={response.leads as Lead[]}
            defaultFilename="findely-search.csv"
          />
        </div>
      ) : null}

      {!loading && !response ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <h3 className="text-base font-semibold text-foreground">
            {locale === "fr" ? "Prêt quand vous l’êtes." : "Ready when you are."}
          </h3>
          <p className="mt-1 text-sm text-muted-strong">
            {locale === "fr" ? "Essayez " : "Try "}
            <span className="text-foreground">
              {locale === "fr"
                ? "« restaurants à Tel Aviv »"
                : "“restaurants in Tel Aviv”"}
            </span>
            {locale === "fr" ? " ou " : " or "}
            <span className="text-foreground">
              {locale === "fr"
                ? "« dentistes à Paris »"
                : "“dentists in Paris”"}
            </span>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
