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
import { useI18n } from "@/lib/i18n";
import type { Lead, LeadObjective, SearchResponse } from "@/lib/leadTypes";
import { OBJECTIVE_LABELS } from "@/lib/leadTypes";
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
  const { t } = useI18n();
  const [response, setResponse] = React.useState<SearchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    setResponse(resp);
    setLoading(false);
    setError(null);
    saveLeads(resp.leads as Lead[]);
  }

  return (
    <div className="space-y-6">
      <SearchForm
        initial={initial}
        onStart={() => {
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
          {response.meta.warnings && response.meta.warnings.length > 0 ? (
            <div className="rounded-lg border border-border bg-surface px-4 py-2 text-[11px] text-muted">
              {response.meta.warnings.map((w) => (
                <div key={w.source}>
                  <span className="font-mono text-muted-strong">{w.source}</span>
                  : {w.message}
                </div>
              ))}
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
                    {s}
                  </Badge>
                ))}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-muted">
              <Badge tone="accent">
                {response.meta.query.businessType}
              </Badge>
              <Badge tone="muted">{response.meta.query.location}</Badge>
              <Badge tone="outline">
                {OBJECTIVE_LABELS[response.meta.query.objective ?? "general"]}
              </Badge>
              {response.meta.query.filters.map((f) => (
                <Badge key={f} tone="muted">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
          <LeadTable
            leads={response.leads}
            defaultFilename="findely-search.csv"
          />
        </div>
      ) : null}

      {!loading && !response ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <h3 className="text-base font-semibold text-foreground">
            Ready when you are.
          </h3>
          <p className="mt-1 text-sm text-muted-strong">
            Try{" "}
            <span className="text-foreground">“restaurants in Tel Aviv”</span>{" "}
            or <span className="text-foreground">“dentists in Paris”</span>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
