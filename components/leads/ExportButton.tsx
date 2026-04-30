"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { recordExport } from "@/lib/actions/exports";
import {
  buildExportFilename,
  exportLeads,
  leadDataType,
} from "@/lib/csvExport";
import type { Lead } from "@/lib/leadTypes";
import { bumpUsage, getSettings } from "@/lib/storage";

export function ExportButton({
  leads,
  filename,
  label,
  size = "sm",
  variant = "outline",
  disabled,
  businessType,
  location,
  kind,
}: {
  leads: Lead[];
  filename?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
  businessType?: string;
  location?: string;
  /** "selected" | "visible" | "list" | "all" — analytics tag only. */
  kind?: string;
}) {
  function handleClick() {
    if (leads.length === 0) return;
    const settings = getSettings();

    const name =
      filename ?? buildExportFilename({ businessType, location });

    exportLeads(leads, name, {
      includeScore: settings.exportIncludeScore,
      includeSignals: settings.exportIncludeSignals,
      includeStatus: true,
      includeDataType: true,
    });

    // Local counter for demo / unauth users.
    bumpUsage({ exports: 1 });

    // Best-effort server-side tracking. Silently no-ops when unauthenticated.
    const demoCount = leads.filter((l) => leadDataType(l) === "demo").length;
    const realCount = leads.length - demoCount;
    void recordExport({
      leadCount: leads.length,
      kind,
      filename: name,
      businessType,
      location,
      demoCount,
      realCount,
    });
  }

  return (
    <Button
      size={size}
      variant={variant}
      leftIcon={<Download size={14} />}
      onClick={handleClick}
      disabled={disabled || leads.length === 0}
    >
      {label ?? `Export CSV (${leads.length})`}
    </Button>
  );
}
