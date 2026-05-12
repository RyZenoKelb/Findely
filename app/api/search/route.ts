import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/lib/auth";
import { env } from "@/lib/env";
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
import {
  assertAndReserveSearch,
  QuotaError,
  recordUsageEvent,
} from "@/lib/quota";
import { getRateLimitKey, rateLimit } from "@/lib/rateLimit";
import { resolveProviders } from "@/lib/sources";
import { googleMapsSource } from "@/lib/sources/googleMapsSource";
import { getPlanLimits } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  limit: z.number().int().min(1).max(1000).optional(),
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

  // ---- Auth / demo gate -----------------------------------------------------
  const profile = await getCurrentUserProfile();

  // ---- Plan lead-limit guard ------------------------------------------------
  // Prevent e.g. a free plan (100 leads/month) from launching a 1000-lead batch.
  if (profile) {
    const planLimits = getPlanLimits(profile.plan);
    const planMax = Math.min(planLimits.monthlyLeads, 1000);
    if (Number.isFinite(planMax) && limit > planMax) {
      return NextResponse.json(
        {
          error: `Your ${planLimits.label} plan allows at most ${planMax} leads per search. Upgrade to request more.`,
          code: "quota_exceeded",
        },
        { status: 403 }
      );
    }
  }
  if (!profile && !env.demoMode) {
    return NextResponse.json(
      { error: "Unauthorized", code: "unauthorized" },
      { status: 401 }
    );
  }

  // ---- Rate limit -----------------------------------------------------------
  const rlKey = getRateLimitKey(request, profile?.id ?? null);
  const rlMax = profile ? 20 : 5; // authed 20/min, demo 5/min
  const rl = rateLimit(rlKey, rlMax, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.resetMs / 1000)),
        },
      }
    );
  }

  // ---- Plan quota (authed only) --------------------------------------------
  // Reserves the search slot atomically via insert-then-re-aggregate, closing
  // the TOCTOU window where concurrent requests would all pass a plain read.
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
  const requestedButMissing = requestedSources.filter(
    (id) => !providers.some((p) => p.id === id)
  );
  let fallbackUsed = false;
  let supplementedLeads = rawLeads;
  if (rawLeads.length === 0) {
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
  const googleMeta = googleMapsSource.lastMeta;

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
      requestedLimit: limit,
      returnedCount: limited.length,
      ...(googleMeta
        ? {
            rawFetchedCount: googleMeta.rawFetchedCount,
            dedupedCount: googleMeta.dedupedCount,
            batchesRun: googleMeta.batchesRun,
            limitReached: googleMeta.limitReached,
            cappedByProvider: googleMeta.cappedByProvider,
            providerNotes: googleMeta.providerNotes,
          }
        : {}),
    },
  };

  // ---- Record usage (authed only, best-effort) ------------------------------
  if (profile) {
    const meta = {
      source: "ui",
      businessType: body.businessType,
      location: body.location,
      objective,
    };
    await Promise.all([
      // `search` usage_event already recorded by assertAndReserveSearch.
      limited.length > 0
        ? recordUsageEvent(profile.id, "lead_returned", limited.length, meta)
        : Promise.resolve(),
      // Persist the search itself so /app/searches can list it. Best-effort.
      (async () => {
        try {
          const supabase = await createSupabaseServerClient();
          await supabase.from("lead_searches").insert({
            user_id: profile.id,
            business_type: body.businessType,
            location: body.location,
            country: body.country ?? null,
            language: body.language ?? null,
            objective,
            filters: filterKeys,
            sources: providers.map((p) => p.id),
            result_count: limited.length,
            meta: {
              durationMs: Date.now() - start,
              fallbackUsed,
              sourcesUsed: usedIds,
            },
          });
        } catch {
          // Non-fatal — search result is already returned to the client.
        }
      })(),
    ]);
  }

  return NextResponse.json(response);
}
