import type { LeadObjective, LeadSignal, LeadStatus } from "./leadTypes";
import type { Locale } from "./i18n";

/* Objectives */

const OBJ_EN: Record<LeadObjective, string> = {
  general: "General lead discovery",
  no_website: "Businesses without a website",
  with_website: "Businesses with a website",
  with_phone: "Businesses with a phone number",
  local: "Local businesses",
  seo_outreach: "SEO opportunities",
  marketing_outreach: "Marketing outreach",
  b2b_clients: "B2B prospects",
};

const OBJ_FR: Record<LeadObjective, string> = {
  general: "Découverte générale de leads",
  no_website: "Entreprises sans site web",
  with_website: "Entreprises avec site web",
  with_phone: "Entreprises avec téléphone",
  local: "Entreprises locales",
  seo_outreach: "Opportunités SEO",
  marketing_outreach: "Prospection marketing",
  b2b_clients: "Prospects B2B",
};

export function objectiveLabel(o: LeadObjective, locale: Locale): string {
  return (locale === "fr" ? OBJ_FR : OBJ_EN)[o];
}

export function objectiveEntries(
  locale: Locale
): { value: LeadObjective; label: string }[] {
  const dict = locale === "fr" ? OBJ_FR : OBJ_EN;
  return (Object.keys(dict) as LeadObjective[]).map((v) => ({
    value: v,
    label: dict[v],
  }));
}

/* Signals */

const SIG_EN: Record<LeadSignal, string> = {
  no_website: "No website",
  has_website: "Has website",
  has_phone: "Has phone",
  missing_phone: "Missing phone",
  has_address: "Has address",
  missing_contact_info: "Missing contact info",
  high_opportunity: "High opportunity",
  local_business: "Local business",
  needs_online_presence: "Needs online presence",
  outreach_ready: "Outreach ready",
};

const SIG_FR: Record<LeadSignal, string> = {
  no_website: "Sans site web",
  has_website: "Avec site web",
  has_phone: "Avec téléphone",
  missing_phone: "Téléphone manquant",
  has_address: "Avec adresse",
  missing_contact_info: "Contact incomplet",
  high_opportunity: "Forte opportunité",
  local_business: "Entreprise locale",
  needs_online_presence: "Présence web à faire",
  outreach_ready: "Prêt à contacter",
};

export function signalLabel(s: LeadSignal, locale: Locale): string {
  return (locale === "fr" ? SIG_FR : SIG_EN)[s];
}

/* Lead statuses */

const STATUS_EN: Record<LeadStatus, string> = {
  new: "New",
  saved: "Saved",
  contacted: "Contacted",
  interested: "Interested",
  ignored: "Ignored",
};

const STATUS_FR: Record<LeadStatus, string> = {
  new: "Nouveau",
  saved: "Enregistré",
  contacted: "Contacté",
  interested: "Intéressé",
  ignored: "Ignoré",
};

export function statusLabel(s: LeadStatus, locale: Locale): string {
  return (locale === "fr" ? STATUS_FR : STATUS_EN)[s];
}

/* Sources */

export interface LocalizedSource {
  name: string;
  description: string;
  badge?: string;
}

export function localizedSource(
  id: string,
  locale: Locale
): LocalizedSource | null {
  if (locale === "fr") {
    switch (id) {
      case "google_maps":
        return {
          name: "Google Places",
          description:
            "Données d’entreprises issues de Google Places : adresse, téléphone, site web, note et lien Maps.",
          badge: "Données réelles",
        };
      case "google_search":
        return {
          name: "Recherche Google",
          description:
            "Résultats de recherche organiques pour votre niche et votre zone.",
          badge: "Bientôt",
        };
      case "directory":
        return {
          name: "Annuaires professionnels",
          description:
            "Pages Jaunes, annuaires locaux et annuaires sectoriels.",
          badge: "Bientôt",
        };
      case "mock":
        return {
          name: "Données de démo",
          description:
            "Données d’exemple réalistes, utiles hors ligne et pour tester l’interface.",
          badge: "Démo",
        };
    }
  } else {
    switch (id) {
      case "google_maps":
        return {
          name: "Google Places",
          description:
            "Business data from Google Places: address, phone, website, rating, and Maps link.",
          badge: "Real data",
        };
      case "google_search":
        return {
          name: "Google Search",
          description: "Organic search results for your niche and location.",
          badge: "Soon",
        };
      case "directory":
        return {
          name: "Business directories",
          description:
            "Yellow Pages, local directories, and industry directories.",
          badge: "Soon",
        };
      case "mock":
        return {
          name: "Demo data",
          description:
            "Realistic sample data — useful offline and for trying the UI.",
          badge: "Demo",
        };
    }
  }
  return null;
}

/* Source status */

export function sourceStatusLabel(
  status: "available" | "missing_key" | "disabled_config" | "placeholder",
  locale: Locale
): { label: string; tone: "success" | "warning" | "danger" | "muted" } {
  if (locale === "fr") {
    switch (status) {
      case "available":
        return { label: "Disponible", tone: "success" };
      case "missing_key":
      case "disabled_config":
        return { label: "Source indisponible pour le moment", tone: "warning" };
      case "placeholder":
        return { label: "Bientôt", tone: "muted" };
    }
  }
  switch (status) {
    case "available":
      return { label: "Available", tone: "success" };
    case "missing_key":
    case "disabled_config":
      return { label: "Source temporarily unavailable", tone: "warning" };
    case "placeholder":
      return { label: "Soon", tone: "muted" };
  }
}

/* Deterministic outreach angle */

export function outreachAngleFor(
  lead: {
    website?: string | null;
    phone?: string | null;
    address?: string | null;
    score: number;
  },
  locale: Locale
): string {
  const parts: string[] = [];
  if (locale === "fr") {
    if (!lead.website) {
      parts.push(
        "Cette entreprise ne semble pas avoir de site web, ce qui en fait une opportunité intéressante pour une agence web."
      );
    } else {
      parts.push(
        "Cette entreprise possède déjà un site web, mais elle peut rester pertinente pour une offre SEO, publicité, refonte ou marketing digital."
      );
    }
    if (lead.phone && lead.address) {
      parts.push(
        "Ce lead contient assez d’informations de contact pour une prise de contact directe."
      );
    } else if (lead.phone) {
      parts.push(
        "Un numéro de téléphone est disponible — un appel à froid est envisageable."
      );
    } else if (lead.address) {
      parts.push(
        "Une adresse est connue — la prise de contact physique est possible."
      );
    } else {
      parts.push(
        "Les informations de contact sont limitées — envisagez un enrichissement LinkedIn."
      );
    }
    if (lead.score >= 85)
      parts.push("C’est un lead prioritaire — à contacter en premier.");
    else if (lead.score < 50)
      parts.push(
        "Le signal est faible — envisagez d’enrichir avant de prospecter."
      );
    return parts.join(" ");
  }
  if (!lead.website) {
    parts.push(
      "This business has no website, making it a strong opportunity for a web agency or someone offering online presence services."
    );
  } else {
    parts.push(
      "This business already has a website, which still makes it useful for SEO, ads, redesign, or marketing outreach."
    );
  }
  if (lead.phone && lead.address) {
    parts.push(
      "It has enough contact data (phone and address) for direct outreach — a cold call or in-person visit are both viable."
    );
  } else if (lead.phone) {
    parts.push("A phone number is available, so cold calling is viable.");
  } else if (lead.address) {
    parts.push(
      "An address is known, so door-to-door or physical mail could work."
    );
  } else {
    parts.push(
      "Contact data is limited — consider enriching via LinkedIn or a business registry before outreach."
    );
  }
  if (lead.score >= 85) {
    parts.push("This is a high-priority lead — reach out first.");
  } else if (lead.score < 50) {
    parts.push(
      "Signal strength is low — likely worth skipping or enriching first."
    );
  }
  return parts.join(" ");
}
