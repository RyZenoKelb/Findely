import type { Lead } from "../leadTypes";
import { cryptoRandomId } from "../utils";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

const TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GEOCODE_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

const DETAILS_CONCURRENCY = 10;
const SEARCH_CONCURRENCY = 3;
const MAX_PAGES_PER_QUERY = 2;
const PAGE_TOKEN_DELAY_MS = 1500;

interface PlacesTextSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  types?: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location?: { lat: number; lng: number } };
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
  geometry?: { location?: { lat: number; lng: number } };
}

interface GeocodedLocation {
  lat: number;
  lng: number;
  bounds?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface GoogleSearchMeta {
  batchesRun: number;
  rawFetchedCount: number;
  dedupedCount: number;
  detailsCallsCount: number;
  limitReached: boolean;
  cappedByProvider: boolean;
  providerNotes: string[];
  searchTimeMs: number;
  detailsTimeMs: number;
  totalTimeMs: number;
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
    return { status: "disabled_config", reason: "FINDELY_ENABLE_GOOGLE_MAPS=false in .env.local" };
  if (!isApiKeyPresent())
    return { status: "missing_key", reason: "Set GOOGLE_MAPS_API_KEY in .env.local to enable." };
  return { status: "available" };
}

function typeToCategory(types?: string[]): string | undefined {
  if (!types || types.length === 0) return undefined;
  const cleaned = types
    .filter((t) => t !== "point_of_interest" && t !== "establishment" && t !== "food")
    .map((t) => t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  return cleaned[0] ?? undefined;
}

function buildQueryVariants(
  businessType: string,
  location: string,
  country: string | undefined,
  limit: number
): string[] {
  const base = businessType.trim();
  const loc = location.trim();
  const sfx = country ? `, ${country}` : "";

  const variants: string[] = [
    `${base} ${loc}${sfx}`,
    `${base} in ${loc}${sfx}`,
  ];

  if (limit > 60) {
    variants.push(`best ${base} ${loc}${sfx}`);
    variants.push(`top ${base} ${loc}${sfx}`);
  }

  if (limit > 120) {
    for (let i = 1; i <= 4; i++) variants.push(`${base} ${loc} ${i}${sfx}`);
    variants.push(`${base} near ${loc} center${sfx}`);
    variants.push(`${base} ${loc} downtown${sfx}`);
  }

  if (limit > 300) {
    for (let i = 5; i <= 10; i++) variants.push(`${base} ${loc} ${i}${sfx}`);
    variants.push(`${base} ${loc} north${sfx}`);
    variants.push(`${base} ${loc} south${sfx}`);
    variants.push(`${base} ${loc} east${sfx}`);
    variants.push(`${base} ${loc} west${sfx}`);
  }

  return [...new Set(variants)];
}

async function geocodeLocation(
  location: string,
  country: string | undefined,
  apiKey: string
): Promise<GeocodedLocation | null> {
  const query = country ? `${location}, ${country}` : location;
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("address", query);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status?: string;
      results?: {
        geometry?: {
          location?: { lat: number; lng: number };
          bounds?: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } };
          viewport?: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } };
        };
      }[];
    };
    if (data.status !== "OK" || !data.results?.length) return null;
    const geo = data.results[0].geometry;
    const loc = geo?.location;
    if (!loc) return null;
    return { lat: loc.lat, lng: loc.lng, bounds: geo?.bounds ?? geo?.viewport };
  } catch {
    return null;
  }
}

function buildGeoPoints(
  center: { lat: number; lng: number },
  bounds: GeocodedLocation["bounds"] | undefined,
  limit: number
): { lat: number; lng: number }[] {
  let offsetKm = 5;
  if (bounds) {
    const latSpan = Math.abs(bounds.northeast.lat - bounds.southwest.lat) * 111;
    const lngSpan = Math.abs(bounds.northeast.lng - bounds.southwest.lng) * 111 * Math.cos((center.lat * Math.PI) / 180);
    offsetKm = Math.max(3, Math.min((latSpan + lngSpan) / 4, 20));
  }
  const dLat = offsetKm / 111;
  const dLng = offsetKm / (111 * Math.cos((center.lat * Math.PI) / 180));

  const dirs: { lat: number; lng: number }[] = [
    { lat: 0, lng: 0 },
    { lat: dLat, lng: 0 },
    { lat: -dLat, lng: 0 },
    { lat: 0, lng: dLng },
    { lat: 0, lng: -dLng },
  ];

  if (limit > 200) {
    dirs.push(
      { lat: dLat, lng: dLng },
      { lat: dLat, lng: -dLng },
      { lat: -dLat, lng: dLng },
      { lat: -dLat, lng: -dLng }
    );
  }

  if (limit > 500) {
    const d2 = dLat * 2;
    const d2g = dLng * 2;
    dirs.push(
      { lat: d2, lng: 0 }, { lat: -d2, lng: 0 },
      { lat: 0, lng: d2g }, { lat: 0, lng: -d2g },
      { lat: d2, lng: d2g }, { lat: d2, lng: -d2g },
      { lat: -d2, lng: d2g }, { lat: -d2, lng: -d2g }
    );
  }

  return dirs.map((d) => ({ lat: center.lat + d.lat, lng: center.lng + d.lng }));
}

async function textSearchQuery(
  query: string,
  apiKey: string,
  language?: string,
  locationBias?: string
): Promise<{ results: PlacesTextSearchResult[]; pages: number }> {
  const allResults: PlacesTextSearchResult[] = [];
  let pageToken: string | undefined;
  let pages = 0;

  while (pages < MAX_PAGES_PER_QUERY) {
    const url = new URL(TEXT_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);
    if (language) url.searchParams.set("language", language);
    if (locationBias) url.searchParams.set("location", locationBias);
    if (pageToken) url.searchParams.set("pagetoken", pageToken);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) break;

    const data = (await res.json()) as {
      status?: string;
      results?: PlacesTextSearchResult[];
      next_page_token?: string;
    };

    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") break;

    const page = data.results ?? [];
    allResults.push(...page);
    pages++;

    if (!data.next_page_token || page.length === 0) break;
    pageToken = data.next_page_token;
    await new Promise((r) => setTimeout(r, PAGE_TOKEN_DELAY_MS));
  }

  return { results: allResults, pages };
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
    "name,formatted_address,formatted_phone_number,international_phone_number,website,types,business_status,url,rating,user_ratings_total,geometry"
  );
  if (language) url.searchParams.set("language", language);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: string; result?: PlacesDetails };
  if (data.status && data.status !== "OK") return null;
  return data.result ?? null;
}

async function batchDetails(
  placeIds: string[],
  apiKey: string,
  language?: string
): Promise<(PlacesDetails | null)[]> {
  const results: (PlacesDetails | null)[] = new Array(placeIds.length).fill(null);
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

export const googleMapsSource: LeadSourceProvider & { lastMeta?: GoogleSearchMeta } = {
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
  lastMeta: undefined,

  async search(params: SourceSearchParams): Promise<Lead[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

    const totalStart = Date.now();
    const { businessType, location, country, language, limit } = params;
    const providerNotes: string[] = [];
    let batchesRun = 0;

    // ── Phase 1: collect raw place_id deduplicated results ──────────────────
    const searchStart = Date.now();
    const dedupedMap = new Map<string, PlacesTextSearchResult>();

    if (limit <= 60) {
      const query = `${businessType} in ${location}${country ? `, ${country}` : ""}`;
      const { results, pages } = await textSearchQuery(query, apiKey, language);
      batchesRun += pages;
      for (const r of results) {
        if (!dedupedMap.has(r.place_id)) dedupedMap.set(r.place_id, r);
      }
    } else {
      const queryVariants = buildQueryVariants(businessType, location, country, limit);

      // Run query variants in parallel batches of SEARCH_CONCURRENCY
      for (let i = 0; i < queryVariants.length; i += SEARCH_CONCURRENCY) {
        if (dedupedMap.size >= limit) break;
        const chunk = queryVariants.slice(i, i + SEARCH_CONCURRENCY);
        const batchRes = await Promise.all(
          chunk.map((q) => textSearchQuery(q, apiKey, language))
        );
        for (const { results, pages } of batchRes) {
          batchesRun += pages;
          for (const r of results) {
            if (!dedupedMap.has(r.place_id)) dedupedMap.set(r.place_id, r);
          }
        }
      }

      // Geo grid (also parallelized) for larger requests still under target
      if (dedupedMap.size < limit && limit > 120) {
        const geocoded = await geocodeLocation(location, country, apiKey);
        if (geocoded) {
          const geoPoints = buildGeoPoints(geocoded, geocoded.bounds, limit);
          const geoQuery = `${businessType}${country ? `, ${country}` : ""}`;
          for (let i = 0; i < geoPoints.length; i += SEARCH_CONCURRENCY) {
            if (dedupedMap.size >= limit) break;
            const chunk = geoPoints.slice(i, i + SEARCH_CONCURRENCY);
            const batchRes = await Promise.all(
              chunk.map((pt) => textSearchQuery(geoQuery, apiKey, language, `${pt.lat},${pt.lng}`))
            );
            for (const { results, pages } of batchRes) {
              batchesRun += pages;
              for (const r of results) {
                if (!dedupedMap.has(r.place_id)) dedupedMap.set(r.place_id, r);
              }
            }
          }
        }
      }
    }

    const rawFetchedCount = dedupedMap.size;
    const searchTimeMs = Date.now() - searchStart;

    // ── Phase 2: slice to limit, then fetch details only for final set ───────
    const finalRaw = [...dedupedMap.values()].slice(0, limit);
    const cappedByProvider = dedupedMap.size < limit;

    if (cappedByProvider && limit > 60) {
      providerNotes.push(
        `Found ${rawFetchedCount} unique results after ${batchesRun} Google pages; fewer than the ${limit} requested.`
      );
    }

    const detailsStart = Date.now();
    const details = await batchDetails(finalRaw.map((r) => r.place_id), apiKey, language);
    const detailsTimeMs = Date.now() - detailsStart;
    const totalTimeMs = Date.now() - totalStart;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[googleMapsSource] total=${totalTimeMs}ms search=${searchTimeMs}ms details=${detailsTimeMs}ms batches=${batchesRun} raw=${rawFetchedCount} final=${finalRaw.length}`
      );
    }

    (this as { lastMeta?: GoogleSearchMeta }).lastMeta = {
      batchesRun,
      rawFetchedCount,
      dedupedCount: rawFetchedCount,
      detailsCallsCount: finalRaw.length,
      limitReached: finalRaw.length >= limit,
      cappedByProvider,
      providerNotes,
      searchTimeMs,
      detailsTimeMs,
      totalTimeMs,
    };

    const nowIso = new Date().toISOString();
    return finalRaw.map((r, i) => {
      const d = details[i];
      const lat = d?.geometry?.location?.lat ?? r.geometry?.location?.lat;
      const lng = d?.geometry?.location?.lng ?? r.geometry?.location?.lng;

      return {
        id: cryptoRandomId("lead"),
        name: d?.name ?? r.name,
        category: typeToCategory(d?.types ?? r.types),
        phone: d?.international_phone_number ?? d?.formatted_phone_number ?? null,
        website: d?.website ?? null,
        address: d?.formatted_address ?? r.formatted_address ?? null,
        source: "google_maps",
        score: 0,
        signals: [],
        status: "new",
        createdAt: nowIso,
        mapsUrl: d?.url ?? null,
        rating: d?.rating ?? r.rating,
        ratingCount: d?.user_ratings_total ?? r.user_ratings_total,
        geo: lat != null && lng != null ? { lat, lng } : null,
      } satisfies Lead;
    });
  },
};
