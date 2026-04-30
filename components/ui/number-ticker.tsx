"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface NumberTickerProps {
  value: number;
  /** Animation duration in ms. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** "integer" (default) → `1,204`. "compact" → `1.2K`. */
  format?: "integer" | "compact";
  /** Fixed decimal places (integer format only). Defaults to 0. */
  decimals?: number;
  className?: string;
  /** If true, animate on mount instead of waiting for visibility. */
  immediate?: boolean;
  /** Delay before animation starts, in ms. */
  delay?: number;
}

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function NumberTicker({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  format = "integer",
  decimals = 0,
  className,
  immediate = false,
  delay = 0,
}: NumberTickerProps) {
  const { locale } = useI18n();
  const localeTag = locale === "fr" ? "fr-FR" : "en-US";

  const formatter = React.useMemo(() => {
    if (format === "compact") {
      return new Intl.NumberFormat(localeTag, {
        notation: "compact",
        maximumFractionDigits: 1,
      });
    }
    return new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [localeTag, format, decimals]);

  // Hydration-safe: SSR and first client render both output the final value.
  // Animation runs post-mount from 0 only on the client.
  const [display, setDisplay] = React.useState<number>(value);
  const ref = React.useRef<HTMLSpanElement>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    const node = ref.current;
    if (!node) return;

    // Reduced motion: skip animation entirely — display already equals value.
    if (prefersReducedMotion()) {
      startedRef.current = true;
      return;
    }

    let raf = 0;
    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const elapsed = ts - start - delay;
        if (elapsed < 0) {
          raf = requestAnimationFrame(step);
          return;
        }
        const progress = Math.min(1, elapsed / duration);
        const eased = easeOutExpo(progress);
        setDisplay(progress >= 1 ? value : value * eased);
        if (progress < 1) {
          raf = requestAnimationFrame(step);
        }
      };
      // Kick off from 0 on the next frame — state setter is inside rAF, not effect body.
      raf = requestAnimationFrame((ts) => {
        setDisplay(0);
        start = ts;
        raf = requestAnimationFrame(step);
      });
    };

    if (immediate || typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect();
            run();
            break;
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, delay, immediate]);

  const rendered =
    format === "integer" && decimals === 0
      ? formatter.format(Math.round(display))
      : formatter.format(display);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={`${prefix}${formatter.format(value)}${suffix}`}
    >
      {prefix}
      {rendered}
      {suffix}
    </span>
  );
}
