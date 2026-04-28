import { directorySource } from "./directorySource";
import { googleMapsSource } from "./googleMapsSource";
import { googleSearchSource } from "./googleSearchSource";
import { mockSource } from "./mockSource";
import type { LeadSourceProvider, SourceMetadata } from "./types";

export const ALL_PROVIDERS: LeadSourceProvider[] = [
  mockSource,
  googleMapsSource,
  googleSearchSource,
  directorySource,
];

export function listSources(): SourceMetadata[] {
  return ALL_PROVIDERS.map((p) => {
    const info = p.statusInfo();
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      enabled: p.enabled,
      badge: p.badge,
      status: info.status,
      reason: info.reason,
    };
  });
}

export function getProvider(id: string): LeadSourceProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id);
}

/**
 * Return enabled providers matching the requested source ids. Unknown or
 * disabled providers are dropped. If nothing resolves, we fall back to mock so
 * the pipeline still returns something demo-worthy — the API route surfaces a
 * `fallbackUsed` flag so the UI can explain what happened.
 */
export function resolveProviders(
  requested?: string[]
): LeadSourceProvider[] {
  const ids = requested && requested.length > 0 ? requested : [mockSource.id];
  const providers = ids
    .map((id) => getProvider(id))
    .filter(
      (p): p is LeadSourceProvider =>
        Boolean(p) && (p as LeadSourceProvider).enabled
    );
  if (providers.length === 0) return [mockSource];
  return providers;
}

export type {
  LeadSourceProvider,
  SourceMetadata,
  SourceSearchParams,
  SourceStatus,
} from "./types";
