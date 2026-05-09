"use client";

import {
  Building2,
  Filter,
  RotateCcw,
  Share2,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  type AdvancedFilterState,
  type TriState,
  DEFAULT_ADVANCED_FILTERS,
  countActiveFilters,
} from "@/lib/advancedFilters";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
}

export function AdvancedFiltersDrawer({
  open,
  onClose,
  filters,
  onChange,
}: Props) {
  const { locale } = useI18n();
  const [local, setLocal] = React.useState<AdvancedFilterState>(filters);
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setLocal(filters);
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
  }

  function patch<K extends keyof AdvancedFilterState>(
    key: K,
    value: AdvancedFilterState[K]
  ) {
    setLocal((s) => ({ ...s, [key]: value }));
  }

  function apply() {
    onChange(local);
    onClose();
  }

  function reset() {
    setLocal(DEFAULT_ADVANCED_FILTERS);
  }

  const activeCount = countActiveFilters(local);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-white/[0.06] bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-accent-cyan" />
            <span className="text-sm font-semibold text-foreground">
              {locale === "fr" ? "Filtres avancés" : "Advanced Filters"}
            </span>
            {activeCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-[10px] font-bold text-accent-cyan">
                {activeCount}
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-strong hover:bg-white/[0.06] hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-6">
          {/* Active filters — these work now */}
          <FilterGroup
            icon={<Building2 size={13} />}
            title={locale === "fr" ? "Données business" : "Business Data"}
          >
            <TriSelect
              label={locale === "fr" ? "Site internet" : "Website"}
              value={local.hasWebsite}
              onChange={(v) => patch("hasWebsite", v)}
              locale={locale}
            />
            <TriSelect
              label={locale === "fr" ? "Téléphone" : "Phone"}
              value={local.hasPhone}
              onChange={(v) => patch("hasPhone", v)}
              locale={locale}
            />
          </FilterGroup>

          <FilterGroup
            icon={<Star size={13} />}
            title={locale === "fr" ? "Qualité & signaux" : "Quality & Signals"}
          >
            <RangeRow
              label={locale === "fr" ? "Note Google" : "Google Rating"}
              min={local.ratingMin}
              max={local.ratingMax}
              onMinChange={(v) => patch("ratingMin", v)}
              onMaxChange={(v) => patch("ratingMax", v)}
              step={0.5}
              minLimit={0}
              maxLimit={5}
              placeholder={{ min: "0", max: "5" }}
            />
            <RangeRow
              label={locale === "fr" ? "Nombre d'avis" : "Review count"}
              min={local.reviewCountMin}
              max={local.reviewCountMax}
              onMinChange={(v) => patch("reviewCountMin", v)}
              onMaxChange={(v) => patch("reviewCountMax", v)}
              step={1}
              minLimit={0}
              maxLimit={99999}
              placeholder={{ min: "0", max: "∞" }}
            />
            <RangeRow
              label="Score Findely"
              min={local.scoreMin}
              max={local.scoreMax}
              onMinChange={(v) => patch("scoreMin", v)}
              onMaxChange={(v) => patch("scoreMax", v)}
              step={1}
              minLimit={0}
              maxLimit={100}
              placeholder={{ min: "0", max: "100" }}
            />
            <TriSelect
              label={locale === "fr" ? "Prêt à contacter" : "Outreach ready"}
              value={local.outreachReady}
              onChange={(v) => patch("outreachReady", v)}
              locale={locale}
            />
            <TriSelect
              label={locale === "fr" ? "Présence web à améliorer" : "Needs web presence"}
              value={local.needsWebPresence}
              onChange={(v) => patch("needsWebPresence", v)}
              locale={locale}
            />
            <TriSelect
              label={locale === "fr" ? "Sans site" : "No website"}
              value={local.noWebsite}
              onChange={(v) => patch("noWebsite", v)}
              locale={locale}
            />
            <TriSelect
              label={locale === "fr" ? "Contact manquant" : "Missing contact"}
              value={local.missingContact}
              onChange={(v) => patch("missingContact", v)}
              locale={locale}
            />
          </FilterGroup>

          {/* Unavailable filters — clearly separated */}
          <EnrichmentSection locale={locale} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RotateCcw size={12} />}
            onClick={reset}
          >
            {locale === "fr" ? "Réinitialiser" : "Reset"}
          </Button>
          <Button
            size="md"
            variant="primary"
            leftIcon={<Sparkles size={12} />}
            onClick={apply}
          >
            {locale === "fr" ? "Appliquer les filtres" : "Apply Filters"}
            {activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </aside>
    </>
  );
}

function EnrichmentSection({ locale }: { locale: "en" | "fr" }) {
  const [open, setOpen] = React.useState(false);

  const items = [
    locale === "fr" ? "Email" : "Email",
    locale === "fr" ? "Type de téléphone" : "Phone type",
    locale === "fr" ? "Fermé définitivement" : "Permanently closed",
    "Facebook",
    "Instagram",
    "YouTube",
    "Twitter / X",
    "LinkedIn",
    "TikTok",
    locale === "fr" ? "Formulaire de contact" : "Contact form",
    locale === "fr" ? "Pixel publicitaire" : "Ad pixel",
    locale === "fr" ? "Technologies du site" : "Site technologies",
  ];

  return (
    <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01]">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Share2 size={12} className="text-muted" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {locale === "fr"
              ? "Enrichissement requis"
              : "Enrichment Required"}
          </span>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted">
            {items.length}
          </span>
        </div>
        <span className="text-[10px] text-muted">
          {open
            ? locale === "fr" ? "Masquer" : "Hide"
            : locale === "fr" ? "Voir" : "Show"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-white/[0.04] px-4 pb-4 pt-3">
          <p className="mb-3 text-[11px] leading-relaxed text-muted">
            {locale === "fr"
              ? "Ces filtres nécessitent un module d'enrichissement (scraping site, réseaux sociaux). Ils seront activés dans une prochaine version."
              : "These filters require an enrichment module (site scraping, social networks). They will be enabled in a future release."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-muted opacity-60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
        {icon}
        {title}
      </div>
      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        {children}
      </div>
    </div>
  );
}

function TriSelect({
  label,
  value,
  onChange,
  locale,
  disabled,
  hint,
}: {
  label: string;
  value: TriState;
  onChange: (v: TriState) => void;
  locale: "en" | "fr";
  disabled?: boolean;
  hint?: string;
}) {
  const options: { value: TriState; label: string }[] = [
    { value: "all", label: locale === "fr" ? "Tous" : "All" },
    { value: "yes", label: locale === "fr" ? "Oui" : "Yes" },
    { value: "no", label: locale === "fr" ? "Non" : "No" },
  ];

  return (
    <div className={cn(disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-strong">{label}</span>
        <div className="flex gap-0.5 rounded-md border border-white/[0.06] bg-white/[0.02] p-0.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                value === opt.value
                  ? "bg-accent/15 text-accent-cyan"
                  : "text-muted hover:text-muted-strong",
                disabled && "cursor-not-allowed"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {hint ? <p className="mt-0.5 text-[10px] text-muted">{hint}</p> : null}
    </div>
  );
}

function RangeRow({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  step = 1,
  minLimit = 0,
  maxLimit = 99999,
  placeholder,
}: {
  label: string;
  min: number | null;
  max: number | null;
  onMinChange: (v: number | null) => void;
  onMaxChange: (v: number | null) => void;
  step?: number;
  minLimit?: number;
  maxLimit?: number;
  placeholder?: { min: string; max: string };
}) {
  return (
    <div>
      <Label className="text-xs text-muted-strong">{label}</Label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Input
          type="number"
          step={step}
          min={minLimit}
          max={maxLimit}
          placeholder={placeholder?.min ?? "Min"}
          value={min ?? ""}
          onChange={(e) =>
            onMinChange(e.target.value === "" ? null : Number(e.target.value))
          }
          className="h-8 text-xs"
        />
        <Input
          type="number"
          step={step}
          min={minLimit}
          max={maxLimit}
          placeholder={placeholder?.max ?? "Max"}
          value={max ?? ""}
          onChange={(e) =>
            onMaxChange(e.target.value === "" ? null : Number(e.target.value))
          }
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}

