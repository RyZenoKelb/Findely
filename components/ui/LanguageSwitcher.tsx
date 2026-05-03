"use client";

import { Check, Globe } from "lucide-react";
import * as React from "react";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  variant = "ghost",
  size = "sm",
  className,
}: {
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  className?: string;
}) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border font-medium transition-colors",
          size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
          variant === "outline"
            ? "border-white/[0.08] bg-white/[0.04] text-foreground hover:bg-white/[0.06]"
            : "border-transparent text-muted-strong hover:bg-white/[0.04] hover:text-foreground"
        )}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={12} />
        <span className="font-mono">{current.short}</span>
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] shadow-xl"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === locale}
              onClick={() => {
                setLocale(l.code as Locale);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.04]",
                l.code === locale ? "text-foreground" : "text-muted-strong"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted">
                  {l.short}
                </span>
                {l.label}
              </span>
              {l.code === locale ? (
                <Check size={12} className="text-accent-strong" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
