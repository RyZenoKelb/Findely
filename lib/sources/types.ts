import type { Lead, LeadObjective } from "../leadTypes";

export interface SourceSearchParams {
  businessType: string;
  location: string;
  country?: string;
  language?: string;
  objective?: LeadObjective;
  limit: number;
}

export type SourceStatus =
  | "available"
  | "missing_key"
  | "disabled_config"
  | "placeholder";

export interface SourceMetadata {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  badge?: string;
  status: SourceStatus;
  reason?: string;
}

export interface LeadSourceProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  /** Short label shown in the UI (e.g. "Mock", "Beta"). */
  badge?: string;
  /** Machine-readable status so the UI can explain why a source is unavailable. */
  statusInfo(): { status: SourceStatus; reason?: string };
  search(params: SourceSearchParams): Promise<Lead[]>;
}
