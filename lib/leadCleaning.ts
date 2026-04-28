import type { Lead } from "./leadTypes";

function trimOrUndef(v: string | null | undefined): string | undefined {
  if (v === null || v === undefined) return undefined;
  const t = String(v).trim();
  return t.length === 0 ? undefined : t;
}

export function normalizePhone(
  v: string | null | undefined
): string | null | undefined {
  const t = trimOrUndef(v);
  if (!t) return t === undefined ? undefined : null;
  const keep = t.replace(/[^\d+]/g, "");
  if (keep.replace(/\D/g, "").length < 6) return null;
  return keep;
}

export function normalizeWebsite(
  v: string | null | undefined
): string | null | undefined {
  const t = trimOrUndef(v);
  if (!t) return t === undefined ? undefined : null;
  let url = t.toLowerCase();
  url = url.replace(/\/+$/, "");
  if (!/^https?:\/\//.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.protocol}//${parsed.hostname}${path}`;
  } catch {
    return null;
  }
}

export function cleanLead(lead: Lead): Lead {
  const name = trimOrUndef(lead.name) ?? "";
  const category = trimOrUndef(lead.category);
  const address = trimOrUndef(lead.address) ?? null;
  const phone = normalizePhone(lead.phone) ?? null;
  const website = normalizeWebsite(lead.website) ?? null;
  const notes = trimOrUndef(lead.notes);

  return {
    ...lead,
    name,
    category,
    address,
    phone,
    website,
    notes,
  };
}

function dedupeKey(lead: Lead): string {
  const base = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lead.phone) return `${base}|p:${lead.phone.replace(/\D/g, "")}`;
  if (lead.address)
    return `${base}|a:${lead.address.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  if (lead.website) return `${base}|w:${lead.website.toLowerCase()}`;
  return base;
}

export function cleanAndDedupe(leads: Lead[]): Lead[] {
  const cleaned = leads
    .map(cleanLead)
    .filter((l) => l.name && l.name.length >= 2);
  const seen = new Map<string, Lead>();
  for (const lead of cleaned) {
    const key = dedupeKey(lead);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, lead);
      continue;
    }
    const merged: Lead = {
      ...existing,
      phone: existing.phone ?? lead.phone ?? null,
      website: existing.website ?? lead.website ?? null,
      address: existing.address ?? lead.address ?? null,
      category: existing.category ?? lead.category,
      description: existing.description ?? lead.description,
    };
    seen.set(key, merged);
  }
  return Array.from(seen.values());
}
