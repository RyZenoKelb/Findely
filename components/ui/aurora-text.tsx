"use client";

import React, { memo } from "react";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

/**
 * AuroraText — electric, premium gradient shimmer for key accent phrases.
 * Palette is Findely-tuned (electric blue / cyan / soft indigo), not rainbow.
 * Animation is a gentle background-position sweep — no rotation, no scale jumps.
 */
export const AuroraText = memo(function AuroraText({
  children,
  className = "",
  colors = ["#6366f1", "#818cf8", "#f59e0b", "#fbbf24", "#a5b4fc"],
  speed = 1,
}: AuroraTextProps) {
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(120deg, ${colors.join(", ")}, ${colors[0]})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    backgroundSize: "220% 220%",
    animationDuration: `${7 / speed}s`,
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden="true"
        className="aurora-text-animate relative inline-block"
        style={gradientStyle}
      >
        {children}
      </span>
    </span>
  );
});
