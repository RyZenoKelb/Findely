import type { Locale } from "./i18n";

export interface Country {
  /** ISO-ish canonical value stored/sent to the API (English name, keeps stack simple). */
  value: string;
  en: string;
  fr: string;
  featured?: boolean;
}

export const COUNTRIES: Country[] = [
  { value: "France", en: "France", fr: "France", featured: true },
  { value: "Israel", en: "Israel", fr: "Israël", featured: true },
  {
    value: "United States",
    en: "United States",
    fr: "États-Unis",
    featured: true,
  },
  {
    value: "United Kingdom",
    en: "United Kingdom",
    fr: "Royaume-Uni",
    featured: true,
  },
  { value: "Canada", en: "Canada", fr: "Canada", featured: true },
  { value: "Belgium", en: "Belgium", fr: "Belgique", featured: true },
  { value: "Switzerland", en: "Switzerland", fr: "Suisse", featured: true },
  { value: "Spain", en: "Spain", fr: "Espagne", featured: true },
  { value: "Italy", en: "Italy", fr: "Italie", featured: true },
  { value: "Germany", en: "Germany", fr: "Allemagne", featured: true },
  { value: "Netherlands", en: "Netherlands", fr: "Pays-Bas", featured: true },
  { value: "Portugal", en: "Portugal", fr: "Portugal", featured: true },
  { value: "Morocco", en: "Morocco", fr: "Maroc", featured: true },
  { value: "Tunisia", en: "Tunisia", fr: "Tunisie", featured: true },
  {
    value: "United Arab Emirates",
    en: "United Arab Emirates",
    fr: "Émirats arabes unis",
    featured: true,
  },
  { value: "Ireland", en: "Ireland", fr: "Irlande" },
  { value: "Luxembourg", en: "Luxembourg", fr: "Luxembourg" },
  { value: "Denmark", en: "Denmark", fr: "Danemark" },
  { value: "Sweden", en: "Sweden", fr: "Suède" },
  { value: "Norway", en: "Norway", fr: "Norvège" },
  { value: "Finland", en: "Finland", fr: "Finlande" },
  { value: "Austria", en: "Austria", fr: "Autriche" },
  { value: "Poland", en: "Poland", fr: "Pologne" },
  { value: "Czech Republic", en: "Czech Republic", fr: "Tchéquie" },
  { value: "Greece", en: "Greece", fr: "Grèce" },
  { value: "Turkey", en: "Turkey", fr: "Turquie" },
  { value: "Romania", en: "Romania", fr: "Roumanie" },
  { value: "Hungary", en: "Hungary", fr: "Hongrie" },
  { value: "Algeria", en: "Algeria", fr: "Algérie" },
  { value: "Egypt", en: "Egypt", fr: "Égypte" },
  { value: "Saudi Arabia", en: "Saudi Arabia", fr: "Arabie saoudite" },
  { value: "Qatar", en: "Qatar", fr: "Qatar" },
  { value: "Kuwait", en: "Kuwait", fr: "Koweït" },
  { value: "Mexico", en: "Mexico", fr: "Mexique" },
  { value: "Brazil", en: "Brazil", fr: "Brésil" },
  { value: "Argentina", en: "Argentina", fr: "Argentine" },
  { value: "Chile", en: "Chile", fr: "Chili" },
  { value: "Colombia", en: "Colombia", fr: "Colombie" },
  { value: "Australia", en: "Australia", fr: "Australie" },
  { value: "New Zealand", en: "New Zealand", fr: "Nouvelle-Zélande" },
  { value: "Japan", en: "Japan", fr: "Japon" },
  { value: "South Korea", en: "South Korea", fr: "Corée du Sud" },
  { value: "India", en: "India", fr: "Inde" },
  { value: "Singapore", en: "Singapore", fr: "Singapour" },
  { value: "Hong Kong", en: "Hong Kong", fr: "Hong Kong" },
  { value: "South Africa", en: "South Africa", fr: "Afrique du Sud" },
  { value: "Nigeria", en: "Nigeria", fr: "Nigeria" },
  { value: "Kenya", en: "Kenya", fr: "Kenya" },
];

export function countryLabel(value: string, locale: Locale): string {
  const c = COUNTRIES.find((x) => x.value === value);
  if (!c) return value;
  return locale === "fr" ? c.fr : c.en;
}

export function sortedCountries(locale: Locale): Country[] {
  const featured = COUNTRIES.filter((c) => c.featured);
  const rest = COUNTRIES.filter((c) => !c.featured)
    .slice()
    .sort((a, b) =>
      (locale === "fr" ? a.fr : a.en).localeCompare(
        locale === "fr" ? b.fr : b.en
      )
    );
  return [...featured, ...rest];
}
