export type LeadStatus =
  | "new"
  | "saved"
  | "contacted"
  | "interested"
  | "ignored";

export type LeadSignal =
  | "no_website"
  | "has_website"
  | "has_phone"
  | "missing_phone"
  | "has_address"
  | "missing_contact_info"
  | "high_opportunity"
  | "local_business"
  | "needs_online_presence"
  | "outreach_ready";

export const ALL_SIGNALS: LeadSignal[] = [
  "no_website",
  "has_website",
  "has_phone",
  "missing_phone",
  "has_address",
  "missing_contact_info",
  "high_opportunity",
  "local_business",
  "needs_online_presence",
  "outreach_ready",
];

export const SIGNAL_LABELS: Record<LeadSignal, string> = {
  no_website: "No website",
  has_website: "Has website",
  has_phone: "Has phone",
  missing_phone: "Missing phone",
  has_address: "Has address",
  missing_contact_info: "Missing contact info",
  high_opportunity: "High opportunity",
  local_business: "Local business",
  needs_online_presence: "Needs online presence",
  outreach_ready: "Outreach ready",
};

export interface Lead {
  id: string;
  name: string;
  category?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  source: string;
  score: number;
  signals: LeadSignal[];
  notes?: string;
  status?: LeadStatus;
  createdAt: string;
  description?: string;
  geo?: { lat: number; lng: number } | null;
  mapsUrl?: string | null;
  rating?: number;
  ratingCount?: number;
}

export type LeadObjective =
  | "general"
  | "no_website"
  | "with_website"
  | "with_phone"
  | "local"
  | "seo_outreach"
  | "marketing_outreach"
  | "b2b_clients";

export const OBJECTIVE_LABELS: Record<LeadObjective, string> = {
  general: "General lead discovery",
  no_website: "Find businesses without websites",
  with_website: "Find businesses with websites",
  with_phone: "Find businesses with phone numbers",
  local: "Find local businesses",
  seo_outreach: "Find companies for SEO outreach",
  marketing_outreach: "Find companies for marketing services",
  b2b_clients: "Find potential B2B clients",
};

export type LeadFilterKey =
  | "all"
  | "without_website"
  | "with_website"
  | "with_phone"
  | "missing_contact"
  | "has_address"
  | "high_score"
  | "needs_online_presence"
  | "outreach_ready";

export const FILTER_LABELS: Record<LeadFilterKey, string> = {
  all: "All leads",
  without_website: "Without website",
  with_website: "With website",
  with_phone: "With phone number",
  missing_contact: "Missing contact info",
  has_address: "Has address",
  high_score: "High score only",
  needs_online_presence: "Needs online presence",
  outreach_ready: "Outreach ready",
};

export interface SearchQuery {
  id: string;
  businessType: string;
  location: string;
  country?: string;
  language?: string;
  objective?: LeadObjective;
  filters: LeadFilterKey[];
  sources: string[];
  limit: number;
  createdAt: string;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  leadIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  leads: Lead[];
  meta: {
    query: SearchQuery;
    total: number;
    sourcesUsed: string[];
    durationMs: number;
    fallbackUsed?: boolean;
    warnings?: { source: string; message: string }[];
    missingSources?: string[];
  };
}

export interface UsageStats {
  searchesRun: number;
  leadsFound: number;
  savedLeads: number;
  exports: number;
}

export interface AppSettings {
  defaultCountry: string;
  defaultLanguage: string;
  defaultSources: string[];
  defaultLimit: number;
  exportIncludeSignals: boolean;
  exportIncludeScore: boolean;
  theme: "dark" | "system";
  profileName: string;
  profileEmail: string;
}
