import { NextResponse } from "next/server";
import { z } from "zod";
import { cleanAndDedupe } from "@/lib/leadCleaning";
import { applyFilters } from "@/lib/leadFilters";
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
import type {
  Lead,
  LeadFilterKey,
  LeadObjective,
  SearchQuery,
  SearchResponse,
} from "@/lib/leadTypes";
import { resolveProviders } from "@/lib/sources";
import { cryptoRandomId } from "@/lib/utils";

export const runtime = "nodejs";

const ObjectiveSchema = z.enum([
  "general",
  "no_website",
  "with_website",
  "with_phone",
  "local",
  "seo_outreach",
  "marketing_outreach",
  "b2b_clients",
]);

const FilterSchema = z.enum([
  "all",
  "without_website",
  "with_website",
  "with_phone",
  "missing_contact",
  "has_address",
  "high_score",
  "needs_online_presence",
  "outreach_ready",
]);

const BodySchema = z.object({
  businessType: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  country: z.string().trim().max(64).optional(),
  language: z.string().trim().max(16).optional(),
  objective: ObjectiveSchema.optional(),
  filters: z.array(FilterSchema).max(16).optional(),
  sources: z.array(z.string().max(40)).max(8).optional(),
  limit: z.number().int().min(1).max(120).optional(),
  advanced: z
    .object({
      minScore: z.number().int().min(0).max(100).optional(),
      requirePhone: z.boolean().optional(),
      requireWebsite: z.boolean().optional(),
      excludeDuplicates: z.boolean().optional(),
      includeOnlyContactable: z.boolean().optional(),
    })
    .optional(),
});

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
  const objective: LeadObjective = body.objective ?? "general";
  const filterKeys: LeadFilterKey[] = body.filters ?? [];
  const requestedSources = body.sources ?? [];
  const providers = resolveProviders(body.sources);

  const perProviderLimit = Math.max(
    10,
    Math.ceil((limit * 1.5) / providers.length)
  );

  const providerWarnings: { source: string; message: string }[] = [];

  const results = await Promise.all(
    providers.map(async (p) => {
      try {
        return await p.search({
          businessType: body.businessType,
          location: body.location,
          country: body.country,
          language: body.language,
          objective,
          limit: perProviderLimit,
        });
      } catch (err) {
        providerWarnings.push({
          source: p.id,
          message: err instanceof Error ? err.message : "Unknown error",
        });
        return [] as Lead[];
      }
    })
  );

  const rawLeads = results.flat();
  const providersWithResults = providers.filter(
    (_, i) => (results[i] ?? []).length > 0
  );
  const requestedButMissing = requestedSources.filter(
    (id) => !providers.some((p) => p.id === id)
  );
  const googleRequested = requestedSources.includes("google_maps");
  const googleDelivered = providersWithResults.some(
    (p) => p.id === "google_maps"
  );
  // If Google Places was asked for but produced nothing (error, missing key, no
  // results), silently fall back to the mock provider so the UI still works.
  let fallbackUsed = googleRequested && !googleDelivered;
  let supplementedLeads = rawLeads;
  if (fallbackUsed || rawLeads.length === 0) {
    try {
      const { mockSource } = await import("@/lib/sources/mockSource");
      const mockLeads = await mockSource.search({
        businessType: body.businessType,
        location: body.location,
        country: body.country,
        language: body.language,
        objective,
        limit: perProviderLimit,
      });
      supplementedLeads = [...rawLeads, ...mockLeads];
      if (!providers.some((p) => p.id === "mock")) fallbackUsed = true;
    } catch {
      fallbackUsed = false;
    }
  }

  const cleaned = cleanAndDedupe(supplementedLeads);

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

  const filtered = applyFilters(enriched, filterKeys, body.advanced ?? {});
  const sorted = [...filtered].sort((a, b) => b.score - a.score);
  const limited = sorted.slice(0, limit);

  const query: SearchQuery = {
    id: cryptoRandomId("sq"),
    businessType: body.businessType,
    location: body.location,
    country: body.country,
    language: body.language,
    objective,
    filters: filterKeys,
    sources: providers.map((p) => p.id),
    limit,
    createdAt: new Date().toISOString(),
  };

  const usedIds = Array.from(new Set(limited.map((l) => l.source)));

  const response: SearchResponse = {
    leads: limited,
    meta: {
      query,
      total: limited.length,
      sourcesUsed: usedIds.length > 0 ? usedIds : providers.map((p) => p.id),
      durationMs: Date.now() - start,
      fallbackUsed,
      warnings: providerWarnings,
      missingSources: requestedButMissing,
    },
  };

  return NextResponse.json(response);
}
