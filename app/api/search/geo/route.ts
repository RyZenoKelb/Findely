import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/lib/auth";
import { env } from "@/lib/env";
import { cleanAndDedupe } from "@/lib/leadCleaning";
import {
  getContactReadiness,
  getDataQuality,
  getOpportunityReason,
  getOpportunityType,
  getPriorityLabel,
  getRecommendedAction,
  getSourceConfidence,
  opportunityTypeLabel,
} from "@/lib/leadOpportunity";
import { scoreLeadDetailed } from "@/lib/leadScoring";
import { detectSignals } from "@/lib/leadSignals";
import type { Lead, LeadObjective } from "@/lib/leadTypes";
import { pointInCircle, pointInPolygon } from "@/lib/geo";
import {
  assertAndReserveSearch,
  QuotaError,
  recordUsageEvent,
} from "@/lib/quota";
import { getRateLimitKey, rateLimit } from "@/lib/rateLimit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cryptoRandomId } from "@/lib/utils";

export const runtime = "nodejs";

const LatLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const RadiusZoneSchema = z.object({
  type: z.literal("radius"),
  center: LatLngSchema,
  radiusKm: z.number().min(0.1).max(100),
});

const PolygonZoneSchema = z.object({
  type: z.literal("polygon"),
  points: z.array(LatLngSchema).min(3).max(50),
});

const ZoneSchema = z.discriminatedUnion("type", [
  RadiusZoneSchema,
  PolygonZoneSchema,
]);

const BodySchema = z.object({
  businessType: z.string().trim().min(1).max(120),
  zone: ZoneSchema,
  country: z.string().trim().max(64).optional(),
  language: z.string().trim().max(16).optional(),
  limit: z.number().int().min(1).max(120).optional(),
});

const TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const NEARBY_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

export async function POST(request: Request) {
  const start = Date.now();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const body = parsed.data;
  const limit = body.limit ?? 40;
  const zone = body.zone;

  const profile = await getCurrentUserProfile();
  if (!profile && !env.demoMode) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  const rlKey = getRateLimitKey(request, profile?.id ?? null);
  const rl = rateLimit(rlKey, profile ? 20 : 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  if (profile) {
    try {
      await assertAndReserveSearch(profile.id, profile.plan);
    } catch (err) {
      if (err instanceof QuotaError) {
        return NextResponse.json(
          { error: err.detail, code: err.code },
          { status: err.status }
        );
      }
      throw err;
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured", code: "missing_key" },
      { status: 503 }
    );
  }

  let searchCenter: { lat: number; lng: number };
  let searchRadiusMeters: number;

  if (zone.type === "radius") {
    searchCenter = zone.center;
    searchRadiusMeters = Math.min(zone.radiusKm * 1000, 50000);
  } else {
    const centroid = computeCentroid(zone.points);
    const maxDist = Math.max(
      ...zone.points.map((p) => haversineMeters(centroid, p))
    );
    searchCenter = centroid;
    searchRadiusMeters = Math.min(maxDist * 1.2, 50000);
  }

  const fetchLimit = Math.min(limit * 3, 60);
  let rawResults: PlacesResult[] = [];

  try {
    const nearbyResults = await nearbySearch(
      body.businessType,
      searchCenter,
      searchRadiusMeters,
      apiKey,
      body.language,
      fetchLimit
    );
    rawResults = nearbyResults;

    if (rawResults.length < fetchLimit) {
      const locationStr = `${searchCenter.lat},${searchCenter.lng}`;
      const textResults = await textSearchBiased(
        body.businessType,
        locationStr,
        searchRadiusMeters,
        apiKey,
        body.language,
        fetchLimit - rawResults.length
      );
      const existingIds = new Set(rawResults.map((r) => r.place_id));
      for (const r of textResults) {
        if (!existingIds.has(r.place_id)) rawResults.push(r);
      }
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Google Places API error",
        detail: err instanceof Error ? err.message : "Unknown",
      },
      { status: 502 }
    );
  }

  const details = await batchDetails(
    rawResults.map((r) => r.place_id),
    apiKey,
    body.language
  );

  const nowIso = new Date().toISOString();
  const allLeads: Lead[] = rawResults.map((r, i) => {
    const d = details[i];
    const lat = r.geometry?.location?.lat ?? d?.geometry?.location?.lat;
    const lng = r.geometry?.location?.lng ?? d?.geometry?.location?.lng;

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

  const rawCount = allLeads.length;
  const geoFiltered = allLeads.filter((lead) => {
    if (!lead.geo) return false;
    if (zone.type === "radius") {
      return pointInCircle(lead.geo, { center: zone.center, radiusKm: zone.radiusKm });
    }
    return pointInPolygon(lead.geo, { points: zone.points });
  });

  const cleaned = cleanAndDedupe(geoFiltered);
  const objective: LeadObjective = "local";

  const enriched: Lead[] = cleaned.map((lead) => {
    const signals = detectSignals(lead, objective);
    const withSignals: Lead = { ...lead, signals };
    const { score, factors } = scoreLeadDetailed(withSignals, objective);
    const scored: Lead = { ...withSignals, score, scoreBreakdown: factors };

    const priority = getPriorityLabel(scored, "en");
    const dq = getDataQuality(scored, "en");
    const cr = getContactReadiness(scored, "en");
    const oppType = getOpportunityType(scored, objective);

    return {
      ...scored,
      priorityLevel: priority.level,
      priorityLabel: priority.label,
      opportunityType: oppType,
      opportunityLabel: opportunityTypeLabel(oppType, "en"),
      opportunityReason: getOpportunityReason(scored, objective, "en"),
      recommendedAction: getRecommendedAction(scored, objective, "en"),
      dataQualityLevel: dq.level,
      dataQualityLabel: dq.label,
      contactReadinessLevel: cr.level,
      contactReadinessLabel: cr.label,
      sourceConfidence: getSourceConfidence(scored),
    };
  });

  const sorted = [...enriched].sort((a, b) => b.score - a.score);
  const limited = sorted.slice(0, limit);

  if (profile) {
    const meta = { source: "geo", businessType: body.businessType, zone: zone.type };
    await Promise.all([
      limited.length > 0
        ? recordUsageEvent(profile.id, "lead_returned", limited.length, meta)
        : Promise.resolve(),
      (async () => {
        try {
          const supabase = await createSupabaseServerClient();
          await supabase.from("lead_searches").insert({
            user_id: profile.id,
            business_type: body.businessType,
            location: `geo:${zone.type}`,
            country: body.country ?? null,
            language: body.language ?? null,
            objective: "local",
            filters: [],
            sources: ["google_maps"],
            result_count: limited.length,
            meta: {
              durationMs: Date.now() - start,
              zone,
              rawCount,
              filteredCount: geoFiltered.length,
            },
          });
        } catch {
          // non-fatal
        }
      })(),
    ]);
  }

  return NextResponse.json({
    leads: limited,
    meta: {
      total: limited.length,
      rawResultsCount: rawCount,
      filteredByZoneCount: geoFiltered.length,
      zone: {
        type: zone.type,
        ...(zone.type === "radius"
          ? { radiusKm: zone.radiusKm, center: zone.center }
          : { pointCount: zone.points.length }),
      },
      sourcesUsed: ["google_maps"],
      durationMs: Date.now() - start,
    },
  });
}

interface PlacesResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  types?: string[];
  geometry?: { location?: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
}

interface PlacesDetailResult {
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  types?: string[];
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location?: { lat: number; lng: number } };
}

async function nearbySearch(
  keyword: string,
  center: { lat: number; lng: number },
  radiusMeters: number,
  apiKey: string,
  language?: string,
  maxResults = 40
): Promise<PlacesResult[]> {
  const allResults: PlacesResult[] = [];
  let pageToken: string | undefined;

  while (allResults.length < maxResults) {
    const url = new URL(NEARBY_SEARCH_URL);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("location", `${center.lat},${center.lng}`);
    url.searchParams.set("radius", String(Math.round(radiusMeters)));
    url.searchParams.set("key", apiKey);
    if (language) url.searchParams.set("language", language);
    if (pageToken) url.searchParams.set("pagetoken", pageToken);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Nearby search HTTP ${res.status}`);
    const data = (await res.json()) as {
      status?: string;
      error_message?: string;
      results?: PlacesResult[];
      next_page_token?: string;
    };

    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Nearby search: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`);
    }

    allResults.push(...(data.results ?? []));
    if (!data.next_page_token || (data.results ?? []).length === 0) break;
    pageToken = data.next_page_token;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return allResults.slice(0, maxResults);
}

async function textSearchBiased(
  query: string,
  location: string,
  radiusMeters: number,
  apiKey: string,
  language?: string,
  maxResults = 20
): Promise<PlacesResult[]> {
  const url = new URL(TEXT_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("location", location);
  url.searchParams.set("radius", String(Math.round(radiusMeters)));
  url.searchParams.set("key", apiKey);
  if (language) url.searchParams.set("language", language);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { status?: string; results?: PlacesResult[] };
  if (data.status !== "OK") return [];
  return (data.results ?? []).slice(0, maxResults);
}

async function batchDetails(
  placeIds: string[],
  apiKey: string,
  language?: string
): Promise<(PlacesDetailResult | null)[]> {
  const CONCURRENCY = 5;
  const results: (PlacesDetailResult | null)[] = new Array(placeIds.length).fill(null);

  for (let i = 0; i < placeIds.length; i += CONCURRENCY) {
    const batch = placeIds.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (placeId) => {
        const url = new URL(DETAILS_URL);
        url.searchParams.set("place_id", placeId);
        url.searchParams.set("key", apiKey);
        url.searchParams.set(
          "fields",
          "name,formatted_address,formatted_phone_number,international_phone_number,website,types,url,rating,user_ratings_total,geometry"
        );
        if (language) url.searchParams.set("language", language);
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) return null;
        const data = (await res.json()) as { status?: string; result?: PlacesDetailResult };
        if (data.status !== "OK") return null;
        return data.result ?? null;
      })
    );
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j];
    }
  }
  return results;
}

function typeToCategory(types?: string[]): string | undefined {
  if (!types || types.length === 0) return undefined;
  const cleaned = types
    .filter((t) => t !== "point_of_interest" && t !== "establishment" && t !== "food")
    .map((t) => t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  return cleaned[0] ?? undefined;
}

function computeCentroid(points: { lat: number; lng: number }[]): { lat: number; lng: number } {
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
