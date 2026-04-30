import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getPlanLimits,
  isUnlimited,
  normalizePlan,
  type Plan,
} from "@/lib/plans";

export type UsageEventType =
  | "search"
  | "lead_returned"
  | "export"
  | "api_search"
  | "api_credit";

export interface MonthlyUsage {
  searches: number;
  leads: number;
  exports: number;
  apiSearches: number;
  apiCredits: number;
  /** ISO 8601 start of the current billing cycle (UTC). */
  cycleStart: string;
  /** ISO 8601 start of the next billing cycle (UTC). */
  cycleEnd: string;
}

export class QuotaError extends Error {
  readonly status: number;
  readonly code: "quota_exceeded" | "rate_limited";
  readonly detail: string;
  constructor(
    code: "quota_exceeded" | "rate_limited",
    detail: string,
    status = 402
  ) {
    super(detail);
    this.name = "QuotaError";
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

function currentCycleBounds(now: Date = new Date()) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );
  return { cycleStart: start.toISOString(), cycleEnd: end.toISOString() };
}

/**
 * Aggregates usage for the current calendar month (UTC). Returns zeros if
 * Supabase is not configured or the user has no events yet.
 */
export async function getMonthlyUsage(userId: string): Promise<MonthlyUsage> {
  const { cycleStart, cycleEnd } = currentCycleBounds();
  const zeros: MonthlyUsage = {
    searches: 0,
    leads: 0,
    exports: 0,
    apiSearches: 0,
    apiCredits: 0,
    cycleStart,
    cycleEnd,
  };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("usage_events")
      .select("type, quantity")
      .eq("user_id", userId)
      .gte("created_at", cycleStart)
      .lt("created_at", cycleEnd);

    if (error || !data) return zeros;

    const totals = { ...zeros };
    for (const row of data as { type: string; quantity: number }[]) {
      const q = Number(row.quantity) || 0;
      switch (row.type as UsageEventType) {
        case "search":
          totals.searches += q;
          break;
        case "lead_returned":
          totals.leads += q;
          break;
        case "export":
          totals.exports += q;
          break;
        case "api_search":
          totals.apiSearches += q;
          break;
        case "api_credit":
          totals.apiCredits += q;
          break;
      }
    }
    return totals;
  } catch {
    return zeros;
  }
}

/**
 * Pre-flight quota check for a UI search. Throws QuotaError on exhaustion.
 * Route handlers catch and translate to HTTP 402.
 */
export async function assertCanSearch(
  userId: string,
  plan: Plan | string | null | undefined,
  requestedLimit: number
): Promise<MonthlyUsage> {
  void requestedLimit;
  const limits = getPlanLimits(normalizePlan(plan));
  const usage = await getMonthlyUsage(userId);

  if (
    !isUnlimited(limits.monthlySearches) &&
    usage.searches >= limits.monthlySearches
  ) {
    throw new QuotaError(
      "quota_exceeded",
      `Monthly search quota reached (${limits.monthlySearches}).`
    );
  }

  if (!isUnlimited(limits.monthlyLeads) && usage.leads >= limits.monthlyLeads) {
    throw new QuotaError(
      "quota_exceeded",
      `Monthly lead quota reached (${limits.monthlyLeads}).`
    );
  }

  return usage;
}

/**
 * Pre-flight quota check for a v1 API search. API credits are a separate
 * bucket from UI leads.
 */
export async function assertCanApiSearch(
  userId: string,
  plan: Plan | string | null | undefined,
  estimatedCredits: number
): Promise<MonthlyUsage> {
  const limits = getPlanLimits(normalizePlan(plan));
  if (!limits.canUseApi) {
    throw new QuotaError(
      "quota_exceeded",
      "API access not included on this plan.",
      403
    );
  }

  const usage = await getMonthlyUsage(userId);
  const remaining = Math.max(0, limits.apiCredits - usage.apiCredits);

  if (!isUnlimited(limits.apiCredits) && remaining < estimatedCredits) {
    throw new QuotaError(
      "quota_exceeded",
      `API credit quota reached (${limits.apiCredits}).`
    );
  }
  return usage;
}

/**
 * Remaining lead budget for the current cycle. MAX_SAFE_INTEGER for
 * unlimited plans. Callers use this to clamp returned leads.
 */
export function remainingLeadBudget(
  plan: Plan | string | null | undefined,
  usage: Pick<MonthlyUsage, "leads">
): number {
  const limits = getPlanLimits(normalizePlan(plan));
  if (isUnlimited(limits.monthlyLeads)) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, limits.monthlyLeads - usage.leads);
}

/**
 * Reserve a search slot by inserting a `search` usage_event first, then
 * re-verifying the aggregate. If the post-insert total exceeds the plan
 * cap, the event is rolled back and a QuotaError is thrown.
 *
 * This closes the TOCTOU window in `assertCanSearch` — concurrent requests
 * will all insert their reservation, but only the first N (where N is the
 * remaining quota) survive the re-check; the rest get 402.
 *
 * Returns the reservation event id so the caller can delete it if the
 * search itself fails downstream (best-effort; rollback is non-fatal).
 */
export async function assertAndReserveSearch(
  userId: string,
  plan: Plan | string | null | undefined
): Promise<{ eventId: string | null }> {
  const limits = getPlanLimits(normalizePlan(plan));

  // Fast-path rejection before we write anything.
  await assertCanSearch(userId, plan, 0);

  if (isUnlimited(limits.monthlySearches)) {
    return { eventId: null };
  }

  let eventId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("usage_events")
      .insert({
        user_id: userId,
        type: "search",
        quantity: 1,
        metadata: { reservation: true },
      })
      .select("id")
      .single();
    eventId = (data?.id as string | undefined) ?? null;
  } catch {
    // If we can't reserve, fall back to the optimistic check — not ideal,
    // but never worse than the pre-fix state.
    return { eventId: null };
  }

  // Re-aggregate AFTER the reservation has landed.
  const usage = await getMonthlyUsage(userId);
  if (usage.searches > limits.monthlySearches) {
    // Over-limit — roll back our reservation and reject.
    if (eventId) {
      try {
        const supabase = await createSupabaseServerClient();
        await supabase.from("usage_events").delete().eq("id", eventId);
      } catch {
        // Non-fatal — the caller still gets the correct 402.
      }
    }
    throw new QuotaError(
      "quota_exceeded",
      `Monthly search quota reached (${limits.monthlySearches}).`
    );
  }

  return { eventId };
}

/** Records one usage event. Silently no-ops if Supabase is not configured. */
export async function recordUsageEvent(
  userId: string,
  type: UsageEventType,
  quantity = 1,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("usage_events").insert({
      user_id: userId,
      type,
      quantity,
      metadata,
    });
  } catch {
    // Best-effort — quota accounting must never take down the app.
  }
}
