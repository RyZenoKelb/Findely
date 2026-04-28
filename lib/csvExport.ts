import type { Lead } from "./leadTypes";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export interface CsvOptions {
  includeSignals?: boolean;
  includeScore?: boolean;
  includeStatus?: boolean;
}

type LeadLike = Lead & { seenBefore?: boolean };

export function leadsToCsv(
  leads: LeadLike[],
  opts: CsvOptions = {
    includeSignals: true,
    includeScore: true,
    includeStatus: true,
  }
): string {
  const headers = ["name", "category", "phone", "website", "address", "source"];
  if (opts.includeScore) headers.push("score");
  headers.push("rating", "ratingCount", "mapsUrl");
  if (opts.includeSignals) headers.push("signals");
  if (opts.includeStatus) headers.push("status");
  headers.push("seenBefore", "createdAt");

  const rows = leads.map((l) => {
    const base: (string | number)[] = [
      l.name,
      l.category ?? "",
      l.phone ?? "",
      l.website ?? "",
      l.address ?? "",
      l.source,
    ];
    if (opts.includeScore) base.push(String(l.score));
    base.push(
      typeof l.rating === "number" ? String(l.rating) : "",
      typeof l.ratingCount === "number" ? String(l.ratingCount) : "",
      l.mapsUrl ?? ""
    );
    if (opts.includeSignals) base.push(l.signals.join("|"));
    if (opts.includeStatus) base.push(l.status ?? "new");
    base.push(l.seenBefore ? "true" : "false", l.createdAt);
    return base.map(csvEscape).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLeads(
  leads: LeadLike[],
  filename = "findely-leads.csv",
  opts?: CsvOptions
): void {
  const csv = leadsToCsv(leads, opts);
  downloadCsv(filename, csv);
}
