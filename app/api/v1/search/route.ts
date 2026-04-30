import { NextResponse } from "next/server";
import { z } from "zod";
import { readBearer, resolveApiKey } from "@/lib/apiKeys";
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
import { apiCreditsForSearch, getPlanLimits } from "@/lib/plans";
import {
  assertCanApiSearch,
  QuotaError,
  recordUsageEvent,
} from "@/lib/quota";
import { getRateLimitKey, rateLimit } from "@/lib/rateLimit";
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

  // ---- Auth -----------------------------------------------------------------
  const token = readBearer(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "Missing Authorization: Bearer <token>", code: "unauthorized" },
      { status: 401 }
    );
  }
  const apiKey = await resolveApiKey(token);
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid or revoked API key", code: "unauthorized" },
      { status: 401 }
    );
  }

  // ---- Body -----------------------------------------------------------------
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "bad_request" },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "bad_request",
        issues: parsed.error.issues,
      },
      { status: 422 }
    );
  }

  const body = parsed.data;
  const limit = body.limit ?? 40;
  const objective: LeadObjective = body.objective ?? "general";
  const filterKeys: LeadFilterKey[] = body.filters ?? [];
  const providers = resolveProviders(body.sources);

  // ---- Rate limit (plan-based) ---------------------------------------------
  const planLimits = getPlanLimits(apiKey.plan);
  const perMin =
    apiKey.plan === "api_pro" || apiKey.plan === "api_scale"
      ? 120
      : apiKey.plan === "agency"
        ? 60
        : 30;
  const rl = rateLimit(
    getRateLimitKey(request, apiKey.userId),
    perMin,
    60_000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) },
      }
    );
  }

  // ---- Plan / credit pre-flight --------------------------------------------
  try {
    await assertCanApiSearch(apiKey.userId, apiKey.plan, 5);
  } catch (err) {
    if (err instanceof QuotaError) {
      return NextResponse.json(
        { error: err.detail, code: err.code },
        { status: err.status }
      );
    }
    throw err;
  }

  // ---- Search pipeline ------------------------------------------------------
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

  const cleaned = cleanAndDedupe(results.flat());
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
  const creditsCharged = apiCreditsForSearch(limited.length);

  const response: SearchResponse & {
    meta: SearchResponse["meta"] & {
      credits: { charged: number; remainingEstimate: number };
      apiKey: { prefix: string };
    };
  } = {
    leads: limited,
    meta: {
      query,
      total: limited.length,
      sourcesUsed: usedIds.length > 0 ? usedIds : providers.map((p) => p.id),
      durationMs: Date.now() - start,
      fallbackUsed: false,
      warnings: providerWarnings,
      missingSources: [],
      credits: {
        charged: creditsCharged,
        remainingEstimate: Math.max(
          0,
          planLimits.apiCredits - creditsCharged
        ),
      },
      apiKey: { prefix: apiKey.keyPrefix },
    },
  };

  // ---- Record usage (best-effort) ------------------------------------------
  const meta = {
    source: "api",
    keyId: apiKey.keyId,
    businessType: body.businessType,
    location: body.location,
  };
  await Promise.all([
    recordUsageEvent(apiKey.userId, "api_search", 1, meta),
    recordUsageEvent(apiKey.userId, "api_credit", creditsCharged, meta),
    limited.length > 0
      ? recordUsageEvent(apiKey.userId, "lead_returned", limited.length, meta)
      : Promise.resolve(),
  ]);

  return NextResponse.json(response);
}
