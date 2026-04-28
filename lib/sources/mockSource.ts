import type { Lead } from "../leadTypes";
import { cryptoRandomId } from "../utils";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME_BITS: Record<
  string,
  { prefixes: string[]; cores: string[]; suffixes: string[] }
> = {
  restaurant: {
    prefixes: ["The", "Café", "La", "Chez", "Little", "Modern", "Maison"],
    cores: [
      "Olive",
      "Saffron",
      "Basil",
      "Harbor",
      "Corner",
      "Garden",
      "Canteen",
      "Table",
    ],
    suffixes: [
      "Kitchen",
      "Bistro",
      "Grill",
      "House",
      "Café",
      "Restaurant",
      "& Co.",
    ],
  },
  dentist: {
    prefixes: [
      "Dr.",
      "Downtown",
      "Smile",
      "Bright",
      "Family",
      "Modern",
      "Dental",
    ],
    cores: [
      "Adler",
      "Cohen",
      "Dupont",
      "Martin",
      "Laurent",
      "Rossi",
      "Weiss",
      "Brown",
    ],
    suffixes: [
      "Dental",
      "Dental Clinic",
      "Dental Studio",
      "Smile Center",
      "Dentistry",
    ],
  },
  agency: {
    prefixes: ["North", "Atlas", "Union", "Meridian", "Nova", "Bright", "Core"],
    cores: ["Pixel", "Signal", "Canvas", "Edge", "Element", "Craft", "Beacon"],
    suffixes: ["Studio", "Agency", "Partners", "Collective", "Works", "& Co."],
  },
  shop: {
    prefixes: ["The", "Petit", "Modern", "Golden", "Silver", "Urban", "Village"],
    cores: ["Fig", "Market", "House", "Corner", "Studio", "Lane", "Loft"],
    suffixes: ["Boutique", "Shop", "Store", "Gallery", "Atelier", "Co."],
  },
  real_estate: {
    prefixes: ["Prime", "Skyline", "Summit", "Harbor", "Arc", "North"],
    cores: ["Capital", "Estates", "Residence", "Realty", "Heritage"],
    suffixes: ["Real Estate", "Properties", "Realty", "Homes", "Group"],
  },
  default: {
    prefixes: ["North", "Bright", "Modern", "Blue", "Prime", "Meridian", "Summit"],
    cores: ["Oak", "Arc", "Ridge", "Crown", "Atlas", "Beacon", "Pixel"],
    suffixes: ["Studio", "Group", "Labs", "Partners", "& Co.", "Collective"],
  },
};

function inferBucket(businessType: string): keyof typeof NAME_BITS {
  const t = businessType.toLowerCase();
  if (/(restaurant|cafe|café|pizza|bistro|food|bar|diner|bakery|coffee)/.test(t))
    return "restaurant";
  if (/(dent|ortho)/.test(t)) return "dentist";
  if (/(agency|marketing|seo|web|design|studio|consult)/.test(t))
    return "agency";
  if (/(real estate|realt|properties|broker|immo)/.test(t)) return "real_estate";
  if (/(shop|store|boutique|retail|market|gallery)/.test(t)) return "shop";
  return "default";
}

const STREETS = [
  "Main St",
  "High St",
  "Market St",
  "Union Ave",
  "Park Rd",
  "Harbor Ln",
  "King St",
  "Queen Ave",
  "Rothschild Blvd",
  "Allenby St",
  "Dizengoff St",
  "Rue de Rivoli",
  "Avenue Montaigne",
  "Broadway",
  "5th Ave",
  "Mission St",
];

const DOMAINS = ["com", "co", "io", "net", "biz", "shop", "studio"];

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function buildName(
  bucket: keyof typeof NAME_BITS,
  rnd: () => number
): string {
  const b = NAME_BITS[bucket];
  const usePrefix = rnd() < 0.5;
  const useSuffix = rnd() < 0.85;
  const core = pick(b.cores, rnd);
  const parts: string[] = [];
  if (usePrefix) parts.push(pick(b.prefixes, rnd));
  parts.push(core);
  if (useSuffix) parts.push(pick(b.suffixes, rnd));
  return parts.join(" ");
}

function slugHost(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

function buildPhone(rnd: () => number): string {
  const d = () => Math.floor(rnd() * 10);
  return `+${d()}${d()} ${d()}${d()}${d()}-${d()}${d()}${d()}${d()}${d()}${d()}`;
}

function prettyCategory(
  original: string,
  bucket: keyof typeof NAME_BITS
): string {
  if (original && original.length <= 40) {
    return original
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  const map: Record<string, string> = {
    restaurant: "Restaurant",
    dentist: "Dental Clinic",
    agency: "Agency",
    shop: "Retail",
    real_estate: "Real Estate",
    default: "Business",
  };
  return map[bucket];
}

function buildDescription(
  name: string,
  category: string,
  location: string,
  bucket: keyof typeof NAME_BITS,
  hasWebsite: boolean,
  rnd: () => number
): string {
  const tone = pick(
    [
      `${name} is a ${category.toLowerCase()} operating in ${location}.`,
      `Locally owned ${category.toLowerCase()} serving the ${location} area.`,
      `${name} has built a loyal following in ${location} over recent years.`,
      `${name} focuses on a premium customer experience in ${location}.`,
    ],
    rnd
  );
  const extra = hasWebsite
    ? "They maintain an active online presence."
    : bucket === "agency"
      ? "Their digital footprint is currently minimal."
      : "They appear to have no website yet.";
  return `${tone} ${extra}`;
}

export const mockSource: LeadSourceProvider = {
  id: "mock",
  name: "Findely Sample",
  description:
    "Realistic synthetic leads generated on-device. Perfect for demos and offline development.",
  enabled: true,
  badge: "Mock",
  statusInfo() {
    return { status: "available" };
  },
  async search(params: SourceSearchParams): Promise<Lead[]> {
    const { businessType, location, limit, objective } = params;
    const seed = hashString(
      `${businessType}|${location}|${params.country ?? ""}|${objective ?? "general"}`
    );
    const rnd = mulberry32(seed);

    const bucket = inferBucket(businessType);
    const count = Math.max(8, Math.min(80, limit));
    const nowIso = new Date().toISOString();

    const websiteRate =
      objective === "no_website"
        ? 0.15
        : objective === "with_website"
          ? 0.95
          : objective === "seo_outreach" || objective === "marketing_outreach"
            ? 0.8
            : objective === "b2b_clients"
              ? 0.85
              : 0.55;
    const phoneRate =
      objective === "with_phone" ? 0.98 : objective === "local" ? 0.92 : 0.75;
    const addressRate = objective === "local" ? 0.95 : 0.78;

    const leads: Lead[] = [];
    for (let i = 0; i < count; i++) {
      const name = buildName(bucket, rnd);
      const hasWebsite = rnd() < websiteRate;
      const hasPhone = rnd() < phoneRate;
      const hasAddress = rnd() < addressRate;
      const streetNum = Math.floor(rnd() * 250) + 1;
      const street = pick(STREETS, rnd);
      const addr = hasAddress ? `${streetNum} ${street}, ${location}` : null;
      const host = slugHost(name);
      const tld = pick(DOMAINS, rnd);
      const website = hasWebsite ? `https://${host}.${tld}` : null;
      const phone = hasPhone ? buildPhone(rnd) : null;
      const category = prettyCategory(businessType, bucket);

      leads.push({
        id: cryptoRandomId("lead"),
        name,
        category,
        phone,
        website,
        address: addr,
        source: "mock",
        score: 0,
        signals: [],
        status: "new",
        createdAt: nowIso,
        description: buildDescription(
          name,
          category,
          location,
          bucket,
          hasWebsite,
          rnd
        ),
      });
    }
    return leads;
  },
};
