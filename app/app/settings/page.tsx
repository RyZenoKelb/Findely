"use client";

import { Check, History, Save, Trash2 } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EditableChip } from "@/components/ui/editable-chip";
import { Input, Label, Select } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import type { AppSettings } from "@/lib/leadTypes";
import { clearSeen, seenCount } from "@/lib/seenLeads";
import { listSources } from "@/lib/sources";
import { DEFAULT_SETTINGS, getSettings, updateSettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = React.useState(false);
  const [seenTotal, setSeenTotal] = React.useState(0);
  const [resetToast, setResetToast] = React.useState<string | null>(null);
  const sources = React.useMemo(() => listSources(), []);

  React.useEffect(() => {
    setSettings(getSettings());
    setSeenTotal(seenCount());
  }, []);

  React.useEffect(() => {
    if (!resetToast) return;
    const id = setTimeout(() => setResetToast(null), 2200);
    return () => clearTimeout(id);
  }, [resetToast]);

  function handleResetSeen() {
    clearSeen();
    setSeenTotal(0);
    setResetToast(
      locale === "fr"
        ? "Historique des leads réinitialisé."
        : "Lead history reset."
    );
  }

  function patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function toggleSource(id: string) {
    setSettings((s) => ({
      ...s,
      defaultSources: s.defaultSources.includes(id)
        ? s.defaultSources.filter((x) => x !== id)
        : [...s.defaultSources, id],
    }));
  }

  function handleSave() {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Section title={t.settings.profile} subtitle={t.settings.profileSub}>
        <div className="grid items-start gap-4 md:grid-cols-2">
          <div>
            <Label>{t.settings.name}</Label>
            <div className="mt-1">
              <EditableChip
                value={settings.profileName}
                onChange={(v) => patch("profileName", v)}
                size="lg"
                ariaLabel={t.settings.name}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">{t.settings.email}</Label>
            <Input
              id="email"
              value={settings.profileEmail}
              onChange={(e) => patch("profileEmail", e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section
        title={t.settings.searchDefaults}
        subtitle={t.settings.searchDefaultsSub}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="dc">{t.settings.defaultCountry}</Label>
            <Input
              id="dc"
              value={settings.defaultCountry}
              onChange={(e) => patch("defaultCountry", e.target.value)}
              placeholder="France"
            />
          </div>
          <div>
            <Label htmlFor="dl">{t.settings.defaultLanguage}</Label>
            <Input
              id="dl"
              value={settings.defaultLanguage}
              onChange={(e) => patch("defaultLanguage", e.target.value)}
              placeholder="en"
            />
          </div>
          <div>
            <Label htmlFor="dli">{t.settings.defaultLimit}</Label>
            <Input
              id="dli"
              type="number"
              min={10}
              max={120}
              value={settings.defaultLimit}
              onChange={(e) =>
                patch(
                  "defaultLimit",
                  Math.max(10, Math.min(120, Number(e.target.value) || 40))
                )
              }
            />
          </div>
        </div>
        <div className="mt-4">
          <Label>{t.settings.preferredSources}</Label>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => {
              const on = settings.defaultSources.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSource(s.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                    on
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-surface-2 text-muted-strong hover:bg-surface-3"
                  )}
                >
                  {s.name}
                  {s.badge ? (
                    <Badge tone={s.id === "mock" ? "accent" : "outline"}>
                      {s.badge}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section
        title={t.settings.exportPrefs}
        subtitle={t.settings.exportPrefsSub}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
            <Checkbox
              checked={settings.exportIncludeScore}
              onCheckedChange={(c) => patch("exportIncludeScore", c)}
            />
            {t.settings.includeScore}
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
            <Checkbox
              checked={settings.exportIncludeSignals}
              onCheckedChange={(c) => patch("exportIncludeSignals", c)}
            />
            {t.settings.includeSignals}
          </label>
        </div>
      </Section>

      <Section
        title={t.settings.appearance}
        subtitle={t.settings.appearanceSub}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="th">{t.settings.theme}</Label>
            <Select
              id="th"
              value={settings.theme}
              onChange={(e) =>
                patch("theme", e.target.value as AppSettings["theme"])
              }
            >
              <option value="dark">{t.settings.themeDark}</option>
              <option value="system">{t.settings.themeSystem}</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t.settings.language}</Label>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
              <LanguageSwitcher variant="outline" />
              <span className="text-xs text-muted">{t.settings.languageSub}</span>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title={locale === "fr" ? "Historique des leads" : "Lead history"}
        subtitle={
          locale === "fr"
            ? "Supprime l’historique local des leads déjà scannés sur cet appareil."
            : "Clears the local history of leads already scanned on this device."
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-muted-strong">
            <History size={16} className="text-accent-cyan" />
            <span>
              {seenTotal}{" "}
              {locale === "fr"
                ? seenTotal === 1
                  ? "lead déjà vu"
                  : "leads déjà vus"
                : seenTotal === 1
                  ? "previously seen lead"
                  : "previously seen leads"}
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={12} />}
            onClick={handleResetSeen}
          >
            {locale === "fr" ? "Réinitialiser" : "Reset history"}
          </Button>
        </div>
        {resetToast ? (
          <p className="mt-2 text-xs text-success">{resetToast}</p>
        ) : null}
      </Section>

      <div className="flex items-center justify-end gap-2">
        {saved ? (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <Check size={12} /> {t.settings.saved}
          </span>
        ) : null}
        <Button leftIcon={<Save size={14} />} onClick={handleSave}>
          {t.settings.save}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
