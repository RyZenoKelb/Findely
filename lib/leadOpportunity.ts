import type { Locale } from "./i18n";
import type { Lead, LeadObjective } from "./leadTypes";

/* Priority */

export type PriorityLevel = "high" | "medium" | "low";

export function getPriorityLevel(lead: Lead): PriorityLevel {
  if (lead.score >= 80) return "high";
  if (lead.score >= 55) return "medium";
  return "low";
}

export function getPriorityLabel(
  lead: Lead,
  locale: Locale
): { level: PriorityLevel; label: string } {
  const level = getPriorityLevel(lead);
  if (locale === "fr") {
    return {
      level,
      label:
        level === "high"
          ? "Priorité forte"
          : level === "medium"
            ? "Priorité moyenne"
            : "Priorité faible",
    };
  }
  return {
    level,
    label:
      level === "high"
        ? "High priority"
        : level === "medium"
          ? "Medium priority"
          : "Low priority",
  };
}

/* Data quality */

export type DataQuality = "excellent" | "good" | "partial" | "needs_review";

export function getDataQualityLevel(lead: Lead): DataQuality {
  const has = {
    phone: Boolean(lead.phone),
    website: Boolean(lead.website),
    address: Boolean(lead.address),
    rating: typeof lead.rating === "number" && lead.rating > 0,
    ratingCount:
      typeof lead.ratingCount === "number" && lead.ratingCount > 0,
    category: Boolean(lead.category),
  };
  const complete = [has.phone, has.website, has.address].filter(Boolean).length;
  const enriched = [has.rating, has.ratingCount, has.category].filter(
    Boolean
  ).length;
  if (complete === 3 && enriched >= 2) return "excellent";
  if (complete >= 2 && enriched >= 1) return "good";
  if (complete >= 1) return "partial";
  return "needs_review";
}

export function getDataQuality(
  lead: Lead,
  locale: Locale
): { level: DataQuality; label: string } {
  const level = getDataQualityLevel(lead);
  const map: Record<DataQuality, { en: string; fr: string }> = {
    excellent: { en: "Excellent data", fr: "Données excellentes" },
    good: { en: "Good data", fr: "Données correctes" },
    partial: { en: "Partial data", fr: "Données partielles" },
    needs_review: { en: "Needs verification", fr: "À vérifier" },
  };
  return { level, label: map[level][locale] };
}

/* Contact readiness */

export type ContactReadiness = "ready" | "needs_verify" | "missing";

export function getContactReadinessLevel(lead: Lead): ContactReadiness {
  if (lead.phone && (lead.address || lead.website)) return "ready";
  if (lead.phone || lead.website) return "needs_verify";
  return "missing";
}

export function getContactReadiness(
  lead: Lead,
  locale: Locale
): { level: ContactReadiness; label: string } {
  const level = getContactReadinessLevel(lead);
  const map: Record<ContactReadiness, { en: string; fr: string }> = {
    ready: { en: "Ready to contact", fr: "Prêt à contacter" },
    needs_verify: { en: "Needs verification", fr: "À vérifier" },
    missing: { en: "Missing contact info", fr: "Contact incomplet" },
  };
  return { level, label: map[level][locale] };
}

/* Opportunity type */

export type OpportunityType =
  | "web_agency"
  | "seo_redesign"
  | "marketing"
  | "local_outreach"
  | "b2b_sales"
  | "general_prospecting"
  | "needs_enrichment";

export function getOpportunityType(
  lead: Lead,
  objective: LeadObjective
): OpportunityType {
  const quality = getDataQualityLevel(lead);
  if (quality === "needs_review") return "needs_enrichment";

  if (objective === "no_website") {
    return !lead.website ? "web_agency" : "general_prospecting";
  }
  if (objective === "seo_outreach") return "seo_redesign";
  if (objective === "marketing_outreach") return "marketing";
  if (objective === "local") return "local_outreach";
  if (objective === "b2b_clients") return "b2b_sales";
  if (objective === "with_website") return "seo_redesign";
  if (objective === "with_phone")
    return lead.phone ? "general_prospecting" : "needs_enrichment";

  if (!lead.website) return "web_agency";
  if ((lead.ratingCount ?? 0) >= 100) return "marketing";
  return "general_prospecting";
}

export function opportunityTypeLabel(
  type: OpportunityType,
  locale: Locale
): string {
  const map: Record<OpportunityType, { en: string; fr: string }> = {
    web_agency: { en: "Web agency angle", fr: "Angle agence web" },
    seo_redesign: { en: "SEO / redesign", fr: "SEO / refonte" },
    marketing: { en: "Marketing & ads", fr: "Marketing & publicité" },
    local_outreach: { en: "Local outreach", fr: "Prospection locale" },
    b2b_sales: { en: "B2B sales", fr: "Vente B2B" },
    general_prospecting: {
      en: "General prospecting",
      fr: "Prospection générale",
    },
    needs_enrichment: { en: "Needs enrichment", fr: "À enrichir" },
  };
  return map[type][locale];
}

/* Opportunity reason — deterministic */

export function getOpportunityReason(
  lead: Lead,
  objective: LeadObjective,
  locale: Locale
): string {
  const quality = getDataQualityLevel(lead);
  if (quality === "needs_review") {
    return locale === "fr"
      ? "Ce lead manque d’informations de contact. À vérifier avant toute prospection."
      : "This lead is missing contact information. Verify before outreach.";
  }

  const type = getOpportunityType(lead, objective);

  const FR: Record<OpportunityType, string> = {
    web_agency:
      "Cette entreprise ne semble pas avoir de site web, mais possède des informations de contact. C’est une opportunité intéressante pour proposer une création de site.",
    seo_redesign:
      "Cette entreprise possède déjà un site web. Elle peut être intéressante pour une offre SEO, refonte ou amélioration de visibilité locale.",
    marketing:
      "Cette entreprise dispose d’une présence locale exploitable. Elle peut être pertinente pour une offre publicitaire, contenu ou acquisition locale.",
    local_outreach:
      "Ce commerce local dispose d’adresse et de téléphone : approche en porte-à-porte ou appel à froid envisageable.",
    b2b_sales:
      "Ce compte présente un profil B2B exploitable avec des points de contact suffisants pour un démarchage commercial.",
    general_prospecting:
      "Ce lead dispose de données de contact exploitables et peut être ajouté à une liste de prospection générale.",
    needs_enrichment:
      "Les signaux sont faibles. Enrichissez via LinkedIn ou un annuaire avant toute approche.",
  };
  const EN: Record<OpportunityType, string> = {
    web_agency:
      "This business appears to have no website but has contact information. It is a strong opportunity for a website offer.",
    seo_redesign:
      "This business already has a website. It may be relevant for SEO, redesign, or local visibility services.",
    marketing:
      "This business has usable local presence. It may be relevant for ads, content, or local acquisition services.",
    local_outreach:
      "A local business with address and phone — door-to-door or cold calling is viable.",
    b2b_sales:
      "A B2B-shaped account with enough touchpoints for commercial outreach.",
    general_prospecting:
      "This lead has usable contact data and can be added to a general outreach list.",
    needs_enrichment:
      "Signals are weak. Enrich via LinkedIn or a registry before outreach.",
  };
  return (locale === "fr" ? FR : EN)[type];
}

/* Recommended action */

export function getRecommendedAction(
  lead: Lead,
  objective: LeadObjective,
  locale: Locale
): string {
  const readiness = getContactReadinessLevel(lead);
  const type = getOpportunityType(lead, objective);

  if (readiness === "missing") {
    return locale === "fr"
      ? "Enrichir les coordonnées avant de contacter"
      : "Enrich contact info before reaching out";
  }
  if (type === "needs_enrichment") {
    return locale === "fr"
      ? "Qualifier avant contact"
      : "Qualify before outreach";
  }
  if (type === "web_agency") {
    return locale === "fr"
      ? "Appel à froid avec un pitch « création de site »"
      : "Cold-call with a website pitch";
  }
  if (type === "seo_redesign") {
    return locale === "fr"
      ? "Auditer le site et proposer un SEO/refonte"
      : "Audit the site and pitch SEO / redesign";
  }
  if (type === "marketing") {
    return locale === "fr"
      ? "Proposer un audit pub / contenu local"
      : "Pitch an ads / local content audit";
  }
  if (type === "local_outreach") {
    return locale === "fr"
      ? "Appel à froid ou visite rapide"
      : "Cold call or quick in-person visit";
  }
  if (type === "b2b_sales") {
    return locale === "fr"
      ? "Outreach multi-canal (email + LinkedIn)"
      : "Multi-channel outreach (email + LinkedIn)";
  }
  return locale === "fr"
    ? "Ajouter à une séquence d’outreach générale"
    : "Add to a general outreach sequence";
}

/* Source confidence (0–1) */

export function getSourceConfidence(lead: Lead): number {
  const map: Record<string, number> = {
    google_maps: 0.9,
    mock: 0.3,
  };
  return map[lead.source] ?? 0.4;
}
