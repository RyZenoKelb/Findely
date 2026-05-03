"use client";

import { PublicShell } from "@/components/landing/PublicShell";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { locale } = useI18n();

  return (
    <PublicShell>
      <section className="relative mx-auto max-w-3xl px-5 py-24 lg:px-8 lg:py-32">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
        </h1>
        <p className="mt-4 text-sm text-muted-strong">
          {locale === "fr"
            ? "Dernière mise à jour : mai 2026"
            : "Last updated: May 2026"}
        </p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-strong">
          <p>
            {locale === "fr"
              ? "Findely respecte votre vie privée. Cette page décrit les données que nous collectons, pourquoi nous les collectons, et comment nous les protégeons."
              : "Findely respects your privacy. This page describes what data we collect, why we collect it, and how we protect it."}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "fr" ? "Données collectées" : "Data collected"}
          </h2>
          <p>
            {locale === "fr"
              ? "Nous collectons uniquement votre adresse email lors de l'inscription et les données de recherche que vous effectuez (type d'entreprise, localisation). Aucune donnée n'est vendue à des tiers."
              : "We only collect your email address at sign-up and the search data you perform (business type, location). No data is sold to third parties."}
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "fr" ? "Contact" : "Contact"}
          </h2>
          <p>
            {locale === "fr"
              ? "Pour toute question, contactez-nous à privacy@findely.app."
              : "For any questions, reach us at privacy@findely.app."}
          </p>
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
