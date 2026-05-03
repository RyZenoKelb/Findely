"use client";

import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpDown,
  Building2,
  Check,
  Copy,
  ExternalLink,
  ListPlus,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  X,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Input } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportButton } from "./ExportButton";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadScore } from "./LeadScore";
import { SignalBadges } from "./SignalBadge";
import type { Lead, LeadFilterKey, LeadList } from "@/lib/leadTypes";
import { applyFilters } from "@/lib/leadFilters";
import { useI18n } from "@/lib/i18n";
import {
  STORAGE_KEYS,
  addLeadToList,
  getEmptySnapshot,
  getRawSnapshot,
  saveLead,
  saveLeads,
  subscribeToLocalStorage,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

type SortKey = "score" | "name" | "source";

export function LeadTable({
  leads: initial,
  emptyTitle = "No leads yet",
  emptyDescription = "Run a search to populate this view.",
  defaultFilename = "findely-leads.csv",
  authed = false,
}: {
  leads: Lead[];
  emptyTitle?: string;
  emptyDescription?: string;
  defaultFilename?: string;
  /** Forwarded to the detail drawer so "save to list" hits the DB when true. */
  authed?: boolean;
}) {
  const { t } = useI18n();
  const [leads, setLeads] = React.useState<Lead[]>(initial);
  const [prevInitial, setPrevInitial] = React.useState<Lead[]>(initial);
  // Reset internal `leads` whenever the parent passes a new array identity —
  // derived-state-reset pattern, no setState-in-effect.
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setLeads(initial);
  }

  const CHIPS: { key: LeadFilterKey; label: string }[] = [
    { key: "without_website", label: t.table.withoutWebsite },
    { key: "with_website", label: t.table.withWebsite },
    { key: "with_phone", label: t.table.withPhone },
    { key: "has_address", label: t.table.hasAddress },
    { key: "missing_contact", label: t.table.missingContact },
    { key: "high_score", label: t.table.highScore },
    { key: "outreach_ready", label: t.table.outreachReady },
    { key: "needs_online_presence", label: t.table.needsOnlinePresence },
  ];

  const [query, setQuery] = React.useState("");
  const [chip, setChip] = React.useState<LeadFilterKey>("without_website");
  const [chipOn, setChipOn] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("score");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [listMenuFor, setListMenuFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = leads;
    if (chipOn) base = applyFilters(base, [chip]);
    if (q) {
      base = base.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.category && l.category.toLowerCase().includes(q)) ||
          (l.address && l.address.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.website && l.website.toLowerCase().includes(q))
      );
    }
    const sorted = [...base];
    if (sort === "score") sorted.sort((a, b) => b.score - a.score);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "source")
      sorted.sort((a, b) => a.source.localeCompare(b.source));
    return sorted;
  }, [leads, query, chip, chipOn, sort]);

  const allSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((l) => next.delete(l.id));
    else filtered.forEach((l) => next.add(l.id));
    setSelected(next);
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function updateLead(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    saveLead(updated);
  }

  function markSelectedContacted() {
    const updates = leads.map((l) =>
      selected.has(l.id) ? { ...l, status: "contacted" as const } : l
    );
    setLeads(updates);
    saveLeads(updates.filter((l) => selected.has(l.id)));
    setToast(`Marked ${selected.size} as contacted`);
  }

  function copyValue(value: string | null | undefined, label: string) {
    if (!value) return;
    navigator.clipboard?.writeText(value).then(() => setToast(`Copied ${label}`));
  }

  const selectedLeads = leads.filter((l) => selected.has(l.id));

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-muted">
          <Search size={16} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {emptyTitle}
        </h3>
        <p className="mt-1 text-sm text-muted-strong">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.table.searchResults}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                if (chip === c.key) setChipOn((s) => !s);
                else {
                  setChip(c.key);
                  setChipOn(true);
                }
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                chipOn && chip === c.key
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-white/[0.06] bg-white/[0.04] text-muted-strong hover:bg-white/[0.06]"
              )}
            >
              {c.label}
              {chipOn && chip === c.key ? <X size={10} /> : null}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SortMenu sort={sort} onChange={setSort} />
          <ExportButton leads={filtered} filename={defaultFilename} />
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-accent/5 px-4 py-2 text-xs">
          <span className="text-foreground">
            {selected.size} {t.table.selectedOfTotal} {filtered.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Check size={12} />}
            onClick={markSelectedContacted}
          >
            {t.table.markContacted}
          </Button>
          <ExportButton
            leads={selectedLeads}
            label={`${t.table.exportCsv} (${selected.size})`}
            filename={`findely-selected-${selected.size}.csv`}
          />
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<X size={12} />}
            onClick={() => setSelected(new Set())}
          >
            {t.table.clear}
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[960px] table-fixed text-sm">
          <colgroup>
            <col className="w-[40px]" />
            <col className="w-[26%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[20%]" />
            <col className="w-[110px]" />
            <col className="w-[56px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-3 py-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2">{t.table.business}</th>
              <th className="px-3 py-2">{t.table.phone}</th>
              <th className="px-3 py-2">{t.table.website}</th>
              <th className="px-3 py-2">{t.table.address}</th>
              <th className="px-3 py-2">{t.table.signals}</th>
              <th className="px-3 py-2">{t.table.score}</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const isSel = selected.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  className={cn(
                    "group cursor-pointer border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]",
                    isSel && "bg-accent/[0.04]"
                  )}
                  onClick={() => setOpenId(lead.id)}
                >
                  <td
                    className="px-3 py-2.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(lead.id);
                    }}
                  >
                    <Checkbox
                      checked={isSel}
                      onCheckedChange={() => toggle(lead.id)}
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={cn(
                          "flex h-7 w-7 flex-none items-center justify-center rounded-md border text-muted-strong",
                          lead.priorityLevel === "high"
                            ? "border-success/40 bg-success/10 text-success"
                            : lead.priorityLevel === "medium"
                              ? "border-accent/40 bg-accent/10 text-accent-cyan"
                              : "border-white/[0.06] bg-white/[0.04]"
                        )}
                        title={lead.priorityLabel}
                      >
                        <Building2 size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate font-medium text-foreground">
                          <span className="truncate">{lead.name}</span>
                          {lead.opportunityLabel ? (
                            <span
                              className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-normal text-muted-strong"
                              title={lead.opportunityReason}
                            >
                              {lead.opportunityLabel}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 truncate text-xs text-muted">
                          <span className="truncate">
                            {lead.category ?? "Business"} ·{" "}
                            <span className="text-muted-strong">
                              {lead.source === "google_maps"
                                ? "Google Places"
                                : lead.source}
                            </span>
                          </span>
                          {lead.source === "mock" ? (
                            <DemoBadge variant="demo" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="overflow-hidden px-3 py-2.5">
                    {lead.phone ? (
                      <div
                        className="block truncate text-foreground"
                        title={lead.phone}
                      >
                        {lead.phone}
                      </div>
                    ) : (
                      <Badge tone="danger">{t.table.missing}</Badge>
                    )}
                  </td>
                  <td className="overflow-hidden px-3 py-2.5">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={lead.website}
                        className="flex min-w-0 items-center gap-1 truncate text-accent-strong hover:text-accent"
                      >
                        <span className="truncate">
                          {lead.website.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink size={10} className="flex-none" />
                      </a>
                    ) : (
                      <Badge tone="warning">{t.table.noWebsite}</Badge>
                    )}
                  </td>
                  <td className="overflow-hidden px-3 py-2.5">
                    <div
                      className="block truncate text-muted-strong"
                      title={lead.address ?? undefined}
                    >
                      {lead.address ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <SignalBadges signals={lead.signals} max={2} />
                  </td>
                  <td className="px-3 py-2.5">
                    <LeadScore score={lead.score} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <RowMenu
                      open={listMenuFor === lead.id}
                      onToggle={(open) =>
                        setListMenuFor(open ? lead.id : null)
                      }
                      lead={lead}
                      onCopyPhone={() => copyValue(lead.phone, "phone")}
                      onCopyWebsite={() => copyValue(lead.website, "website")}
                      onMarkContacted={() =>
                        updateLead({ ...lead, status: "contacted" })
                      }
                      onAddedToList={(name) => {
                        setToast(`Saved to ${name}`);
                        updateLead({
                          ...lead,
                          status: lead.status ?? "saved",
                        });
                      }}
                      onOpen={() => setOpenId(lead.id)}
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm text-muted"
                >
                  {t.table.noMatch}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-4 py-2 text-xs text-muted">
        <span>
          {t.table.showing} {filtered.length} / {leads.length} {t.table.leadsFound}
        </span>
        <span>{t.table.clickRow}</span>
      </div>

      {openId ? (
        <LeadDetailDrawer
          lead={leads.find((l) => l.id === openId) ?? null}
          onClose={() => setOpenId(null)}
          onUpdated={updateLead}
          authed={authed}
        />
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground/95 px-3 py-1.5 text-xs font-medium text-background shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function SortMenu({
  sort,
  onChange,
}: {
  sort: SortKey;
  onChange: (s: SortKey) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function h(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const labels: Record<SortKey, { label: string; icon: React.ReactNode }> = {
    score: { label: "Highest score", icon: <ArrowDownWideNarrow size={12} /> },
    name: { label: "Name A–Z", icon: <ArrowDownAZ size={12} /> },
    source: { label: "Source", icon: <ArrowUpDown size={12} /> },
  };
  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="outline"
        leftIcon={labels[sort].icon}
        onClick={() => setOpen((s) => !s)}
      >
        Sort: {labels[sort].label}
      </Button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1c20] shadow-2xl">
          {(["score", "name", "source"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                onChange(k);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/[0.06]",
                sort === k ? "text-foreground" : "text-muted-strong"
              )}
            >
              {labels[k].icon} {labels[k].label}
              {sort === k ? (
                <Check size={12} className="ml-auto text-accent-strong" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RowMenu({
  lead,
  open,
  onToggle,
  onCopyPhone,
  onCopyWebsite,
  onMarkContacted,
  onAddedToList,
  onOpen,
}: {
  lead: Lead;
  open: boolean;
  onToggle: (open: boolean) => void;
  onCopyPhone: () => void;
  onCopyWebsite: () => void;
  onMarkContacted: () => void;
  onAddedToList: (name: string) => void;
  onOpen: () => void;
}) {
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
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function h(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onToggle(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onToggle]);

  return (
    <div
      ref={ref}
      className="relative flex justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onToggle(!open)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-strong hover:border-white/[0.08] hover:bg-white/[0.04]"
        aria-label="Row actions"
      >
        <MoreHorizontal size={14} />
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-40 w-56 overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1c20] shadow-2xl">
          <MenuItem
            label="View details"
            icon={<ExternalLink size={12} />}
            onClick={() => {
              onOpen();
              onToggle(false);
            }}
          />
          <MenuItem
            label="Copy phone"
            icon={<Phone size={12} />}
            disabled={!lead.phone}
            onClick={() => {
              onCopyPhone();
              onToggle(false);
            }}
          />
          <MenuItem
            label="Copy website"
            icon={<Copy size={12} />}
            disabled={!lead.website}
            onClick={() => {
              onCopyWebsite();
              onToggle(false);
            }}
          />
          {lead.website ? (
            <MenuItem
              label="Open website"
              icon={<ExternalLink size={12} />}
              onClick={() => {
                if (lead.website)
                  window.open(lead.website, "_blank", "noopener,noreferrer");
                onToggle(false);
              }}
            />
          ) : null}
          {lead.mapsUrl ? (
            <MenuItem
              label="Open in Maps"
              icon={<MapPin size={12} />}
              onClick={() => {
                if (lead.mapsUrl)
                  window.open(lead.mapsUrl, "_blank", "noopener,noreferrer");
                onToggle(false);
              }}
            />
          ) : null}
          <MenuItem
            label="Mark contacted"
            icon={<Check size={12} />}
            onClick={() => {
              onMarkContacted();
              onToggle(false);
            }}
          />
          <div className="border-t border-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <ListPlus size={10} className="inline-block" /> Add to list
          </div>
          {lists.length === 0 ? (
            <div className="px-3 pb-2 text-xs text-muted">
              No lists yet — create one from the drawer.
            </div>
          ) : (
            lists.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  addLeadToList(l.id, lead.id);
                  onAddedToList(l.name);
                  onToggle(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-muted-strong hover:bg-white/[0.08] hover:text-foreground"
              >
                {l.name}
                <span className="text-[10px] text-muted">
                  {l.leadIds.length}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-strong hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40"
    >
      {icon} {label}
    </button>
  );
}
