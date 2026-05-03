"use client";

import { Clock, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SearchQuery } from "@/lib/leadTypes";
import { objectiveLabel } from "@/lib/localizedLabels";
import { useI18n } from "@/lib/i18n";
import {
  STORAGE_KEYS,
  deleteSearch,
  getEmptySnapshot,
  getRawSnapshot,
  subscribeToLocalStorage,
} from "@/lib/storage";
import { formatRelative } from "@/lib/utils";

export default function SearchesPage() {
  const { t, locale } = useI18n();

  const rawSearches = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.searches),
    getEmptySnapshot
  );
  const searches = React.useMemo<SearchQuery[]>(() => {
    if (!rawSearches) return [];
    try {
      return JSON.parse(rawSearches) as SearchQuery[];
    } catch {
      return [];
    }
  }, [rawSearches]);

  function handleDelete(id: string) {
    deleteSearch(id);
  }

  function rerunHref(s: SearchQuery): string {
    const p = new URLSearchParams();
    p.set("q", s.businessType);
    p.set("where", s.location);
    if (s.objective) p.set("obj", s.objective);
    if (s.country) p.set("country", s.country);
    return `/app/search?${p.toString()}`;
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <h3 className="text-base font-semibold text-foreground">
          {locale === "fr"
            ? "Aucune recherche enregistrée."
            : "No saved searches yet."}
        </h3>
        <p className="mt-1 text-sm text-muted-strong">
          {locale === "fr" ? "Chaque recherche lancée depuis " : "Every search you run from "}
          <Link href="/app/search" className="text-accent-strong">
            /app/search
          </Link>{" "}
          {locale === "fr"
            ? "est enregistrée ici automatiquement."
            : "is saved here automatically."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-muted" />
          <h3 className="text-sm font-semibold text-foreground">
            {t.sidebar.savedSearches}
          </h3>
          <Badge tone="muted">{searches.length}</Badge>
        </div>
        <div className="text-xs text-muted">
          {locale === "fr"
            ? "Cliquez Relancer pour rejouer une requête."
            : "Click Re-run to retry a query."}
        </div>
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {searches.map((s) => (
          <li key={s.id} className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {s.businessType} {locale === "fr" ? "à" : "in"} {s.location}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                  <Badge tone="outline">
                    {objectiveLabel(s.objective ?? "general", locale)}
                  </Badge>
                  {s.country ? <Badge tone="muted">{s.country}</Badge> : null}
                  {s.filters.map((f) => (
                    <Badge key={f} tone="muted">
                      {f}
                    </Badge>
                  ))}
                  <span>·</span>
                  <span>{s.sources.join(", ")}</span>
                  <span>·</span>
                  <span>
                    {locale === "fr" ? "limite" : "limit"} {s.limit}
                  </span>
                  <span>·</span>
                  <span>{formatRelative(s.createdAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={rerunHref(s)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-accent px-3 text-xs font-medium text-white hover:bg-accent-strong"
                >
                  <RefreshCw size={12} />{" "}
                  {locale === "fr" ? "Relancer" : "Re-run"}
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 size={12} />}
                  onClick={() => handleDelete(s.id)}
                >
                  {locale === "fr" ? "Supprimer" : "Delete"}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
