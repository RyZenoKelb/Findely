"use client";

import {
  AlertTriangle,
  Check,
  Code2,
  Download,
  History,
  KeyRound,
  LogOut,
  Palette,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { SettingsSection } from "@/components/app/SettingsSection";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableChip } from "@/components/ui/editable-chip";
import { Input, Label, Select } from "@/components/ui/Field";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import type { AppSettings } from "@/lib/leadTypes";
import { getPlanLimits, isUnlimited, type Plan } from "@/lib/plans";
import { clearSeen, seenCount } from "@/lib/seenLeads";
import { listSources } from "@/lib/sources";
import { DEFAULT_SETTINGS, getSettings, updateSettings } from "@/lib/storage";
import { cn, formatNumber } from "@/lib/utils";

export interface SettingsViewProps {
  plan: Plan | null;
  email: string | null;
}

function planLabel(plan: Plan, t: ReturnType<typeof useI18n>["t"]): string {
  const p = t.plans;
  switch (plan) {
    case "free":
      return p?.free ?? "Free";
    case "starter":
      return p?.starter ?? "Starter";
    case "pro":
      return p?.pro ?? "Pro";
    case "agency":
      return p?.agency ?? "Agency";
    case "api_starter":
      return p?.apiStarter ?? "API Starter";
    case "api_pro":
      return p?.apiPro ?? "API Pro";
    case "api_scale":
      return p?.apiScale ?? "API Scale";
    default:
      return plan;
  }
}

function shallowEqualSettings(a: AppSettings, b: AppSettings): boolean {
  const keys = Object.keys(a) as (keyof AppSettings)[];
  for (const k of keys) {
    const av = a[k];
    const bv = b[k];
    if (Array.isArray(av) && Array.isArray(bv)) {
      if (av.length !== bv.length || av.some((x, i) => x !== bv[i]))
        return false;
    } else if (av !== bv) {
      return false;
    }
  }
  return true;
}

const NAV_ITEMS = [
  { id: "profile", icon: User, key: "navProfile" as const },
  { id: "search", icon: Search, key: "navSearch" as const },
  { id: "exports", icon: Download, key: "navExport" as const },
  { id: "appearance", icon: Palette, key: "navAppearance" as const },
  { id: "history", icon: History, key: "navHistory" as const },
  { id: "developer", icon: Code2, key: "navDeveloper" as const },
  { id: "account", icon: KeyRound, key: "navAccount" as const },
  { id: "danger", icon: ShieldAlert, key: "navDanger" as const },
];

export function SettingsView({ plan, email }: SettingsViewProps) {
  const { t, locale } = useI18n();

  const [persisted, setPersisted] = React.useState<AppSettings>(() =>
    typeof window === "undefined" ? DEFAULT_SETTINGS : getSettings()
  );
  const [draft, setDraft] = React.useState<AppSettings>(persisted);
  const [seenTotal, setSeenTotal] = React.useState<number>(() =>
    typeof window === "undefined" ? 0 : seenCount()
  );
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [toast, setToast] = React.useState<string | null>(null);
  const sources = React.useMemo(() => listSources(), []);

  const dirty = React.useMemo(
    () => !shallowEqualSettings(persisted, draft),
    [persisted, draft]
  );

  React.useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  function patch<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setDraft((s) => ({ ...s, [key]: value }));
  }

  function toggleSource(id: string) {
    setDraft((s) => ({
      ...s,
      defaultSources: s.defaultSources.includes(id)
        ? s.defaultSources.filter((x) => x !== id)
        : [...s.defaultSources, id],
    }));
  }

  function handleSave() {
    setSaveState("saving");
    const next = updateSettings(draft);
    setPersisted(next);
    setDraft(next);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1600);
  }

  function handleDiscard() {
    setDraft(persisted);
  }

  function handleResetSeen() {
    clearSeen();
    setSeenTotal(0);
    setToast(t.settings.historyToast ?? "Lead history cleared.");
  }

  const limits = plan ? getPlanLimits(plan) : null;
  const canUseApi = limits?.canUseApi ?? false;

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow={t.settings.eyebrow ?? "Workspace settings"}
        title={t.sidebar.settings}
        description={t.settings.subtitle}
        actions={
          <div className="flex items-center gap-2">
            {dirty ? (
              <>
                <span className="hidden text-xs text-warning sm:inline-flex">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle" />
                  {t.settings.unsaved}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<RotateCcw size={12} />}
                  onClick={handleDiscard}
                >
                  {t.settings.discard}
                </Button>
              </>
            ) : null}
            {saveState === "saved" ? (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <Check size={12} /> {t.settings.saved}
              </span>
            ) : null}
            <Button
              size="sm"
              leftIcon={<Save size={12} />}
              onClick={handleSave}
              disabled={!dirty || saveState === "saving"}
            >
              {saveState === "saving"
                ? t.apiKeys?.creating ?? "Saving…"
                : t.settings.save}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav
            aria-label={t.settings.eyebrow ?? "Settings navigation"}
            className="sticky top-20 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {t.settings.eyebrow ?? "Settings"}
            </div>
            <div className="space-y-0.5">
              {NAV_ITEMS.map(({ id, icon: Icon, key }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 hover:bg-white/[0.04] hover:text-foreground",
                    id === "danger"
                      ? "text-muted-strong hover:text-danger"
                      : "text-muted-strong"
                  )}
                >
                  <Icon size={13} className="flex-none" />
                  {t.settings[key] ?? id}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="space-y-4">
          <SettingsSection
            id="profile"
            icon={User}
            title={t.settings.profile}
            description={t.settings.profileDesc ?? t.settings.profileSub}
          >
            <div className="grid items-start gap-4 md:grid-cols-2">
              <div>
                <Label>{t.settings.name}</Label>
                <div className="mt-1">
                  <EditableChip
                    value={draft.profileName}
                    onChange={(v) => patch("profileName", v)}
                    size="lg"
                    ariaLabel={t.settings.name}
                  />
                </div>
              </div>
              <div>
                <Label>{t.settings.email}</Label>
                <div className="mt-1 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-foreground">
                  {email ?? (locale === "fr" ? "Session démo" : "Demo session")}
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="search"
            icon={Search}
            title={t.settings.searchDefaults}
            description={
              t.settings.searchDefaultsDesc ?? t.settings.searchDefaultsSub
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="dc">{t.settings.defaultCountry}</Label>
                <Input
                  id="dc"
                  value={draft.defaultCountry}
                  onChange={(e) => patch("defaultCountry", e.target.value)}
                  placeholder="France"
                />
              </div>
              <div>
                <Label htmlFor="dl">{t.settings.defaultLanguage}</Label>
                <Input
                  id="dl"
                  value={draft.defaultLanguage}
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
                  value={draft.defaultLimit}
                  onChange={(e) =>
                    patch(
                      "defaultLimit",
                      Math.max(
                        10,
                        Math.min(120, Number(e.target.value) || 40)
                      )
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-5">
              <Label>{t.settings.preferredSources}</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {sources.map((s) => {
                  const on = draft.defaultSources.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSource(s.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                        on
                          ? "border-accent/40 bg-accent/10 text-foreground"
                          : "border-white/[0.06] bg-white/[0.04] text-muted-strong hover:bg-white/[0.06]"
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
          </SettingsSection>

          <SettingsSection
            id="exports"
            icon={Download}
            title={t.settings.exportPrefs}
            description={t.settings.exportPrefsDesc ?? t.settings.exportPrefsSub}
          >
            <div className="grid gap-2.5 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm transition-colors hover:border-white/[0.1]">
                <Checkbox
                  checked={draft.exportIncludeScore}
                  onCheckedChange={(c) => patch("exportIncludeScore", c)}
                />
                <span>
                  <span className="block font-medium text-foreground">
                    {t.settings.includeScore}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {locale === "fr"
                      ? "Ajoute une colonne score 0–100."
                      : "Adds a 0–100 score column."}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm transition-colors hover:border-white/[0.1]">
                <Checkbox
                  checked={draft.exportIncludeSignals}
                  onCheckedChange={(c) => patch("exportIncludeSignals", c)}
                />
                <span>
                  <span className="block font-medium text-foreground">
                    {t.settings.includeSignals}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {locale === "fr"
                      ? "Signaux (« sans site », « prêt outreach »…)."
                      : "Signals like “no website” or “outreach ready”."}
                  </span>
                </span>
              </label>
            </div>
          </SettingsSection>

          <SettingsSection
            id="appearance"
            icon={Palette}
            title={t.settings.appearance}
            description={t.settings.appearanceDesc ?? t.settings.appearanceSub}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="th">{t.settings.theme}</Label>
                <Select
                  id="th"
                  value={draft.theme}
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
                <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2">
                  <LanguageSwitcher variant="outline" />
                  <span className="text-xs text-muted">
                    {t.settings.languageSub}
                  </span>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            id="history"
            icon={History}
            title={t.settings.historyTitle ?? "Lead history"}
            description={t.settings.historyDesc}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent-cyan">
                  <History size={14} />
                </span>
                <div>
                  <div className="font-mono text-[13px] text-foreground">
                    {formatNumber(seenTotal)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {seenTotal === 1
                      ? t.settings.seenOne ?? "previously seen lead"
                      : t.settings.seenMany ?? "previously seen leads"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw size={12} />}
                onClick={handleResetSeen}
                disabled={seenTotal === 0}
              >
                {t.settings.historyClearCta ?? "Clear history"}
              </Button>
            </div>
            {toast ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-success">
                <Check size={12} /> {toast}
              </p>
            ) : null}
          </SettingsSection>

          <SettingsSection
            id="developer"
            icon={Code2}
            title={t.settings.developerTitle ?? "API & developer tools"}
            description={t.settings.developerDesc}
            aside={
              limits ? (
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={canUseApi ? "success" : "outline"}>
                    {canUseApi
                      ? locale === "fr"
                        ? "Inclus"
                        : "Included"
                      : locale === "fr"
                        ? "Non inclus"
                        : "Not included"}
                  </Badge>
                  {canUseApi ? (
                    <Badge tone="outline">
                      <Zap size={10} className="text-accent-cyan" />
                      {isUnlimited(limits.apiCredits)
                        ? "∞"
                        : formatNumber(limits.apiCredits)}{" "}
                      {locale === "fr" ? "crédits/mois" : "credits/mo"}
                    </Badge>
                  ) : null}
                </div>
              ) : null
            }
          >
            <div className="flex flex-wrap gap-2">
              <LinkButton
                href="/app/api-keys"
                size="sm"
                leftIcon={<KeyRound size={12} />}
                variant={canUseApi ? "primary" : "outline"}
              >
                {t.settings.developerOpenApi ?? "Manage API keys"}
              </LinkButton>
              <LinkButton
                href="/developers"
                size="sm"
                variant="outline"
                leftIcon={<Code2 size={12} />}
              >
                {t.settings.developerOpenDocs ?? "API documentation"}
              </LinkButton>
              {!canUseApi ? (
                <LinkButton
                  href="/pricing#api"
                  size="sm"
                  variant="ghost"
                  leftIcon={<Zap size={12} />}
                >
                  {t.apiKeys?.upgradeCtaCompare ?? "Compare API plans"}
                </LinkButton>
              ) : null}
            </div>
          </SettingsSection>

          <SettingsSection
            id="account"
            icon={KeyRound}
            title={t.settings.accountTitle ?? "Account"}
            description={t.settings.accountDesc}
          >
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {t.settings.email}
                  </div>
                  <div
                    className="mt-0.5 truncate text-sm font-medium text-foreground"
                    title={email ?? ""}
                  >
                    {email ?? (locale === "fr" ? "Session démo" : "Demo session")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {plan ? (
                    <Badge tone="accent">{planLabel(plan, t)}</Badge>
                  ) : (
                    <Badge tone="outline">{t.usage.demo}</Badge>
                  )}
                </div>
              </div>
              {email ? (
                <Link
                  href="/signout"
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-strong transition-colors hover:border-danger/40 hover:text-danger"
                >
                  <LogOut size={12} />
                  {t.settings.accountSignOut ?? t.auth?.signOut ?? "Sign out"}
                </Link>
              ) : null}
            </div>
          </SettingsSection>

          <SettingsSection
            id="danger"
            icon={AlertTriangle}
            tone="danger"
            title={t.settings.dangerTitle ?? "Danger zone"}
            description={t.settings.dangerDesc}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/[0.04] px-4 py-3">
              <div className="min-w-0 text-sm">
                <div className="font-medium text-foreground">
                  {t.settings.historyTitle ?? "Lead history"}
                </div>
                <p className="mt-0.5 text-xs text-muted-strong">
                  {t.settings.dangerAck ?? "This cannot be undone."}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={12} />}
                onClick={handleResetSeen}
                disabled={seenTotal === 0}
              >
                {t.settings.historyClearCta ?? "Clear history"}
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
