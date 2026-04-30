/**
 * Findely Option A plans.
 * Payments are NOT implemented; plans are stored in profiles.plan and
 * assigned manually in DB for the private beta.
 */

export type Plan =
  | "free"
  | "starter"
  | "pro"
  | "agency"
  | "api_starter"
  | "api_pro"
  | "api_scale";

export const UNLIMITED = Number.POSITIVE_INFINITY;

export interface PlanLimits {
  id: Plan;
  /** Display name (UI translations come from i18n). */
  label: string;
  /** EUR per month, 0 for free, null for custom. */
  priceEur: number | null;
  monthlyLeads: number;
  monthlySearches: number;
  monthlyExports: number;
  apiCredits: number;
  canUseApi: boolean;
  /** True for products whose primary axis is the public API. */
  isApiPlan: boolean;
  /** Optional UI hint (e.g. "Most popular"). i18n handled by consumer. */
  highlight?: "popular" | "best_value" | "custom";
}

export const PLANS: Record<Plan, PlanLimits> = {
  free: {
    id: "free",
    label: "Free",
    priceEur: 0,
    monthlyLeads: 100,
    monthlySearches: 5,
    monthlyExports: 3,
    apiCredits: 0,
    canUseApi: false,
    isApiPlan: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    priceEur: 19,
    monthlyLeads: 500,
    monthlySearches: 50,
    monthlyExports: UNLIMITED,
    apiCredits: 0,
    canUseApi: false,
    isApiPlan: false,
  },
  pro: {
    id: "pro",
    label: "Pro",
    priceEur: 49,
    monthlyLeads: 3000,
    monthlySearches: 300,
    monthlyExports: UNLIMITED,
    apiCredits: 0,
    canUseApi: false,
    isApiPlan: false,
    highlight: "popular",
  },
  agency: {
    id: "agency",
    label: "Agency",
    priceEur: 129,
    monthlyLeads: 12000,
    monthlySearches: 1000,
    monthlyExports: UNLIMITED,
    apiCredits: 1000,
    canUseApi: true,
    isApiPlan: false,
  },
  api_starter: {
    id: "api_starter",
    label: "API Starter",
    priceEur: 49,
    monthlyLeads: 0,
    monthlySearches: 0,
    monthlyExports: 0,
    apiCredits: 5000,
    canUseApi: true,
    isApiPlan: true,
  },
  api_pro: {
    id: "api_pro",
    label: "API Pro",
    priceEur: 149,
    monthlyLeads: 0,
    monthlySearches: 0,
    monthlyExports: 0,
    apiCredits: 25000,
    canUseApi: true,
    isApiPlan: true,
  },
  api_scale: {
    id: "api_scale",
    label: "API Scale",
    priceEur: null,
    monthlyLeads: 0,
    monthlySearches: 0,
    monthlyExports: 0,
    apiCredits: 100000,
    canUseApi: true,
    isApiPlan: true,
    highlight: "custom",
  },
};

export const PLAN_ORDER: Plan[] = [
  "free",
  "starter",
  "pro",
  "agency",
  "api_starter",
  "api_pro",
  "api_scale",
];

export const SAAS_PLANS: Plan[] = ["free", "starter", "pro", "agency"];
export const API_PLANS: Plan[] = ["api_starter", "api_pro", "api_scale"];

const ALLOWED: ReadonlySet<Plan> = new Set(PLAN_ORDER);

export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && ALLOWED.has(value as Plan);
}

export function normalizePlan(value: unknown): Plan {
  return isPlan(value) ? value : "free";
}

export function getPlanLimits(
  plan: Plan | string | null | undefined
): PlanLimits {
  return PLANS[normalizePlan(plan)];
}

/** API credit cost for a v1 search request. */
export function apiCreditsForSearch(returnedLeads: number): number {
  const base = 5;
  const perLead = Math.max(0, Math.floor(returnedLeads));
  return base + perLead;
}

export function isUnlimited(value: number): boolean {
  return !Number.isFinite(value);
}
