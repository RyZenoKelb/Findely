import type { Lead } from "./leadTypes";

export type TriState = "all" | "yes" | "no";

export interface AdvancedFilterState {
  // Business data
  primaryActivityOnly: TriState;
  permanentlyClosed: TriState;
  hasWebsite: TriState;
  hasPhone: TriState;
  hasEmail: TriState;
  phoneType: "all" | "landline" | "mobile" | "other";

  // Social / online presence
  hasFacebook: TriState;
  hasInstagram: TriState;
  hasYouTube: TriState;
  hasTwitter: TriState;
  hasLinkedIn: TriState;
  hasTikTok: TriState;

  // Quality / signals
  ratingMin: number | null;
  ratingMax: number | null;
  reviewCountMin: number | null;
  reviewCountMax: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
  outreachReady: TriState;
  needsWebPresence: TriState;
  noWebsite: TriState;
  missingContact: TriState;

  // Site detection / enrichment (future-ready)
  hasContactForm: TriState;
  hasAdPixel: TriState;
  siteTechnologies: string[];
}

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilterState = {
  primaryActivityOnly: "all",
  permanentlyClosed: "all",
  hasWebsite: "all",
  hasPhone: "all",
  hasEmail: "all",
  phoneType: "all",

  hasFacebook: "all",
  hasInstagram: "all",
  hasYouTube: "all",
  hasTwitter: "all",
  hasLinkedIn: "all",
  hasTikTok: "all",

  ratingMin: null,
  ratingMax: null,
  reviewCountMin: null,
  reviewCountMax: null,
  scoreMin: null,
  scoreMax: null,
  outreachReady: "all",
  needsWebPresence: "all",
  noWebsite: "all",
  missingContact: "all",

  hasContactForm: "all",
  hasAdPixel: "all",
  siteTechnologies: [],
};

export function countActiveFilters(state: AdvancedFilterState): number {
  const def = DEFAULT_ADVANCED_FILTERS;
  let count = 0;

  const triKeys: (keyof AdvancedFilterState)[] = [
    "primaryActivityOnly",
    "permanentlyClosed",
    "hasWebsite",
    "hasPhone",
    "hasEmail",
    "hasFacebook",
    "hasInstagram",
    "hasYouTube",
    "hasTwitter",
    "hasLinkedIn",
    "hasTikTok",
    "outreachReady",
    "needsWebPresence",
    "noWebsite",
    "missingContact",
    "hasContactForm",
    "hasAdPixel",
  ];

  for (const k of triKeys) {
    if (state[k] !== def[k]) count++;
  }

  if (state.phoneType !== "all") count++;
  if (state.ratingMin !== null) count++;
  if (state.ratingMax !== null) count++;
  if (state.reviewCountMin !== null) count++;
  if (state.reviewCountMax !== null) count++;
  if (state.scoreMin !== null) count++;
  if (state.scoreMax !== null) count++;
  if (state.siteTechnologies.length > 0) count++;

  return count;
}

function matchTri(value: boolean, filter: TriState): boolean {
  if (filter === "all") return true;
  return filter === "yes" ? value : !value;
}

export function applyAdvancedFilters(
  leads: Lead[],
  filters: AdvancedFilterState
): Lead[] {
  return leads.filter((lead) => {
    if (!matchTri(Boolean(lead.website), filters.hasWebsite)) return false;
    if (!matchTri(Boolean(lead.phone), filters.hasPhone)) return false;

    if (filters.ratingMin !== null) {
      if (typeof lead.rating !== "number" || lead.rating < filters.ratingMin)
        return false;
    }
    if (filters.ratingMax !== null) {
      if (typeof lead.rating !== "number" || lead.rating > filters.ratingMax)
        return false;
    }
    if (filters.reviewCountMin !== null) {
      if (
        typeof lead.ratingCount !== "number" ||
        lead.ratingCount < filters.reviewCountMin
      )
        return false;
    }
    if (filters.reviewCountMax !== null) {
      if (
        typeof lead.ratingCount !== "number" ||
        lead.ratingCount > filters.reviewCountMax
      )
        return false;
    }
    if (filters.scoreMin !== null && lead.score < filters.scoreMin) return false;
    if (filters.scoreMax !== null && lead.score > filters.scoreMax) return false;

    if (filters.outreachReady !== "all") {
      const isReady = lead.signals.includes("outreach_ready");
      if (!matchTri(isReady, filters.outreachReady)) return false;
    }
    if (filters.needsWebPresence !== "all") {
      const needs = lead.signals.includes("needs_online_presence");
      if (!matchTri(needs, filters.needsWebPresence)) return false;
    }
    if (filters.noWebsite !== "all") {
      const noSite = !lead.website;
      if (!matchTri(noSite, filters.noWebsite)) return false;
    }
    if (filters.missingContact !== "all") {
      const missing = !lead.phone && !lead.website;
      if (!matchTri(missing, filters.missingContact)) return false;
    }

    return true;
  });
}
