import type { Lead, LeadObjective } from "./leadTypes";

const SOURCE_CREDIBILITY: Record<string, number> = {
  google_maps: 5,
  mock: 2,
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function identityJitter(lead: Lead): number {
  const seed = `${lead.name}|${lead.phone ?? ""}|${lead.website ?? ""}|${lead.address ?? ""}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const normalized = (h >>> 0) / 0xffffffff;
  return Math.round(normalized * 10 - 5);
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

  let score = 30;
  push("Base", 30);

  if (lead.name && lead.name.length >= 3) {
    score += 5;
    push("Valid name", 5);
  }
  if (lead.category) {
    score += 3;
    push("Category present", 3);
  }
  if (lead.phone) {
    score += 8;
    push("Phone present", 8);
  }
  if (lead.address) {
    score += 5;
    push("Address present", 5);
  }
  if (lead.website) {
    score += 5;
    push("Website present", 5);
  }

  const cred = SOURCE_CREDIBILITY[lead.source] ?? 2;
  score += cred;
  push("Source credibility", cred);

  switch (objective) {
    case "no_website":
      if (!lead.website) {
        score += 12;
        push("Matches objective (no website)", 12);
      } else {
        score -= 8;
        push("Has website (less relevant)", -8);
      }
      if (lead.phone || lead.address) {
        score += 3;
        push("Reachable without website", 3);
      }
      break;
    case "with_website":
      if (lead.website) {
        score += 8;
        push("Has website", 8);
      } else {
        score -= 10;
        push("Missing website", -10);
      }
      break;
    case "with_phone":
      if (lead.phone) {
        score += 8;
        push("Has phone", 8);
      } else {
        score -= 10;
        push("Missing phone", -10);
      }
      break;
    case "local":
      if (lead.address) {
        score += 6;
        push("Local address", 6);
      }
      if (lead.phone) {
        score += 4;
        push("Callable locally", 4);
      }
      if (typeof lead.ratingCount === "number" && lead.ratingCount > 50) {
        score += 4;
        push("Trusted locally (reviews)", 4);
      }
      break;
    case "seo_outreach":
      if (lead.website) {
        score += 10;
        push("Website to optimize", 10);
      } else {
        score += 4;
        push("No website (opportunity)", 4);
      }
      if (lead.phone) {
        score += 3;
        push("Reachable for outreach", 3);
      }
      break;
    case "marketing_outreach":
      if (lead.website) {
        score += 5;
        push("Website (asset for ads)", 5);
      } else {
        score += 3;
        push("No website (marketing need)", 3);
      }
      if (lead.phone) {
        score += 3;
        push("Phone (callable)", 3);
      }
      if (typeof lead.ratingCount === "number" && lead.ratingCount > 50) {
        score += 3;
        push("Has market traction", 3);
      }
      break;
    case "b2b_clients":
      if (lead.website) {
        score += 6;
        push("B2B-ready website", 6);
      }
      if (lead.phone) {
        score += 4;
        push("Direct line", 4);
      }
      break;
    case "general":
    default:
      if (lead.phone && lead.address) {
        score += 4;
        push("Callable with address", 4);
      }
  }

  if (typeof lead.rating === "number") {
    if (lead.rating >= 3.5 && lead.rating <= 4.7) {
      score += 4;
      push("Balanced rating (3.5-4.7)", 4);
    } else if (lead.rating > 4.7) {
      score += 2;
      push("Top-rated (may be inflated)", 2);
    } else if (lead.rating >= 2.0) {
      score += 1;
      push("Has rating", 1);
    }
  }
  if (typeof lead.ratingCount === "number") {
    if (lead.ratingCount > 100) {
      score += 4;
      push("Many reviews (>100)", 4);
    } else if (lead.ratingCount > 20) {
      score += 2;
      push("Moderate reviews (>20)", 2);
    } else if (lead.ratingCount > 0) {
      score += 1;
      push("Some reviews", 1);
    }
  }

  if (!lead.phone && !lead.website) {
    score -= 12;
    push("No reachable contact", -12);
  }

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
