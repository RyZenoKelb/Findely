"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /** Duration of one full lap in seconds. */
  duration?: number;
  /** Length of the beam arc (in px). Larger = longer glow tail. */
  size?: number;
  /** Delay before the beam starts (in seconds). */
  delay?: number;
  /** Start color of the beam gradient. */
  colorFrom?: string;
  /** End color of the beam gradient. */
  colorTo?: string;
  /** Border thickness in px. */
  borderWidth?: number;
  /** Extra classes applied to the overlay. */
  className?: string;
  /** Border radius override (defaults to inherit from parent). */
  rounded?: string;
}

/**
 * BorderBeam — a premium traveling highlight around any rounded container.
 *
 * Place inside a `relative`-positioned, rounded parent. The beam is
 * pointer-events-none and sits above the parent background but under content.
 *
 * Uses a masked conic gradient that rotates via a CSS custom property (@property
 * --bb-angle) so only the gradient angle animates — GPU-friendly.
 * Respects `prefers-reduced-motion` via CSS (see globals.css).
 */
export function BorderBeam({
  duration = 9,
  size = 220,
  delay = 0,
  colorFrom = "#22D3EE",
  colorTo = "#2F7BFF",
  borderWidth = 1.5,
  className,
  rounded = "inherit",
}: BorderBeamProps) {
  const style = {
    "--bb-size": `${size}px`,
    "--bb-duration": `${duration}s`,
    "--bb-delay": `${delay}s`,
    "--bb-border": `${borderWidth}px`,
    "--bb-from": colorFrom,
    "--bb-to": colorTo,
    borderRadius: rounded,
  } as React.CSSProperties;

  return (
    <div
      aria-hidden
      className={cn(
        "border-beam pointer-events-none absolute inset-0 z-10",
        className
      )}
      style={style}
    />
  );
}
