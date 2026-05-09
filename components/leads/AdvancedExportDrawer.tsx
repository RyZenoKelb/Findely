"use client";

import { Download, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/checkbox";
import { buildExportFilename, downloadCsv, leadDataType } from "@/lib/csvExport";
import type { Lead } from "@/lib/leadTypes";
import { recordExport } from "@/lib/actions/exports";
import { bumpUsage } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface ExportColumn {
  key: string;
  label: { en: string; fr: string };
  group: string;
  defaultOn: boolean;
  getValue: (lead: Lead) => string;
}

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: "name", label: { en: "Name", fr: "Nom" }, group: "core", defaultOn: true, getValue: (l) => l.name },
  { key: "category", label: { en: "Category", fr: "Catégorie" }, group: "core", defaultOn: true, getValue: (l) => l.category ?? "" },
  { key: "placeId", label: { en: "Google Place ID", fr: "Google Place ID" }, group: "core", defaultOn: false, getValue: (l) => l.id },
  { key: "mapsUrl", label: { en: "Google Maps URL", fr: "Lien Google Maps" }, group: "core", defaultOn: true, getValue: (l) => l.mapsUrl ?? "" },
  { key: "phone", label: { en: "Phone", fr: "Téléphone" }, group: "contact", defaultOn: true, getValue: (l) => l.phone ?? "" },
  { key: "website", label: { en: "Website", fr: "Site internet" }, group: "contact", defaultOn: true, getValue: (l) => l.website ?? "" },
  { key: "address", label: { en: "Address", fr: "Adresse" }, group: "contact", defaultOn: true, getValue: (l) => l.address ?? "" },
  { key: "geo", label: { en: "Coordinates", fr: "Coordonnées" }, group: "contact", defaultOn: false, getValue: (l) => l.geo ? `${l.geo.lat},${l.geo.lng}` : "" },
  { key: "rating", label: { en: "Rating", fr: "Note" }, group: "quality", defaultOn: true, getValue: (l) => typeof l.rating === "number" ? String(l.rating) : "" },
  { key: "ratingCount", label: { en: "Review Count", fr: "Nombre d'avis" }, group: "quality", defaultOn: true, getValue: (l) => typeof l.ratingCount === "number" ? String(l.ratingCount) : "" },
  { key: "score", label: { en: "Score Findely", fr: "Score Findely" }, group: "quality", defaultOn: true, getValue: (l) => String(l.score) },
  { key: "priorityLabel", label: { en: "Priority", fr: "Priorité" }, group: "quality", defaultOn: true, getValue: (l) => l.priorityLabel ?? "" },
  { key: "dataQuality", label: { en: "Data Quality", fr: "Qualité données" }, group: "quality", defaultOn: false, getValue: (l) => l.dataQualityLabel ?? "" },
  { key: "contactReadiness", label: { en: "Contact Readiness", fr: "Prêt au contact" }, group: "quality", defaultOn: false, getValue: (l) => l.contactReadinessLabel ?? "" },
  { key: "opportunityType", label: { en: "Opportunity Type", fr: "Type d'opportunité" }, group: "opportunity", defaultOn: true, getValue: (l) => l.opportunityType ?? "" },
  { key: "opportunityReason", label: { en: "Opportunity Reason", fr: "Raison d'opportunité" }, group: "opportunity", defaultOn: false, getValue: (l) => l.opportunityReason ?? "" },
  { key: "recommendedAction", label: { en: "Recommended Action", fr: "Action recommandée" }, group: "opportunity", defaultOn: true, getValue: (l) => l.recommendedAction ?? "" },
  { key: "signals", label: { en: "Signals", fr: "Signaux" }, group: "signals", defaultOn: true, getValue: (l) => l.signals.join("|") },
  { key: "source", label: { en: "Source", fr: "Source" }, group: "meta", defaultOn: true, getValue: (l) => l.source },
  { key: "dataType", label: { en: "Data Type", fr: "Type de donnée" }, group: "meta", defaultOn: false, getValue: (l) => leadDataType(l) },
  { key: "status", label: { en: "Status", fr: "Statut" }, group: "meta", defaultOn: true, getValue: (l) => l.status ?? "new" },
  { key: "notes", label: { en: "Notes", fr: "Notes" }, group: "meta", defaultOn: false, getValue: (l) => l.notes ?? "" },
  { key: "createdAt", label: { en: "Created At", fr: "Créé le" }, group: "meta", defaultOn: false, getValue: (l) => l.createdAt },
  { key: "exportedAt", label: { en: "Exported At", fr: "Exporté le" }, group: "meta", defaultOn: false, getValue: (l) => l.exportedAt ?? "" },
];

const GROUPS: { key: string; label: { en: string; fr: string } }[] = [
  { key: "core", label: { en: "Core", fr: "Essentiel" } },
  { key: "contact", label: { en: "Contact", fr: "Contact" } },
  { key: "quality", label: { en: "Quality", fr: "Qualité" } },
  { key: "opportunity", label: { en: "Opportunity", fr: "Opportunité" } },
  { key: "signals", label: { en: "Signals", fr: "Signaux" } },
  { key: "meta", label: { en: "Metadata", fr: "Métadonnées" } },
];

interface Props {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedIds?: Set<string>;
  businessType?: string;
  location?: string;
}

const CSV_FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

function csvEscape(v: string): string {
  let s = v;
  if (s.length > 0 && CSV_FORMULA_PREFIXES.includes(s[0])) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function AdvancedExportDrawer({
  open,
  onClose,
  leads,
  selectedIds,
  businessType,
  location,
}: Props) {
  const { locale } = useI18n();
  const [columns, setColumns] = React.useState<Set<string>>(
    () => new Set(EXPORT_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key))
  );
  const [filename, setFilename] = React.useState("");
  const [limit, setLimit] = React.useState<number | null>(null);
  const [onlySelected, setOnlySelected] = React.useState(false);
  const [excludeExported, setExcludeExported] = React.useState(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setFilename(buildExportFilename({ businessType, location }));
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  function toggleColumn(key: string) {
    setColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setColumns(new Set(EXPORT_COLUMNS.map((c) => c.key)));
  }

  function resetColumns() {
    setColumns(
      new Set(EXPORT_COLUMNS.filter((c) => c.defaultOn).map((c) => c.key))
    );
  }

  function handleExport() {
    let data = leads;
    if (onlySelected && selectedIds && selectedIds.size > 0) {
      data = data.filter((l) => selectedIds.has(l.id));
    }
    if (excludeExported) {
      data = data.filter((l) => !l.exportedAt);
    }
    if (limit && limit > 0) {
      data = data.slice(0, limit);
    }

    const activeCols = EXPORT_COLUMNS.filter((c) => columns.has(c.key));
    const headers = activeCols.map((c) => c.label[locale]);
    const rows = data.map((lead) =>
      activeCols.map((c) => csvEscape(c.getValue(lead))).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const finalName = filename || "findely-export.csv";
    downloadCsv(finalName.endsWith(".csv") ? finalName : `${finalName}.csv`, csv);

    bumpUsage({ exports: 1 });
    const demoCount = data.filter((l) => leadDataType(l) === "demo").length;
    void recordExport({
      leadCount: data.length,
      kind: onlySelected ? "selected" : "visible",
      filename: finalName,
      businessType,
      location,
      demoCount,
      realCount: data.length - demoCount,
    });

    onClose();
  }

  const exportableCount = React.useMemo(() => {
    let data = leads;
    if (onlySelected && selectedIds && selectedIds.size > 0) {
      data = data.filter((l) => selectedIds.has(l.id));
    }
    if (excludeExported) {
      data = data.filter((l) => !l.exportedAt);
    }
    if (limit && limit > 0) return Math.min(data.length, limit);
    return data.length;
  }, [leads, selectedIds, onlySelected, excludeExported, limit]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-white/[0.06] bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <Download size={14} className="text-accent-cyan" />
            <span className="text-sm font-semibold text-foreground">
              {locale === "fr" ? "Export avancé" : "Advanced Export"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-strong hover:bg-white/[0.06] hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
              {locale === "fr" ? "Paramètres" : "Settings"}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              <div>
                <Label className="text-xs">
                  {locale === "fr" ? "Nom du fichier" : "Filename"}
                </Label>
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">
                  {locale === "fr" ? "Limite de lignes" : "Row limit"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder={locale === "fr" ? "Illimité" : "No limit"}
                  value={limit ?? ""}
                  onChange={(e) =>
                    setLimit(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="h-8 text-xs"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-strong">
                <Checkbox
                  checked={onlySelected}
                  onCheckedChange={(c) => setOnlySelected(Boolean(c))}
                />
                {locale === "fr"
                  ? "Uniquement les sélectionnés"
                  : "Only selected leads"}
                {selectedIds && selectedIds.size > 0
                  ? ` (${selectedIds.size})`
                  : ""}
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-strong">
                <Checkbox
                  checked={excludeExported}
                  onCheckedChange={(c) => setExcludeExported(Boolean(c))}
                />
                {locale === "fr"
                  ? "Exclure les déjà exportés"
                  : "Exclude already exported"}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
                {locale === "fr" ? "Colonnes" : "Columns"} ({columns.size}/
                {EXPORT_COLUMNS.length})
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[10px] text-accent-cyan hover:text-accent-strong"
                >
                  {locale === "fr" ? "Tout" : "All"}
                </button>
                <button
                  type="button"
                  onClick={resetColumns}
                  className="text-[10px] text-muted-strong hover:text-foreground"
                >
                  {locale === "fr" ? "Défaut" : "Default"}
                </button>
              </div>
            </div>

            {GROUPS.map((group) => {
              const groupCols = EXPORT_COLUMNS.filter(
                (c) => c.group === group.key
              );
              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted">
                    {group.label[locale]}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {groupCols.map((col) => (
                      <label
                        key={col.key}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                          columns.has(col.key)
                            ? "bg-accent/10 text-foreground"
                            : "text-muted-strong hover:bg-white/[0.04]"
                        )}
                      >
                        <Checkbox
                          checked={columns.has(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                        />
                        {col.label[locale]}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
          <span className="text-xs text-muted">
            {exportableCount}{" "}
            {locale === "fr" ? "lignes à exporter" : "rows to export"}
          </span>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download size={12} />}
            onClick={handleExport}
            disabled={exportableCount === 0 || columns.size === 0}
          >
            {locale === "fr" ? "Exporter CSV" : "Export CSV"}
          </Button>
        </div>
      </aside>
    </>
  );
}
