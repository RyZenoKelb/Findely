import type { Lead } from "./leadTypes";

const KEY = "findely:seenLeads";
const MAX = 5000;

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

function read(): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>): void {
  if (!isBrowser()) return;
  try {
    const arr = Array.from(set).slice(-MAX);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    /* ignore quota */
  }
}

export function hasBeenSeen(lead: Lead): boolean {
  return read().has(fingerprint(lead));
}

export function markSeen(leads: Lead[]): void {
  if (!leads.length) return;
  const set = read();
  for (const l of leads) set.add(fingerprint(l));
  write(set);
}

export function annotateSeen<T extends Lead>(
  leads: T[]
): (T & { seenBefore: boolean })[] {
  const set = read();
  return leads.map((l) => ({ ...l, seenBefore: set.has(fingerprint(l)) }));
}

export function clearSeen(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}
