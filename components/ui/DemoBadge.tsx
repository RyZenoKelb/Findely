"use client";

import { FlaskConical, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface DemoBadgeProps {
  variant?: "demo" | "real";
  size?: "sm" | "md";
  className?: string;
}

/**
 * "Demo data" / "Real data" pill. Locale-aware via useI18n().
 * Tone: amber for demo, green for real — matches the product's semantic tokens.
 */
export function DemoBadge({
  variant = "demo",
  size = "sm",
  className,
}: DemoBadgeProps) {
  const { t } = useI18n();
  const d = t.demoMode;

  const label =
    variant === "real"
      ? d?.realBadge ?? "Real data"
      : d?.demoBadge ?? "Demo data";

  const Icon = variant === "real" ? ShieldCheck : FlaskConical;

  const base =
    "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight";
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  } as const;
  const tone =
    variant === "real"
      ? "border-success/30 bg-success/10 text-success"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <span className={cn(base, sizes[size], tone, className)}>
      <Icon size={size === "md" ? 12 : 10} />
      {label}
    </span>
  );
}
