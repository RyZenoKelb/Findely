import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SettingsSectionProps {
  id?: string;
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  tone?: "default" | "danger";
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column settings section — title/description on the left,
 * controls on the right. Matches modern SaaS settings patterns
 * without extra chrome.
 */
export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  aside,
  tone = "default",
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-2xl border p-5 transition-colors lg:p-6",
        tone === "danger"
          ? "border-danger/25 bg-gradient-to-br from-danger/[0.04] to-surface"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]/60",
        className
      )}
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,240px)_1fr] md:gap-8">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            {Icon ? (
              <span
                className={cn(
                  "mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                  tone === "danger"
                    ? "bg-danger/10 text-danger"
                    : "bg-accent/10 text-accent-strong"
                )}
              >
                <Icon size={14} />
              </span>
            ) : null}
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-foreground">
                {title}
              </h3>
              {description ? (
                <p className="mt-1 text-[12px] leading-relaxed text-muted">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {aside ? <div className="md:pt-1">{aside}</div> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
