"use client";

import { ArrowRight, Check, DatabaseZap, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  importLocalData,
  type ImportLeadPayload,
  type ImportListPayload,
} from "@/lib/actions/migration";
import { useI18n } from "@/lib/i18n";
import type { Lead, LeadList } from "@/lib/leadTypes";

const LS_DISMISSED = "findely:migrationDismissed";
const LS_LISTS = "findely:lists";
const LS_SAVED_LEADS = "findely:savedLeads";
const LS_SEARCHES = "findely:searches";

function subscribeStorage(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readLocalCount(key: string): number {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function readLocalJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toPayloadLead(l: Lead): ImportLeadPayload {
  return {
    id: l.id,
    name: l.name,
    category: l.category ?? null,
    phone: l.phone ?? null,
    website: l.website ?? null,
    address: l.address ?? null,
    source: l.source,
    score: l.score,
    priorityLabel: l.priorityLabel ?? null,
    opportunityType: l.opportunityType ?? null,
    opportunityReason: l.opportunityReason ?? null,
    recommendedAction: l.recommendedAction ?? null,
    dataQualityLabel: l.dataQualityLabel ?? null,
    contactReadinessLabel: l.contactReadinessLabel ?? null,
    rating: l.rating ?? null,
    ratingCount: l.ratingCount ?? null,
    mapsUrl: l.mapsUrl ?? null,
    signals: l.signals ?? [],
  };
}

interface MigrationBannerProps {
  /** Only show the banner for authenticated users. */
  authed: boolean;
}

/**
 * Dismissable prompt that offers to import a signed-in user's existing
 * localStorage lists + saved leads into their Findely account.
 */
export function MigrationBanner({ authed }: MigrationBannerProps) {
  const { t } = useI18n();
  const m = t.migration;

  const dismissed = React.useSyncExternalStore(
    subscribeStorage,
    () => {
      try {
        return window.localStorage.getItem(LS_DISMISSED) === "true";
      } catch {
        return false;
      }
    },
    () => false
  );

  const listCount = React.useSyncExternalStore(
    subscribeStorage,
    () => readLocalCount(LS_LISTS),
    () => 0
  );
  const searchCount = React.useSyncExternalStore(
    subscribeStorage,
    () => readLocalCount(LS_SEARCHES),
    () => 0
  );

  const [manuallyDismissed, setManuallyDismissed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  if (!authed || !m) return null;
  if (dismissed || manuallyDismissed) return null;
  if (listCount === 0 && searchCount === 0) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(LS_DISMISSED, "true");
    } catch {
      // Ignore quota errors.
    }
    setManuallyDismissed(true);
  }

  async function handleImport() {
    setError(null);
    setBusy(true);
    try {
      const lists = readLocalJson<LeadList[]>(LS_LISTS) ?? [];
      const leads = readLocalJson<Lead[]>(LS_SAVED_LEADS) ?? [];
      const leadById = new Map(leads.map((l) => [l.id, l]));

      const payload: ImportListPayload[] = lists
        .filter((l) => l?.name)
        .map((l) => ({
          name: l.name,
          description: l.description ?? null,
          leads: (l.leadIds ?? [])
            .map((id) => leadById.get(id))
            .filter((x): x is Lead => Boolean(x))
            .map(toPayloadLead),
        }));

      if (payload.length === 0) {
        setError("Nothing to import.");
        setBusy(false);
        return;
      }

      const res = await importLocalData({ lists: payload });
      if (!res.ok) {
        setError(res.error);
        setBusy(false);
        return;
      }

      const { createdLists, upsertedLeads } = res.value;
      setSuccess(
        `${m?.imported ?? "Imported"} · ${createdLists} · ${upsertedLeads}`
      );
      try {
        window.localStorage.setItem(LS_DISMISSED, "true");
      } catch {
        // Ignore.
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
        <Check size={14} />
        <span className="flex-1">{success}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={dismiss}
          leftIcon={<X size={12} />}
        >
          {m.dismissCta}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/[0.08] via-surface to-surface p-4 text-sm">
      <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent/15 text-accent-cyan">
        <DatabaseZap size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">{m.title}</div>
        <div className="mt-0.5 text-xs text-muted-strong">
          {m.body} ({listCount} · {searchCount})
        </div>
        {error ? (
          <div className="mt-1 text-xs text-danger">{error}</div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={dismiss}
          leftIcon={<X size={12} />}
          disabled={busy}
        >
          {m.dismissCta}
        </Button>
        <Button
          size="sm"
          onClick={handleImport}
          rightIcon={<ArrowRight size={12} />}
          disabled={busy}
        >
          {busy ? m.importing : m.importCta}
        </Button>
      </div>
    </div>
  );
}
