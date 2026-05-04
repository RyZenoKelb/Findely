import type { Lead } from "../leadTypes";
import { cryptoRandomId } from "../utils";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

const CUSTOM_SEARCH_URL =
  "https://www.googleapis.com/customsearch/v1";

const DIRECTORY_DOMAINS = [
  "pagesjaunes.fr",
  "yelp.com",
  "yelp.fr",
  "tripadvisor.com",
  "tripadvisor.fr",
  "yellowpages.com",
  "europages.com",
  "justacote.com",
  "kompass.com",
  "societe.com",
  "infobel.com",
];

/** French-first directories. */
const FR_DIRECTORIES = ["pagesjaunes.fr", "yelp.fr"];
/** Default (international) directories. */
const DEFAULT_DIRECTORIES = ["yelp.com", "yellowpages.com"];

function isApiKeyPresent(): boolean {
  const key = process.env.GOOGLE_SEARCH_API_KEY?.trim();
  return Boolean(key && key.length > 0);
}

function isEngineIdPresent(): boolean {
  const id = process.env.GOOGLE_SEARCH_ENGINE_ID?.trim();
  return Boolean(id && id.length > 0);
}

function isDisabledByConfig(): boolean {
  return process.env.FINDELY_ENABLE_BUSINESS_DIRECTORIES === "false";
}

function computeStatus(): {
  status: "available" | "missing_key" | "disabled_config";
  reason?: string;
} {
  if (isDisabledByConfig())
    return {
      status: "disabled_config",
      reason: "FINDELY_ENABLE_BUSINESS_DIRECTORIES=false in .env.local",
    };
  if (!isApiKeyPresent() || !isEngineIdPresent())
    return {
      status: "missing_key",
      reason:
        "Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env.local to enable (shared with Google Search source).",
    };
  return { status: "available" };
}

/** Pick the best 2 directory domains based on language/country. */
function pickDirectories(language?: string, country?: string): string[] {
  const isFrench =
    language === "fr" ||
    (country ?? "").toLowerCase().includes("france");
  return isFrench ? FR_DIRECTORIES : DEFAULT_DIRECTORIES;
}

/** Remove common title suffixes added by directories. */
function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[-–|]\s*[^-–|]+\.[a-z]{2,}$/i, "")
    .replace(/\s*[-–|]\s*[A-Z][a-zA-Z\s]+$/, "")
    .trim();
}

/** Check if a URL belongs to any known directory domain. */
function isDirectoryDomain(link: string): boolean {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    return DIRECTORY_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

interface CustomSearchItem {
  title?: string;
  link?: string;
  snippet?: string;
}

interface CustomSearchResponse {
  items?: CustomSearchItem[];
  error?: { code?: number; message?: string };
}

async function fetchPage(
  query: string,
  apiKey: string,
  engineId: string,
  start: number
): Promise<CustomSearchItem[]> {
  const url = new URL(CUSTOM_SEARCH_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", engineId);
  url.searchParams.set("q", query);
  url.searchParams.set("start", String(start));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Google Custom Search HTTP ${res.status}`);
  }
  const data = (await res.json()) as CustomSearchResponse;
  if (data.error) {
    throw new Error(
      `Google Custom Search: ${data.error.message ?? `code ${data.error.code}`}`
    );
  }
  return data.items ?? [];
}

export const directorySource: LeadSourceProvider = {
  id: "business_directories",
  name: "Business Directories",
  description:
    "Directory listings from public business directories.",
  get enabled() {
    return computeStatus().status === "available";
  },
  badge: undefined,
  statusInfo() {
    return computeStatus();
  },
  async search(params: SourceSearchParams): Promise<Lead[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY!;
    const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID!;

    const directories = pickDirectories(params.language, params.country);
    const allItems: CustomSearchItem[] = [];

    for (let i = 0; i < directories.length; i++) {
      const site = directories[i];
      const query = `"${params.businessType}" "${params.location}" site:${site}`;
      const items = await fetchPage(query, apiKey, engineId, 1);
      allItems.push(...items);

      // 2-second delay between directory queries
      if (i < directories.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const nowIso = new Date().toISOString();
    const leads: Lead[] = [];

    for (const item of allItems) {
      if (leads.length >= params.limit) break;
      if (!item.link || !item.title) continue;

      // Only keep results that are actually from directory domains
      if (!isDirectoryDomain(item.link)) continue;

      const name = cleanTitle(item.title);
      if (!name || name.length < 3) continue;

      leads.push({
        id: cryptoRandomId("lead"),
        name,
        category: params.businessType,
        phone: null,
        website: null,
        address: null,
        source: "business_directories",
        score: 0,
        signals: [],
        status: "new",
        createdAt: nowIso,
        mapsUrl: item.link, // Store directory URL here
      });
    }

    return leads;
  },
};
