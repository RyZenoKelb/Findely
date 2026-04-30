"use client";

import { Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  createApiKey,
  revokeApiKey,
  type ApiKeyRow,
} from "@/lib/actions/apiKeys";
import { useI18n } from "@/lib/i18n";

interface ApiKeysPanelProps {
  initialRows: ApiKeyRow[];
  canUseApi: boolean;
}

export function ApiKeysPanel({ initialRows, canUseApi }: ApiKeysPanelProps) {
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

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] text-accent-cyan">
          {a?.title ?? "API keys"}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {a?.subtitle ?? ""}
        </h1>
      </header>

      {!canUseApi ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          <span>{a?.upgradeRequired ?? "Upgrade required."}</span>
          <LinkButton href="/pricing" size="sm" variant="outline">
            {t.nav.pricing}
          </LinkButton>
        </div>
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
