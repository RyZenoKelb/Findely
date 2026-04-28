"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportLeads } from "@/lib/csvExport";
import type { Lead } from "@/lib/leadTypes";
import { bumpUsage, getSettings } from "@/lib/storage";

export function ExportButton({
  leads,
  filename = "findely-leads.csv",
  label,
  size = "sm",
  variant = "outline",
  disabled,
}: {
  leads: Lead[];
  filename?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
}) {
  function handleClick() {
    if (leads.length === 0) return;
    const settings = getSettings();
    exportLeads(leads, filename, {
      includeScore: settings.exportIncludeScore,
      includeSignals: settings.exportIncludeSignals,
      includeStatus: true,
    });
    bumpUsage({ exports: 1 });
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
