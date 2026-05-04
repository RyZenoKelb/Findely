import type { Lead } from "../leadTypes";
import { cryptoRandomId } from "../utils";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

const CUSTOM_SEARCH_URL =
  "https://www.googleapis.com/customsearch/v1";

/** Domains to skip — these are not business websites. */
const EXCLUDED_DOMAINS = [
  "google.com",
  "maps.google",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wikipedia.org",
  "indeed.com",
];

function isApiKeyPresent(): boolean {
  const key = process.env.GOOGLE_SEARCH_API_KEY?.trim();
  return Boolean(key && key.length > 0);
}

function isEngineIdPresent(): boolean {
  const id = process.env.GOOGLE_SEARCH_ENGINE_ID?.trim();
  return Boolean(id && id.length > 0);
}

function isDisabledByConfig(): boolean {
  return process.env.FINDELY_ENABLE_GOOGLE_SEARCH === "false";
}

function computeStatus(): {
  status: "available" | "missing_key" | "disabled_config";
  reason?: string;
} {
  if (isDisabledByConfig())
    return {
      status: "disabled_config",
      reason: "FINDELY_ENABLE_GOOGLE_SEARCH=false in .env.local",
    };
  if (!isApiKeyPresent() || !isEngineIdPresent())
    return {
      status: "missing_key",
      reason:
        "Set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env.local to enable.",
    };
  return { status: "available" };
}

/** Remove common " - domain.com" suffixes from titles. */
function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[-–|]\s*[^-–|]+\.[a-z]{2,}$/i, "")
    .replace(/\s*[-–|]\s*[A-Z][a-zA-Z\s]+$/, "")
    .trim();
}

/** Remove tracking / UTM params from a URL. */
function cleanUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const toRemove: string[] = [];
    u.searchParams.forEach((_v, key) => {
      if (
        key.startsWith("utm_") ||
        key === "fbclid" ||
        key === "gclid" ||
        key === "ref"
      ) {
        toRemove.push(key);
      }
    });
    for (const k of toRemove) u.searchParams.delete(k);
    return u.toString();
  } catch {
    return raw;
  }
}

/** Check whether a URL belongs to an excluded domain. */
function isExcludedDomain(link: string): boolean {
  try {
    const hostname = new URL(link).hostname.toLowerCase();
    return EXCLUDED_DOMAINS.some(
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

export const googleSearchSource: LeadSourceProvider = {
  id: "google_search",
  name: "Google Search",
  description:
    "Organic search results for your niche and location.",
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

    const query = `"${params.businessType}" "${params.location}"${
      params.country ? ` ${params.country}` : ""
    }`;

    const maxPages = 3;
    const perPage = 10;
    const needed = Math.min(params.limit, maxPages * perPage);
    const allItems: CustomSearchItem[] = [];

    for (let page = 0; page < maxPages && allItems.length < needed; page++) {
      const start = page * perPage + 1;
      const items = await fetchPage(query, apiKey, engineId, start);
      if (items.length === 0) break;
      allItems.push(...items);

      // 2-second delay between pages
      if (page < maxPages - 1 && allItems.length < needed) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const nowIso = new Date().toISOString();
    const leads: Lead[] = [];

    for (const item of allItems) {
      if (leads.length >= params.limit) break;
      if (!item.link || !item.title) continue;
      if (isExcludedDomain(item.link)) continue;

      const name = cleanTitle(item.title);
      if (!name || name.length < 3) continue;

      leads.push({
        id: cryptoRandomId("lead"),
        name,
        category: params.businessType,
        phone: null,
        website: cleanUrl(item.link),
        address: null,
        source: "google_search",
        score: 0,
        signals: [],
        status: "new",
        createdAt: nowIso,
        mapsUrl: null,
      });
    }

    return leads;
  },
};
