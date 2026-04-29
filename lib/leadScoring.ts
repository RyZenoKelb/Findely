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
 * Breaks ties between otherwise-equal leads without destroying signal.
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

export interface ScoreBreakdown {
  score: number;
  factors: { label: string; value: number }[];
}

export function scoreLeadDetailed(
  lead: Lead,
  objective: LeadObjective = "general"
): ScoreBreakdown {
  const factors: { label: string; value: number }[] = [];
  const push = (label: string, value: number) => {
    if (value !== 0) factors.push({ label, value });
  };

  let score = 20;
  push("Base", 20);

  // Completeness
  if (lead.name && lead.name.length >= 3) {
    score += 10;
    push("Valid name", 10);
  }
  if (lead.category) {
    score += 5;
    push("Category present", 5);
  }
  if (lead.phone) {
    score += 15;
    push("Phone present", 15);
  }
  if (lead.address) {
    score += 10;
    push("Address present", 10);
  }
  if (lead.website) {
    score += 10;
    push("Website present", 10);
  }
  if (lead.phone && lead.address && lead.website) {
    score += 10;
    push("Full contact set", 10);
  }

  const cred = SOURCE_CREDIBILITY[lead.source] ?? 3;
  score += cred;
  push("Source credibility", cred);

  // Objective-aware adjustments
  switch (objective) {
    case "no_website":
      if (!lead.website) {
        score += 22;
        push("Matches objective (no website)", 22);
      } else {
        score -= 14;
        push("Has website (negative for objective)", -14);
      }
      if (lead.phone || lead.address) {
        score += 4;
        push("Reachable without website", 4);
      }
      break;
    case "with_website":
      if (lead.website) {
        score += 14;
        push("Has website", 14);
      } else {
        score -= 16;
        push("Missing website (negative for objective)", -16);
      }
      break;
    case "with_phone":
      if (lead.phone) {
        score += 14;
        push("Has phone", 14);
      } else {
        score -= 14;
        push("Missing phone (negative for objective)", -14);
      }
      break;
    case "local":
      if (lead.address) {
        score += 10;
        push("Local address", 10);
      }
      if (lead.phone) {
        score += 6;
        push("Callable locally", 6);
      }
      if (typeof lead.ratingCount === "number" && lead.ratingCount > 50) {
        score += 6;
        push("Trusted locally (reviews)", 6);
      }
      break;
    case "seo_outreach":
      if (lead.website) {
        score += 14;
        push("Website to optimize", 14);
      } else {
        score -= 10;
        push("No website (negative for SEO)", -10);
      }
      if (lead.phone) {
        score += 4;
        push("Reachable for outreach", 4);
      }
      break;
    case "marketing_outreach":
      if (lead.website) {
        score += 8;
        push("Website (asset for ads)", 8);
      }
      if (lead.phone) {
        score += 4;
        push("Phone (callable)", 4);
      }
      if (lead.address) {
        score += 2;
        push("Physical presence", 2);
      }
      if (typeof lead.ratingCount === "number" && lead.ratingCount > 50) {
        score += 5;
        push("Has market traction", 5);
      }
      break;
    case "b2b_clients":
      if (lead.website) {
        score += 10;
        push("B2B-ready website", 10);
      }
      if (lead.phone) {
        score += 6;
        push("Direct line", 6);
      }
      break;
    case "general":
    default:
      if (lead.phone && lead.address) {
        score += 5;
        push("Callable with address", 5);
      }
  }

  // Category hygiene
  if (lead.category && lead.category.length >= 4 && lead.category.length <= 40) {
    score += 2;
    push("Clean category", 2);
  }

  // Rating factors
  if (typeof lead.rating === "number") {
    score += 3;
    push("Has rating", 3);
    if (lead.rating >= 3.5 && lead.rating <= 4.7) {
      score += 5;
      push("Balanced rating", 5);
    } else if (lead.rating > 4.7) {
      score += 2;
      push("Top-rated", 2);
    }
  }
  if (typeof lead.ratingCount === "number") {
    if (lead.ratingCount > 100) {
      score += 6;
      push("Many reviews (>100)", 6);
    } else if (lead.ratingCount > 20) {
      score += 4;
      push("Moderate reviews (>20)", 4);
    } else if (lead.ratingCount > 0) {
      score += 1;
      push("Some reviews", 1);
    }
  }

  // Missing-contact penalty
  if (!lead.phone && !lead.website) {
    score -= 10;
    push("No reachable contact", -10);
  }

  // Deterministic variation
  const jitter = identityJitter(lead);
  score += jitter;
  if (jitter !== 0) push("Variation", jitter);

  return { score: Math.round(clamp(score)), factors };
}

export function scoreLead(
  lead: Lead,
  objective: LeadObjective = "general"
): number {
  return scoreLeadDetailed(lead, objective).score;
}
