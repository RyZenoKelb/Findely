import type {
  AppSettings,
  Lead,
  LeadList,
  SearchQuery,
  UsageStats,
} from "./leadTypes";
import { cryptoRandomId } from "./utils";

const K = {
  searches: "findely:searches",
  lists: "findely:lists",
  leads: "findely:savedLeads",
  settings: "findely:settings",
  usage: "findely:usage",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or serialization failure — ignore silently in V1
  }
}

/* Saved searches */

export function getSearches(): SearchQuery[] {
  return readJSON<SearchQuery[]>(K.searches, []);
}

export function saveSearch(q: SearchQuery): void {
  const list = getSearches();
  const existing = list.findIndex((s) => s.id === q.id);
  if (existing >= 0) list[existing] = q;
  else list.unshift(q);
  writeJSON(K.searches, list.slice(0, 100));
}

export function deleteSearch(id: string): void {
  writeJSON(
    K.searches,
    getSearches().filter((s) => s.id !== id)
  );
}

/* Lead lists */

export function getLists(): LeadList[] {
  return readJSON<LeadList[]>(K.lists, []);
}

export function createList(name: string, description?: string): LeadList {
  const now = new Date().toISOString();
  const list: LeadList = {
    id: cryptoRandomId("list"),
    name,
    description,
    leadIds: [],
    createdAt: now,
    updatedAt: now,
  };
  const all = getLists();
  all.unshift(list);
  writeJSON(K.lists, all);
  return list;
}

export function updateList(
  id: string,
  patch: Partial<LeadList>
): LeadList | null {
  const all = getLists();
  const idx = all.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const updated: LeadList = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  writeJSON(K.lists, all);
  return updated;
}

export function deleteList(id: string): void {
  writeJSON(
    K.lists,
    getLists().filter((l) => l.id !== id)
  );
}

export function addLeadToList(listId: string, leadId: string): void {
  const all = getLists();
  const idx = all.findIndex((l) => l.id === listId);
  if (idx < 0) return;
  if (!all[idx].leadIds.includes(leadId)) all[idx].leadIds.push(leadId);
  all[idx].updatedAt = new Date().toISOString();
  writeJSON(K.lists, all);
}

export function removeLeadFromList(listId: string, leadId: string): void {
  const all = getLists();
  const idx = all.findIndex((l) => l.id === listId);
  if (idx < 0) return;
  all[idx].leadIds = all[idx].leadIds.filter((x) => x !== leadId);
  all[idx].updatedAt = new Date().toISOString();
  writeJSON(K.lists, all);
}

/* Saved leads (cache) */

export function getSavedLeads(): Lead[] {
  return readJSON<Lead[]>(K.leads, []);
}

export function saveLead(lead: Lead): void {
  const all = getSavedLeads();
  const idx = all.findIndex((l) => l.id === lead.id);
  if (idx >= 0) all[idx] = lead;
  else all.unshift(lead);
  writeJSON(K.leads, all);
}

export function saveLeads(leads: Lead[]): void {
  const all = getSavedLeads();
  const map = new Map(all.map((l) => [l.id, l]));
  for (const l of leads) map.set(l.id, l);
  writeJSON(K.leads, Array.from(map.values()));
}

export function removeLead(id: string): void {
  writeJSON(
    K.leads,
    getSavedLeads().filter((l) => l.id !== id)
  );
}

/* Settings */

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCountry: "",
  defaultLanguage: "en",
  defaultSources: ["mock"],
  defaultLimit: 40,
  exportIncludeSignals: true,
  exportIncludeScore: true,
  theme: "dark",
  profileName: "Demo User",
  profileEmail: "demo@findely.app",
};

export function getSettings(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...readJSON<Partial<AppSettings>>(K.settings, {}),
  };
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...patch };
  writeJSON(K.settings, next);
  return next;
}

/* Usage */

export const DEFAULT_USAGE: UsageStats = {
  searchesRun: 0,
  leadsFound: 0,
  savedLeads: 0,
  exports: 0,
};

export function getUsage(): UsageStats {
  return readJSON<UsageStats>(K.usage, DEFAULT_USAGE);
}

export function bumpUsage(patch: Partial<UsageStats>): UsageStats {
  const cur = getUsage();
  const next: UsageStats = {
    searchesRun: cur.searchesRun + (patch.searchesRun ?? 0),
    leadsFound: cur.leadsFound + (patch.leadsFound ?? 0),
    savedLeads: cur.savedLeads + (patch.savedLeads ?? 0),
    exports: cur.exports + (patch.exports ?? 0),
  };
  writeJSON(K.usage, next);
  return next;
}

/* First-run bootstrap */

export function ensureDefaultLists(): void {
  if (!isBrowser()) return;
  if (localStorage.getItem(K.lists)) return;
  const now = new Date().toISOString();
  const seeded: LeadList[] = [
    "Web agency prospects",
    "SEO opportunities",
    "Local businesses",
    "To contact",
    "Contacted",
    "Interested",
  ].map((name) => ({
    id: cryptoRandomId("list"),
    name,
    leadIds: [],
    createdAt: now,
    updatedAt: now,
  }));
  writeJSON(K.lists, seeded);
}
