"use client";

import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

export default function CookiesPage() {
  const { locale } = useI18n();

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {locale === "fr" ? "Politique de cookies" : "Cookie Policy"}
        </h1>
        <p className="mt-4 text-sm text-muted-strong">
          {locale === "fr"
            ? "Dernière mise à jour : mai 2026"
            : "Last updated: May 2026"}
        </p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-strong">
          <p>
            {locale === "fr"
              ? "Findely utilise des cookies strictement nécessaires au fonctionnement de l'application (session d'authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé."
              : "Findely uses only strictly necessary cookies for application functionality (authentication session). No advertising or third-party tracking cookies are used."}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "fr" ? "Cookies utilisés" : "Cookies used"}
          </h2>
          <div className="overflow-hidden rounded-lg border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2">{locale === "fr" ? "Nom" : "Name"}</th>
                  <th className="px-4 py-2">{locale === "fr" ? "But" : "Purpose"}</th>
                  <th className="px-4 py-2">{locale === "fr" ? "Durée" : "Duration"}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2 font-mono text-xs text-foreground">sb-*-auth-token</td>
                  <td className="px-4 py-2">{locale === "fr" ? "Session d'authentification" : "Authentication session"}</td>
                  <td className="px-4 py-2">{locale === "fr" ? "7 jours" : "7 days"}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs text-foreground">locale</td>
                  <td className="px-4 py-2">{locale === "fr" ? "Préférence de langue" : "Language preference"}</td>
                  <td className="px-4 py-2">{locale === "fr" ? "1 an" : "1 year"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-xs text-muted">
            {locale === "fr"
              ? "Cette page est une version bêta et peut être mise à jour."
              : "This page is a basic beta version and may be updated."}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
