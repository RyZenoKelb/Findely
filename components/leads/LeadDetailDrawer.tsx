"use client";

import {
  Building2,
  Check,
  Copy,
  ExternalLink,
  Flag,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Label, Textarea } from "@/components/ui/Field";
import { LeadScore } from "./LeadScore";
import { SignalBadge } from "./SignalBadge";
import { useI18n } from "@/lib/i18n";
import type { Lead, LeadList, LeadStatus } from "@/lib/leadTypes";
import { displayListName } from "@/lib/listNames";
import {
  getContactReadiness,
  getDataQuality,
  getPriorityLabel,
  getRecommendedAction,
  opportunityTypeLabel,
  type OpportunityType,
} from "@/lib/leadOpportunity";
import { outreachAngleFor, statusLabel } from "@/lib/localizedLabels";
import {
  STORAGE_KEYS,
  addLeadToList,
  createList,
  getEmptySnapshot,
  getRawSnapshot,
  saveLead,
  subscribeToLocalStorage,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

const STATUS_ORDER: {
  value: LeadStatus;
  tone: "muted" | "accent" | "success" | "warning" | "danger";
}[] = [
  { value: "new", tone: "muted" },
  { value: "saved", tone: "accent" },
  { value: "contacted", tone: "accent" },
  { value: "interested", tone: "success" },
  { value: "ignored", tone: "danger" },
];

export function LeadDetailDrawer({
  lead,
  onClose,
  onUpdated,
  authed = false,
}: {
  lead: Lead | null;
  onClose: () => void;
  onUpdated?: (lead: Lead) => void;
  /** Authenticated users also persist to Supabase via server actions. */
  authed?: boolean;
}) {
  const { t, locale } = useI18n();
  const [notes, setNotes] = React.useState<string>(lead?.notes ?? "");
  const [status, setStatus] = React.useState<LeadStatus>(lead?.status ?? "new");
  const [prevLeadId, setPrevLeadId] = React.useState<string | null>(
    lead?.id ?? null
  );
  const [copied, setCopied] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  // Reset notes/status when a different lead becomes active — derived state
  // reset pattern, avoids setState-in-effect cascading render.
  if (lead && lead.id !== prevLeadId) {
    setPrevLeadId(lead.id);
    setNotes(lead.notes ?? "");
    setStatus(lead.status ?? "new");
  }

  const rawLists = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.lists),
    getEmptySnapshot
  );
  const lists = React.useMemo<LeadList[]>(() => {
    if (!rawLists) return [];
    try {
      return JSON.parse(rawLists) as LeadList[];
    } catch {
      return [];
    }
  }, [rawLists]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!lead) return null;

  function persist(next: Lead) {
    saveLead(next);
    onUpdated?.(next);
  }

  function copy(value: string | null | undefined, label: string) {
    if (!value) return;
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  function handleSaveNotes() {
    if (!lead) return;
    const next: Lead = { ...lead, notes: notes.trim() || undefined };
    persist(next);
    setToast(t.drawer.saveNotes);
  }

  function handleStatus(next: LeadStatus) {
    if (!lead) return;
    setStatus(next);
    persist({ ...lead, status: next });
  }

  async function handleAddToList(listId: string) {
    if (!lead) return;
    addLeadToList(listId, lead.id);
    persist({ ...lead, status: lead.status ?? "saved" });
    setToast(locale === "fr" ? "Ajouté à la liste" : "Added to list");
    if (authed) {
      const { saveLeadToList } = await import("@/lib/actions/leads");
      void saveLeadToList(lead, listId, { status: lead.status ?? "saved" });
    }
  }

  async function handleCreateList() {
    if (!lead) return;
    const name = window.prompt("New list name");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const created = createList(trimmed);
    addLeadToList(created.id, lead.id);
    persist({ ...lead, status: lead.status ?? "saved" });
    setToast(locale === "fr" ? "Liste créée" : "List created");
    if (authed) {
      const { createLeadList } = await import("@/lib/actions/lists");
      const { saveLeadToList } = await import("@/lib/actions/leads");
      const res = await createLeadList(trimmed);
      if (res.ok) {
        void saveLeadToList(lead, res.value.id, {
          status: lead.status ?? "saved",
        });
      }
    }
  }

  const angle = outreachAngleFor(lead, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`Lead details: ${lead.name}`}
    >
      <button
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-border bg-surface">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <Building2 size={12} /> {lead.category ?? "Business"} ·{" "}
              <Badge tone="outline">{lead.source}</Badge>
              {lead.source === "mock" ? <DemoBadge variant="demo" /> : null}
            </div>
            <h2 className="mt-1 truncate text-xl font-semibold text-foreground">
              {lead.name}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <LeadScore score={lead.score} />
              <Badge
                tone={
                  STATUS_ORDER.find((s) => s.value === status)?.tone ?? "muted"
                }
              >
                {statusLabel(status, locale)}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-strong hover:bg-surface-2"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <section className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            <Row
              icon={<Phone size={14} />}
              label="Phone"
              value={lead.phone}
              onCopy={() => copy(lead.phone, "phone")}
              copied={copied === "phone"}
            />
            <Row
              icon={<ExternalLink size={14} />}
              label="Website"
              value={lead.website}
              href={lead.website ?? undefined}
              onCopy={() => copy(lead.website, "website")}
              copied={copied === "website"}
            />
            <Row
              icon={<MapPin size={14} />}
              label="Address"
              value={lead.address}
              onCopy={() => copy(lead.address, "address")}
              copied={copied === "address"}
            />
            <Row
              icon={<Tag size={14} />}
              label="Category"
              value={lead.category}
            />
          </section>

          {lead.description ? (
            <section className="border-t border-border px-5 py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                About
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">
                {lead.description}
              </p>
            </section>
          ) : null}

          <section className="border-t border-border px-5 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Signals
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lead.signals.length === 0 ? (
                <span className="text-xs text-muted">No signals detected.</span>
              ) : (
                lead.signals.map((s) => <SignalBadge key={s} signal={s} />)
              )}
            </div>
          </section>

          {lead.opportunityType || lead.priorityLevel ? (
            <section className="border-t border-border px-5 py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Intelligence
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {lead.priorityLevel ? (
                  <div className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      {locale === "fr" ? "Priorité" : "Priority"}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-sm font-medium",
                        lead.priorityLevel === "high"
                          ? "text-success"
                          : lead.priorityLevel === "medium"
                            ? "text-accent-cyan"
                            : "text-muted-strong"
                      )}
                    >
                      {getPriorityLabel(lead, locale).label}
                    </div>
                  </div>
                ) : null}
                {lead.opportunityType ? (
                  <div className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      {locale === "fr" ? "Opportunité" : "Opportunity"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {opportunityTypeLabel(
                        lead.opportunityType as OpportunityType,
                        locale
                      )}
                    </div>
                  </div>
                ) : null}
                {lead.dataQualityLevel ? (
                  <div className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      {locale === "fr" ? "Qualité des données" : "Data quality"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {getDataQuality(lead, locale).label}
                    </div>
                  </div>
                ) : null}
                {lead.contactReadinessLevel ? (
                  <div className="rounded-lg border border-border bg-surface-2 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted">
                      {locale === "fr"
                        ? "Prêt à contacter"
                        : "Contact readiness"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {getContactReadiness(lead, locale).label}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-3 rounded-lg border border-accent/30 bg-accent/[0.08] p-3">
                <div className="text-[11px] uppercase tracking-wide text-accent-cyan">
                  {locale === "fr"
                    ? "Action recommandée"
                    : "Recommended action"}
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {getRecommendedAction(lead, "general", locale)}
                </div>
              </div>

              {lead.scoreBreakdown && lead.scoreBreakdown.length > 0 ? (
                <details className="group mt-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-muted-strong transition-colors hover:text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-[10px] text-accent-cyan">
                        {lead.score}
                      </span>
                      {locale === "fr"
                        ? "Pourquoi ce score ?"
                        : "Why this score?"}
                    </span>
                    <span className="text-muted transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <ul className="mt-2 divide-y divide-border/70">
                    {lead.scoreBreakdown.map((f, i) => (
                      <li
                        key={`${f.label}-${i}`}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-muted-strong">{f.label}</span>
                        <span
                          className={cn(
                            "font-mono tabular-nums",
                            f.value > 0
                              ? "text-success"
                              : f.value < 0
                                ? "text-danger"
                                : "text-muted"
                          )}
                        >
                          {f.value > 0 ? `+${f.value}` : f.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          ) : null}

          <section className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Sparkles size={12} /> {t.drawer.outreachAngle}
            </div>
            <p className="mt-2 rounded-lg border border-border bg-surface-2 p-3 text-sm leading-relaxed text-foreground">
              {angle}
            </p>
          </section>

          <section className="border-t border-border px-5 py-4">
            <Label htmlFor="notes">{t.drawer.notes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                locale === "fr"
                  ? "Ajoutez un contexte utile avant la prospection…"
                  : "Write anything worth remembering before outreach…"
              }
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                leftIcon={<Save size={12} />}
                onClick={handleSaveNotes}
              >
                {t.drawer.saveNotes}
              </Button>
            </div>
          </section>

          <section className="border-t border-border px-5 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.drawer.status}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatus(s.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    status === s.value
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-surface-2 text-muted-strong hover:bg-surface-3"
                  )}
                >
                  {status === s.value ? (
                    <Check size={10} />
                  ) : (
                    <Flag size={10} />
                  )}
                  {statusLabel(s.value, locale)}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.drawer.saveToList}
              </div>
              <button
                onClick={handleCreateList}
                className="text-xs text-accent-strong hover:text-accent"
              >
                + New list
              </button>
            </div>
            {lists.length === 0 ? (
              <p className="mt-2 text-xs text-muted">
                {t.drawer.noLists}
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleAddToList(l.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-strong hover:border-accent/40 hover:text-foreground"
                  >
                    {displayListName(l.name, locale)}
                    <span className="text-[10px] text-muted">
                      {l.leadIds.length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Mail size={14} />}
            onClick={() =>
              setToast(
                locale === "fr"
                  ? "Outreach non implémenté pour l’instant"
                  : "Outreach not implemented yet"
              )
            }
          >
            {t.drawer.send}
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Copy size={14} />}
            onClick={() => copy(lead.name, "name")}
          >
            {t.drawer.copy}
          </Button>
        </div>

        {toast ? (
          <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-foreground/95 px-3 py-1.5 text-xs font-medium text-background shadow-lg">
            {toast}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  href,
  onCopy,
  copied,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
        {icon} {label}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-foreground hover:text-accent-strong"
            >
              {value}
            </a>
          ) : (
            <span className="truncate text-sm font-medium text-foreground">
              {value}
            </span>
          )
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
        {value && onCopy ? (
          <button
            onClick={onCopy}
            className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-md border border-border text-muted-strong hover:bg-surface-3"
            aria-label={`Copy ${label}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
