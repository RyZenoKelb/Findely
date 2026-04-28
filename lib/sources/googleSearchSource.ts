import type { Lead } from "../leadTypes";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

/**
 * Google Search provider — placeholder in V1.
 *
 * A future real implementation could parse SERP results for queries like
 * `"${businessType} ${location}"` and extract company websites and phones.
 */
export const googleSearchSource: LeadSourceProvider = {
  id: "google_search",
  name: "Google Search",
  description:
    "Surface businesses that rank organically for your niche and location.",
  enabled: Boolean(process.env.FINDELY_ENABLE_GOOGLE_SEARCH),
  badge: "Soon",
  statusInfo() {
    return {
      status: "placeholder",
      reason: "Coming soon — no scraper wired up yet.",
    };
  },
  async search(params: SourceSearchParams): Promise<Lead[]> {
    void params;
    return [];
  },
};
