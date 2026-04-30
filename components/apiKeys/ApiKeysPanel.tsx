"use client";

import {
  AlertTriangle,
  Check,
  Code2,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  createApiKey,
  revokeApiKey,
  type ApiKeyRow,
} from "@/lib/actions/apiKeys";
import { useI18n } from "@/lib/i18n";
import { getPlanLimits, isUnlimited, type Plan } from "@/lib/plans";
import { formatNumber } from "@/lib/utils";

interface ApiKeysPanelProps {
  initialRows: ApiKeyRow[];
  canUseApi: boolean;
  plan?: Plan | null;
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

export function ApiKeysPanel({
  initialRows,
  canUseApi,
  plan = null,
}: ApiKeysPanelProps) {
  const { t, locale } = useI18n();
  const a = t.apiKeys;
  const [rows, setRows] = React.useState<ApiKeyRow[]>(initialRows);
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [justCreated, setJustCreated] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canUseApi) {
      setError(a?.upgradeRequired ?? "Upgrade required.");
      return;
    }
    setCreating(true);
    try {
      const res = await createApiKey(name);
      if (!res.ok) {
        setError(res.error);
      } else {
        setRows((prev) => [res.row, ...prev]);
        setJustCreated(res.fullKey);
        setName("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function handleCopy() {
    if (!justCreated) return;
    try {
      navigator.clipboard.writeText(justCreated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — user can still select manually
    }
  }

  function handleRevoke(id: string) {
    if (!window.confirm(a?.revokeConfirm ?? "Revoke this key?")) return;
    startTransition(async () => {
      const res = await revokeApiKey(id);
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, revoked_at: new Date().toISOString() } : r
          )
        );
      } else {
        setError(res.error);
      }
    });
  }

  function formatDate(iso: string | null): string {
    if (!iso) return a?.never ?? "Never";
    try {
      return new Date(iso).toLocaleDateString(
        locale === "fr" ? "fr-FR" : "en-US",
        { day: "numeric", month: "short", year: "numeric" }
      );
    } catch {
      return iso;
    }
  }

  const limits = plan ? getPlanLimits(plan) : null;
  const apiCreditsDisplay =
    limits && limits.apiCredits > 0
      ? isUnlimited(limits.apiCredits)
        ? "∞"
        : formatNumber(limits.apiCredits)
      : "0";

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-cyan">
          <KeyRound size={12} />
          {a?.title ?? "API keys"}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {a?.subtitle ?? ""}
        </h1>
        {a?.intro ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-strong">
            {a.intro}
          </p>
        ) : null}
      </header>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles size={14} className="text-accent-cyan" />
            {a?.howItWorksTitle ??
              (locale === "fr" ? "Comment ça marche" : "How API keys work")}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-strong">
            {(a?.howItWorksBullets ?? []).map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check
                  size={13}
                  className="mt-0.5 flex-none text-accent-cyan"
                />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton
              href="/developers"
              size="sm"
              variant="outline"
              leftIcon={<Code2 size={12} />}
            >
              {a?.viewDocsCta ??
                (locale === "fr"
                  ? "Voir la documentation API"
                  : "View API documentation")}
            </LinkButton>
            <LinkButton
              href="/pricing#api"
              size="sm"
              variant="ghost"
              leftIcon={<Zap size={12} />}
            >
              {a?.upgradeCtaCompare ??
                (locale === "fr"
                  ? "Comparer les offres API"
                  : "Compare API plans")}
            </LinkButton>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-gradient-to-br from-accent/[0.08] to-transparent p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap size={14} className="text-accent-cyan" />
            {a?.currentUsageTitle ??
              (locale === "fr"
                ? "Votre utilisation API actuelle"
                : "Your current API usage")}
          </div>
          {plan ? (
            <div className="mt-3 flex items-center gap-2">
              <Badge tone={canUseApi ? "accent" : "outline"}>
                {planLabel(plan, t)}
              </Badge>
              <Badge tone={canUseApi ? "success" : "outline"}>
                {canUseApi
                  ? locale === "fr"
                    ? "API incluse"
                    : "API included"
                  : locale === "fr"
                    ? "API non incluse"
                    : "API not included"}
              </Badge>
            </div>
          ) : null}
          <div className="mt-3 font-mono text-[13px] text-muted-strong">
            {apiCreditsDisplay}{" "}
            {locale === "fr" ? "crédits API / mois" : "API credits / month"}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-strong">
            {a?.currentUsageBody ??
              (locale === "fr"
                ? "Suivez les crédits API consommés ce cycle sur la page d'utilisation."
                : "Track API credits consumed this cycle on the usage page.")}
          </p>
          <div className="mt-3">
            <LinkButton href="/app/usage" size="sm" variant="outline">
              {t.sidebar.viewUsage}
            </LinkButton>
          </div>
        </div>
      </section>

      {!canUseApi ? (
        <section className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle size={14} />
            {a?.upgradeRequired ?? "Upgrade required."}
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {a?.planGatingTitle ??
              (locale === "fr"
                ? "Quels plans incluent l'accès API ?"
                : "Which plans include API access?")}
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-strong">
            {a?.planGatingBody ??
              (locale === "fr"
                ? "Agency inclut un accès API léger. API Starter et API Pro sont des plans API dédiés. API Scale est personnalisé."
                : "Agency ships with light API access. API Starter and API Pro are dedicated API plans. API Scale is custom.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/pricing#api" size="sm">
              {a?.upgradeCtaCompare ??
                (locale === "fr"
                  ? "Comparer les offres API"
                  : "Compare API plans")}
            </LinkButton>
            <LinkButton href="/pricing" size="sm" variant="outline">
              {a?.upgradeCtaPricing ?? t.nav.pricing}
            </LinkButton>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Plus size={14} className="text-accent-cyan" />
            {a?.createTitle ?? "Create a new key"}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="name">{a?.nameLabel ?? "Name"}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={a?.namePlaceholder ?? ""}
                maxLength={80}
                required
              />
            </div>
            <Button type="submit" size="md" disabled={creating || !name.trim()}>
              {creating ? a?.creating ?? "…" : a?.createCta ?? "Create"}
            </Button>
          </div>
          {error ? (
            <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          ) : null}
        </form>
      )}

      {justCreated ? (
        <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/[0.12] to-transparent p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound size={14} className="text-accent-cyan" />
            {a?.oneTimeWarning ?? "Copy this now."}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-foreground">
              {justCreated}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? a?.copied ?? "Copied" : a?.copy ?? "Copy"}
            </Button>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setJustCreated(null)}
            >
              {a?.done ?? "I've saved it"}
            </Button>
          </div>
        </div>
      ) : null}

      {canUseApi ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4 text-sm">
          <ShieldCheck size={14} className="mt-0.5 flex-none text-accent-cyan" />
          <div>
            <div className="font-semibold text-foreground">
              {a?.warningTitle ??
                (locale === "fr" ? "Protégez vos clés" : "Keep your keys safe")}
            </div>
            <p className="mt-1 text-muted-strong">
              {a?.oneTimeWarning ??
                (locale === "fr"
                  ? "Cette clé ne sera affichée qu'une seule fois."
                  : "Your key is shown only once.")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {a?.existingKeysTitle ??
            (locale === "fr" ? "Clés existantes" : "Existing keys")}
        </h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
          {rows.length}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        {rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-strong">
            {a?.noKeys ?? "No API keys yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.15em] text-muted">
                  <th className="px-4 py-3">{a?.colName ?? "Name"}</th>
                  <th className="px-4 py-3">{a?.colPrefix ?? "Prefix"}</th>
                  <th className="px-4 py-3">{a?.colCreated ?? "Created"}</th>
                  <th className="px-4 py-3">{a?.colLastUsed ?? "Last used"}</th>
                  <th className="px-4 py-3">{a?.colStatus ?? "Status"}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const revoked = Boolean(row.revoked_at);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-strong">
                        {row.key_prefix}…
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatDate(row.last_used_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            revoked
                              ? "inline-flex rounded-full bg-muted/20 px-2 py-0.5 text-[11px] text-muted"
                              : "inline-flex rounded-full bg-success/15 px-2 py-0.5 text-[11px] text-success"
                          }
                        >
                          {revoked
                            ? a?.revoked ?? "Revoked"
                            : a?.active ?? "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!revoked ? (
                          <button
                            type="button"
                            onClick={() => handleRevoke(row.id)}
                            disabled={pending}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-strong transition-colors hover:border-danger/40 hover:text-danger"
                          >
                            <Trash2 size={11} />
                            {a?.revoke ?? "Revoke"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
