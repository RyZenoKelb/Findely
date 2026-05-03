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
        "group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5",
        accent
          ? "border-accent/30 bg-gradient-to-br from-accent/[0.08] via-surface to-surface"
          : "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          accent ? "bg-accent/20" : "bg-accent-cyan/10"
        )}
      />
      <div className="relative flex items-center justify-between gap-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {label}
        </div>
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            accent
              ? "bg-accent/15 text-accent-strong"
              : "bg-white/[0.04] text-muted-strong"
          )}
        >
          <Icon size={15} />
        </span>
      </div>
      <div className="relative mt-3 text-[32px] font-semibold leading-none tracking-tight text-foreground">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      {hint ? (
        <div className="relative mt-2 text-[11px] text-muted">{hint}</div>
      ) : null}
    </div>
  );
}
