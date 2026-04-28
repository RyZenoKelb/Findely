import type { Lead } from "../leadTypes";
import type { LeadSourceProvider, SourceSearchParams } from "./types";

/**
 * Business directories provider — placeholder in V1.
 *
 * Future real implementation could pull from Yellow Pages, local chambers of
 * commerce, industry directories, and other public listings.
 */
export const directorySource: LeadSourceProvider = {
  id: "directory",
  name: "Business Directories",
  description:
    "Aggregate leads from Yellow Pages, local listings, and industry directories.",
  enabled: Boolean(process.env.FINDELY_ENABLE_DIRECTORY),
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
