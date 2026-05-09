"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  History,
  Sparkles,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  CREDIT_COSTS,
  CREDIT_PACKS,
  TRANSACTION_LABELS,
  type CreditPack,
  type WalletTransaction,
} from "@/lib/wallet";
import {
  getBalance,
  getTransactions,
  simulatePurchase,
} from "@/lib/walletService";

export default function WalletView() {
  const { locale } = useI18n();
  const [credits, setCredits] = React.useState(() =>
    typeof window !== "undefined" ? getBalance().credits : 0
  );
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>(
    () => (typeof window !== "undefined" ? getTransactions() : [])
  );
  const [purchaseToast, setPurchaseToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!purchaseToast) return;
    const t = setTimeout(() => setPurchaseToast(null), 2500);
    return () => clearTimeout(t);
  }, [purchaseToast]);

  function handlePurchase(pack: CreditPack) {
    const result = simulatePurchase(pack.id);
    if (result.success) {
      setCredits(result.balance.credits);
      setTransactions(getTransactions());
      setPurchaseToast(
        locale === "fr"
          ? `+${pack.credits} crédits ajoutés !`
          : `+${pack.credits} credits added!`
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-cyan">
          <CreditCard size={11} />
          Wallet
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {locale === "fr" ? "Crédits & Consommation" : "Credits & Usage"}
        </h1>
        <p className="mt-1 text-sm text-muted-strong">
          {locale === "fr"
            ? "Gérez vos crédits et rechargez votre solde."
            : "Manage your credits and top up your balance."}
        </p>
      </div>

      {/* Simulation banner */}
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
        {locale === "fr"
          ? "Mode simulation — les crédits réels seront activés avec Stripe/Supabase. Les boutons ci-dessous simulent un achat sans paiement réel."
          : "Simulation mode — real credits will be enabled with Stripe/Supabase. Buttons below simulate a purchase without real payment."}
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-accent/[0.12] via-white/[0.02] to-transparent p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-strong">
              {locale === "fr" ? "Solde actuel" : "Current balance"}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {credits.toLocaleString()}
              </span>
              <span className="text-sm text-muted-strong">
                {locale === "fr" ? "crédits" : "credits"}
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/15">
            <Zap size={20} className="text-accent-cyan" />
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(CREDIT_COSTS).map(([key, cost]) => (
            <div
              key={key}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
            >
              <div className="text-[10px] uppercase tracking-wide text-muted">
                {key === "search"
                  ? locale === "fr"
                    ? "Recherche"
                    : "Search"
                  : key === "leadFound"
                    ? "Lead"
                    : key === "export"
                      ? "Export"
                      : locale === "fr"
                        ? "Enrichissement"
                        : "Enrichment"}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">
                {cost === 0 ? (
                  <span className="text-success">
                    {locale === "fr" ? "Gratuit" : "Free"}
                  </span>
                ) : (
                  `${cost} cr.`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
          <Sparkles size={12} />
          {locale === "fr" ? "Recharger" : "Top Up"}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "relative rounded-xl border p-4 transition-colors",
                pack.popular
                  ? "border-accent/40 bg-accent/[0.06]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
              )}
            >
              {pack.popular ? (
                <div className="absolute -top-2.5 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                  {locale === "fr" ? "Populaire" : "Popular"}
                </div>
              ) : null}
              <div className="text-sm font-semibold text-foreground">
                {pack.name}
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {pack.credits.toLocaleString()}
              </div>
              <div className="text-xs text-muted">
                {locale === "fr" ? "crédits" : "credits"}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-strong">
                  {pack.price}€
                </span>
                <Button
                  size="sm"
                  variant={pack.popular ? "primary" : "outline"}
                  onClick={() => handlePurchase(pack)}
                >
                  {locale === "fr" ? "Simuler l'achat" : "Simulate"}
                </Button>
              </div>
              <div className="mt-1 text-[10px] text-muted">
                {((pack.price / pack.credits) * 100).toFixed(1)}c / credit
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">
          {locale === "fr"
            ? "Mode simulation — le paiement Stripe sera intégré prochainement."
            : "Simulation mode — Stripe payment integration coming soon."}
        </p>
      </div>

      {/* Transaction History */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
          <History size={12} />
          {locale === "fr" ? "Historique" : "History"}
        </div>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-muted">
            {locale === "fr"
              ? "Aucune transaction pour le moment."
              : "No transactions yet."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">
                    {locale === "fr" ? "Crédits" : "Credits"}
                  </th>
                  <th className="px-4 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/[0.06] last:border-0"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-md",
                            tx.amount > 0
                              ? "bg-success/15 text-success"
                              : "bg-danger/15 text-danger"
                          )}
                        >
                          {tx.amount > 0 ? (
                            <ArrowDownLeft size={11} />
                          ) : (
                            <ArrowUpRight size={11} />
                          )}
                        </span>
                        <Badge tone={tx.amount > 0 ? "accent" : "outline"}>
                          {TRANSACTION_LABELS[tx.type]?.[locale] ?? tx.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-strong">
                      {tx.description}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-mono text-xs font-medium",
                        tx.amount > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted">
                      {formatDate(tx.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {purchaseToast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-success/90 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {purchaseToast}
        </div>
      ) : null}
    </div>
  );
}

function formatDate(iso: string, locale: "en" | "fr"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
