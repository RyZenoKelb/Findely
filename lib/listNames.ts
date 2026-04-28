import type { Locale } from "./i18n";

const TRANSLATIONS: Record<string, { fr: string; en: string }> = {
  "Web agency prospects": {
    en: "Web agency prospects",
    fr: "Prospects agence web",
  },
  "SEO opportunities": { en: "SEO opportunities", fr: "Opportunités SEO" },
  "Local businesses": { en: "Local businesses", fr: "Entreprises locales" },
  "To contact": { en: "To contact", fr: "À contacter" },
  Contacted: { en: "Contacted", fr: "Contactés" },
  Interested: { en: "Interested", fr: "Intéressés" },
};

/**
 * Translate the seed-list names without mutating stored data.
 * User-created lists keep their original name.
 */
export function displayListName(name: string, locale: Locale): string {
  const t = TRANSLATIONS[name];
  if (!t) return name;
  return locale === "fr" ? t.fr : t.en;
}
