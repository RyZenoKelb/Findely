"use client";

import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { locale } = useI18n();

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {locale === "fr" ? "Conditions d'utilisation" : "Terms of Service"}
        </h1>
        <p className="mt-4 text-sm text-muted-strong">
          {locale === "fr"
            ? "Dernière mise à jour : mai 2026"
            : "Last updated: May 2026"}
        </p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-strong">
          <p>
            {locale === "fr"
              ? "En utilisant Findely, vous acceptez les présentes conditions. Findely est un outil de recherche de leads à partir de sources publiques."
              : "By using Findely, you agree to these terms. Findely is a lead research tool that aggregates data from public sources."}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "fr" ? "Utilisation acceptable" : "Acceptable use"}
          </h2>
          <p>
            {locale === "fr"
              ? "Vous vous engagez à utiliser Findely uniquement à des fins de prospection commerciale légitimes, dans le respect des réglementations locales (RGPD, etc.)."
              : "You agree to use Findely only for legitimate business prospecting purposes, in compliance with local regulations (GDPR, etc.)."}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "fr" ? "Limitation de responsabilité" : "Limitation of liability"}
          </h2>
          <p>
            {locale === "fr"
              ? "Findely fournit les données en l'état. Nous ne garantissons pas l'exactitude des informations récupérées depuis les sources tierces."
              : "Findely provides data as-is. We do not guarantee the accuracy of information retrieved from third-party sources."}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
