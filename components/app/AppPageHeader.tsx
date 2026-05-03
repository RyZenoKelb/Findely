import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppPageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page header for authenticated /app/* surfaces.
 * Keeps hierarchy identical across overview, settings, usage, api-keys.
 */
export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AppPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 pb-1",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="mt-1.5 text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-strong">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
