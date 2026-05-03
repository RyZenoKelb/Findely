import type { Lead } from "../leadTypes";
import { cryptoRandomId } from "../utils";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

const TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

interface PlacesTextSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  types?: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
}

interface PlacesDetails {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  types?: string[];
  business_status?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
}

function isApiKeyPresent(): boolean {
  const k = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return Boolean(k && k.length > 0 && k !== "your_google_maps_api_key_here");
}

function isDisabledByConfig(): boolean {
  return process.env.FINDELY_ENABLE_GOOGLE_MAPS === "false";
}

function computeStatus(): {
  status: "available" | "missing_key" | "disabled_config";
  reason?: string;
} {
  if (isDisabledByConfig())
    return {
      status: "disabled_config",
      reason: "FINDELY_ENABLE_GOOGLE_MAPS=false in .env.local",
    };
  if (!isApiKeyPresent())
    return {
      status: "missing_key",
      reason: "Set GOOGLE_MAPS_API_KEY in .env.local to enable.",
    };
  return { status: "available" };
}

function typeToCategory(types?: string[]): string | undefined {
  if (!types || types.length === 0) return undefined;
  const cleaned = types
    .filter(
      (t) => t !== "point_of_interest" && t !== "establishment" && t !== "food"
    )
    .map((t) =>
      t
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  if (cleaned.length === 0) return undefined;
  return cleaned[0];
}

async function textSearch(
  query: string,
  apiKey: string,
  language?: string,
  maxResults = 20
): Promise<PlacesTextSearchResult[]> {
  const allResults: PlacesTextSearchResult[] = [];
  let pageToken: string | undefined;

  while (allResults.length < maxResults) {
    const url = new URL(TEXT_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);
    if (language) url.searchParams.set("language", language);
    if (pageToken) url.searchParams.set("pagetoken", pageToken);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Places text search HTTP ${res.status}`);
    const data = (await res.json()) as {
      status?: string;
      error_message?: string;
      results?: PlacesTextSearchResult[];
      next_page_token?: string;
    };
    if (
      data.status &&
      data.status !== "OK" &&
      data.status !== "ZERO_RESULTS"
    ) {
      throw new Error(
        `Places text search: ${data.status}${
          data.error_message ? ` — ${data.error_message}` : ""
        }`
      );
    }

    const results = data.results ?? [];
    allResults.push(...results);

    if (!data.next_page_token || results.length === 0) break;

    pageToken = data.next_page_token;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return allResults.slice(0, maxResults);
}

async function placeDetails(
  placeId: string,
  apiKey: string,
  language?: string
): Promise<PlacesDetails | null> {
  const url = new URL(DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set(
    "fields",
    [
      "name",
      "formatted_address",
      "formatted_phone_number",
      "international_phone_number",
      "website",
      "types",
      "business_status",
      "url",
      "rating",
      "user_ratings_total",
    ].join(",")
  );
  if (language) url.searchParams.set("language", language);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    result?: PlacesDetails;
  };
  if (data.status && data.status !== "OK") return null;
  return data.result ?? null;
}

const DETAILS_CONCURRENCY = 5;

async function batchDetails(
  placeIds: string[],
  apiKey: string,
  language?: string
): Promise<(PlacesDetails | null)[]> {
  const results: (PlacesDetails | null)[] = new Array(placeIds.length).fill(
    null
  );
  for (let i = 0; i < placeIds.length; i += DETAILS_CONCURRENCY) {
    const batch = placeIds.slice(i, i + DETAILS_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((id) => placeDetails(id, apiKey, language))
    );
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }
  return results;
}

export const googleMapsSource: LeadSourceProvider = {
  id: "google_maps",
  name: "Google Places",
  description:
    "Real business data pulled live from the Google Places API. Set GOOGLE_MAPS_API_KEY to enable.",
  get enabled() {
    return computeStatus().status === "available";
  },
  badge: "Real",
  statusInfo() {
    return computeStatus();
  },
  async search(params: SourceSearchParams): Promise<Lead[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not set");
    }

    const query = `${params.businessType} in ${params.location}${
      params.country ? `, ${params.country}` : ""
    }`;

    const results = await textSearch(query, apiKey, params.language, params.limit);
    const limited = results.slice(0, params.limit);

    const nowIso = new Date().toISOString();
    const details = await batchDetails(
      limited.map((r) => r.place_id),
      apiKey,
      params.language
    );

    return limited.map((r, i) => {
      const d = details[i];
      const phone =
        d?.international_phone_number ?? d?.formatted_phone_number ?? null;
      const website = d?.website ?? null;
      const address = d?.formatted_address ?? r.formatted_address ?? null;
      const mapsUrl = d?.url ?? null;
      const category = typeToCategory(d?.types ?? r.types);

      return {
        id: cryptoRandomId("lead"),
        name: d?.name ?? r.name,
        category,
        phone,
        website,
        address,
        source: "google_maps",
        score: 0,
        signals: [],
        status: "new",
        createdAt: nowIso,
        mapsUrl,
        rating: d?.rating,
        ratingCount: d?.user_ratings_total,
      } satisfies Lead;
    });
  },
};
