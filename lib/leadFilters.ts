import type { Lead, LeadFilterKey } from "./leadTypes";

export interface AdvancedFilters {
  minScore?: number;
  requirePhone?: boolean;
  requireWebsite?: boolean;
  excludeDuplicates?: boolean;
  includeOnlyContactable?: boolean;
}

export function applyFilter(leads: Lead[], key: LeadFilterKey): Lead[] {
  switch (key) {
    case "all":
      return leads;
    case "without_website":
      return leads.filter((l) => !l.website);
    case "with_website":
      return leads.filter((l) => Boolean(l.website));
    case "with_phone":
      return leads.filter((l) => Boolean(l.phone));
    case "missing_contact":
      return leads.filter((l) => !l.phone && !l.website);
    case "has_address":
      return leads.filter((l) => Boolean(l.address));
    case "high_score":
      return leads.filter((l) => l.score >= 75);
    case "needs_online_presence":
      return leads.filter((l) => l.signals.includes("needs_online_presence"));
    case "outreach_ready":
      return leads.filter((l) => l.signals.includes("outreach_ready"));
  }
}

export function applyFilters(
  leads: Lead[],
  keys: LeadFilterKey[] = [],
  advanced: AdvancedFilters = {}
): Lead[] {
  let out = leads;
  const activeKeys = keys.filter((k) => k !== "all");
  for (const k of activeKeys) out = applyFilter(out, k);

  if (typeof advanced.minScore === "number") {
    const min = advanced.minScore;
    out = out.filter((l) => l.score >= min);
  }
  if (advanced.requirePhone) out = out.filter((l) => Boolean(l.phone));
  if (advanced.requireWebsite) out = out.filter((l) => Boolean(l.website));
  if (advanced.includeOnlyContactable)
    out = out.filter((l) => Boolean(l.phone) || Boolean(l.website));

  return out;
}
