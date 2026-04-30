import type { Lead } from "./leadTypes";

/**
 * Spreadsheet formula prefixes — any cell value starting with one of these
 * characters is interpreted by Excel / Google Sheets / Numbers as a formula,
 * which can fetch remote resources or leak data via =HYPERLINK / =IMPORTXML.
 * Prefix with a leading single quote to force plain-text interpretation.
 */
const CSV_FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (s.length > 0 && CSV_FORMULA_PREFIXES.includes(s[0])) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export interface CsvOptions {
  includeSignals?: boolean;
  includeScore?: boolean;
  includeStatus?: boolean;
  includeDataType?: boolean;
}

type LeadLike = Lead & { seenBefore?: boolean };

/** "demo" when the lead came from the mock provider, "real" otherwise. */
export function leadDataType(lead: Pick<Lead, "source">): "demo" | "real" {
  return lead.source === "mock" ? "demo" : "real";
}

export function leadsToCsv(
  leads: LeadLike[],
  opts: CsvOptions = {
    includeSignals: true,
    includeScore: true,
    includeStatus: true,
    includeDataType: true,
  }
): string {
  const now = new Date().toISOString();
  const withDataType = opts.includeDataType ?? true;

  const headers = ["name", "category", "phone", "website", "address", "source"];
  if (withDataType) headers.push("dataType");
  if (opts.includeScore) headers.push("score");
  headers.push(
    "priorityLabel",
    "opportunityType",
    "opportunityReason",
    "recommendedAction",
    "dataQuality",
    "contactReadiness",
    "rating",
    "ratingCount",
    "mapsUrl"
  );
  if (opts.includeSignals) headers.push("signals");
  if (opts.includeStatus) headers.push("status");
  headers.push("notes", "seenBefore", "exportedAt", "createdAt");

  const rows = leads.map((l) => {
    const base: (string | number)[] = [
      l.name,
      l.category ?? "",
      l.phone ?? "",
      l.website ?? "",
      l.address ?? "",
      l.source,
    ];
    if (withDataType) base.push(leadDataType(l));
    if (opts.includeScore) base.push(String(l.score));
    base.push(
      l.priorityLabel ?? "",
      l.opportunityType ?? "",
      l.opportunityReason ?? "",
      l.recommendedAction ?? "",
      l.dataQualityLabel ?? "",
      l.contactReadinessLabel ?? "",
      typeof l.rating === "number" ? String(l.rating) : "",
      typeof l.ratingCount === "number" ? String(l.ratingCount) : "",
      l.mapsUrl ?? ""
    );
    if (opts.includeSignals) base.push(l.signals.join("|"));
    if (opts.includeStatus) base.push(l.status ?? "new");
    base.push(
      l.notes ?? "",
      l.seenBefore ? "true" : "false",
      l.exportedAt ?? now,
      l.createdAt
    );
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

/**
 * Builds a descriptive filename:
 *   findely-{businessType}-{location}-{YYYY-MM-DD}.csv
 * Falls back to "findely-leads-{YYYY-MM-DD}.csv" when no hints are provided.
 */
export function buildExportFilename(input: {
  businessType?: string;
  location?: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const datePart = `${yyyy}-${mm}-${dd}`;

  const slug = (s: string | undefined) =>
    (s ?? "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

  const bt = slug(input.businessType);
  const loc = slug(input.location);
  const parts = ["findely", bt, loc, datePart].filter(Boolean);
  return `${parts.join("-") || `findely-leads-${datePart}`}.csv`;
}

export function exportLeads(
  leads: LeadLike[],
  filename = "findely-leads.csv",
  opts?: CsvOptions
): void {
  const now = new Date().toISOString();
  const stamped = leads.map((l) => ({ ...l, exportedAt: l.exportedAt ?? now }));
  const csv = leadsToCsv(stamped, opts);
  downloadCsv(filename, csv);
}
