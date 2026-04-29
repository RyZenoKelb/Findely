import type { Lead } from "./leadTypes";

const KEY = "findely:seenLeads";
const MAX = 5000;

export interface SeenEntry {
  fp: string;
  firstSeenAt: string;
  lastSeenAt: string;
  countSeen: number;
  lastQuery?: string;
}

export function fingerprint(
  lead: Pick<Lead, "name" | "phone" | "website" | "address" | "source">
): string {
  const name = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const phone = (lead.phone ?? "").replace(/\D/g, "");
  const domain = (lead.website ?? "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  const addr = (lead.address ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 40);
  return `${name}|${phone}|${domain}|${addr}|${lead.source}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): Map<string, SeenEntry> {
  if (!isBrowser()) return new Map();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    // Migrate legacy string[] format to SeenEntry[].
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      const nowIso = new Date().toISOString();
      const map = new Map<string, SeenEntry>();
      (parsed as string[]).forEach((fp) =>
        map.set(fp, {
          fp,
          firstSeenAt: nowIso,
          lastSeenAt: nowIso,
          countSeen: 1,
        })
      );
      return map;
    }
    if (Array.isArray(parsed)) {
      return new Map(parsed.map((e: SeenEntry) => [e.fp, e]));
    }
    return new Map();
  } catch {
    return new Map();
  }
}

function write(map: Map<string, SeenEntry>): void {
  if (!isBrowser()) return;
  try {
    const arr = Array.from(map.values()).slice(-MAX);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    /* ignore quota */
  }
}

export function hasBeenSeen(lead: Lead): boolean {
  return read().has(fingerprint(lead));
}

export function getSeenEntry(lead: Lead): SeenEntry | undefined {
  return read().get(fingerprint(lead));
}

export function markSeen(leads: Lead[], lastQuery?: string): void {
  if (!leads.length) return;
  const map = read();
  const nowIso = new Date().toISOString();
  for (const l of leads) {
    const fp = fingerprint(l);
    const prev = map.get(fp);
    if (prev) {
      map.set(fp, {
        ...prev,
        lastSeenAt: nowIso,
        countSeen: prev.countSeen + 1,
        lastQuery: lastQuery ?? prev.lastQuery,
      });
    } else {
      map.set(fp, {
        fp,
        firstSeenAt: nowIso,
        lastSeenAt: nowIso,
        countSeen: 1,
        lastQuery,
      });
    }
  }
  write(map);
}

export function annotateSeen<T extends Lead>(
  leads: T[]
): (T & { seenBefore: boolean })[] {
  const map = read();
  return leads.map((l) => ({ ...l, seenBefore: map.has(fingerprint(l)) }));
}

export function clearSeen(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}

export function seenCount(): number {
  return read().size;
}
