import type { Lead, LeadObjective } from "./leadTypes";

const SOURCE_CREDIBILITY: Record<string, number> = {
  google_maps: 8,
  google_search: 5,
  directory: 4,
  mock: 3,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Deterministic variation in [-8, +8] based on the lead's identity.
 * Prevents every Google Places lead ending up on the same round number.
 */
function identityJitter(lead: Lead): number {
  const seed = `${lead.name}|${lead.phone ?? ""}|${lead.website ?? ""}|${lead.address ?? ""}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const normalized = (h >>> 0) / 0xffffffff;
  return Math.round(normalized * 16 - 8);
}

export function scoreLead(
  lead: Lead,
  objective: LeadObjective = "general"
): number {
  let score = 20;

  // Base completeness
  if (lead.name && lead.name.length >= 3) score += 10;
  if (lead.category) score += 5;
  if (lead.phone) score += 15;
  if (lead.address) score += 10;
  if (lead.website) score += 10;

  // Complete contact data
  if (lead.phone && lead.address && lead.website) score += 10;

  // Source credibility
  score += SOURCE_CREDIBILITY[lead.source] ?? 3;

  // Objective adjustments
  switch (objective) {
    case "no_website":
      if (!lead.website) score += 20;
      else score -= 10;
      if (lead.phone || lead.address) score += 4;
      break;
    case "with_website":
      if (lead.website) score += 12;
      else score -= 14;
      break;
    case "with_phone":
      if (lead.phone) score += 12;
      else score -= 12;
      break;
    case "local":
      if (lead.address) score += 10;
      if (lead.phone) score += 6;
      break;
    case "seo_outreach":
      if (lead.website) score += 12;
      else score -= 8;
      if (lead.phone) score += 4;
      break;
    case "marketing_outreach":
      if (lead.website) score += 8;
      if (lead.phone) score += 4;
      if (lead.address) score += 2;
      break;
    case "b2b_clients":
      if (lead.website) score += 10;
      if (lead.phone) score += 6;
      break;
    case "general":
    default:
      if (lead.phone && lead.address) score += 5;
  }

  // Category relevance
  if (lead.category && lead.category.length >= 4 && lead.category.length <= 40)
    score += 2;

  // Rating-based factors (Google Places enriches these)
  if (typeof lead.rating === "number") {
    score += 3;
    if (lead.rating >= 3.5 && lead.rating <= 4.7) score += 5;
    else if (lead.rating > 4.7) score += 2;
  }
  if (typeof lead.ratingCount === "number") {
    if (lead.ratingCount > 100) score += 6;
    else if (lead.ratingCount > 20) score += 4;
    else if (lead.ratingCount > 0) score += 1;
  }

  // Deterministic variation so equal leads don't collide on one round number
  score += identityJitter(lead);

  return Math.round(clamp(score));
}
