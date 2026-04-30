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
  colors = ["#2F7BFF", "#60A5FA", "#22D3EE", "#00D4FF", "#A5B4FC"],
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
