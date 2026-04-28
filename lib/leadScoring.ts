import type { Lead, LeadObjective } from "./leadTypes";

const SOURCE_CREDIBILITY: Record<string, number> = {
  google_maps: 10,
  google_search: 6,
  directory: 5,
  mock: 4,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function scoreLead(
  lead: Lead,
  objective: LeadObjective = "general"
): number {
  let score = 30;

  if (lead.name && lead.name.length >= 3) score += 8;
  if (lead.category) score += 4;
  if (lead.phone) score += 12;
  if (lead.address) score += 10;
  if (lead.website) score += 8;

  if (lead.phone && lead.address && lead.website) score += 6;

  score += SOURCE_CREDIBILITY[lead.source] ?? 3;

  switch (objective) {
    case "no_website":
      if (!lead.website) score += 18;
      else score -= 10;
      if (lead.phone || lead.address) score += 4;
      break;
    case "with_website":
      if (lead.website) score += 14;
      else score -= 14;
      break;
    case "with_phone":
      if (lead.phone) score += 14;
      else score -= 12;
      break;
    case "local":
      if (lead.address) score += 10;
      if (lead.phone) score += 6;
      break;
    case "seo_outreach":
      if (lead.website) score += 12;
      if (!lead.website) score -= 8;
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

  if (lead.category && lead.category.length >= 4 && lead.category.length <= 40)
    score += 2;

  return Math.round(clamp(score));
}
