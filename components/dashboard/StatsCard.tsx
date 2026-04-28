import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon: Icon,
  accent,
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface bg-panel p-5",
        accent ? "border-accent/30" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </div>
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md",
            accent
              ? "bg-accent/10 text-accent-strong"
              : "bg-surface-2 text-muted-strong"
          )}
        >
          <Icon size={14} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
