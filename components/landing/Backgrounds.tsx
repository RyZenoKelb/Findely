"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function AuroraLayer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute -left-[20%] -top-[10%] h-[50%] w-[55%] rounded-full opacity-50 blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-[10%] top-[5%] h-[40%] w-[40%] rounded-full opacity-40 blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[20%] h-[50%] w-[65%] rounded-full opacity-40 blur-[180px]"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export function DataGridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function FloatingLeadNodes({ className }: { className?: string }) {
  const nodes = [
    { top: "12%", left: "8%", s: 2, o: 0.6 },
    { top: "18%", left: "72%", s: 1.5, o: 0.4 },
    { top: "34%", left: "22%", s: 2.5, o: 0.7 },
    { top: "55%", left: "85%", s: 1.5, o: 0.35 },
    { top: "68%", left: "14%", s: 2, o: 0.5 },
    { top: "78%", left: "58%", s: 1.5, o: 0.3 },
    { top: "40%", left: "48%", s: 2, o: 0.5 },
    { top: "22%", left: "40%", s: 1.5, o: 0.35 },
  ];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {nodes.map((n, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            top: n.top,
            left: n.left,
            width: n.s,
            height: n.s,
            opacity: n.o,
            boxShadow:
              "0 0 8px 1px rgba(99,102,241,0.4), 0 0 2px 0 rgba(99,102,241,0.6)",
          }}
        />
      ))}
    </div>
  );
}

export function PageGlow({
  position = "top",
  tone = "blue",
  className,
}: {
  position?: "top" | "center" | "bottom";
  tone?: "blue" | "cyan" | "violet";
  className?: string;
}) {
  const y =
    position === "top" ? "-20%" : position === "center" ? "30%" : "95%";
  const color =
    tone === "cyan"
      ? "rgba(245,158,11,0.15)"
      : tone === "violet"
        ? "rgba(167,139,250,0.18)"
        : "rgba(99,102,241,0.2)";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0", className)}
      style={{ top: y, height: "60%" }}
    >
      <div
        className="mx-auto h-full w-[90%] max-w-5xl rounded-[50%] opacity-50 blur-[160px]"
        style={{
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export function NoiseLayer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.025]",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
      }}
    />
  );
}

export function HeroBackground({ className }: { className?: string }) {
  return (
    <>
      <AuroraLayer className={className} />
      <DataGridBackground />
      <FloatingLeadNodes />
      <PageGlow position="top" tone="blue" />
      <PageGlow position="bottom" tone="violet" />
      <NoiseLayer />
    </>
  );
}

export function PublicBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background",
        className
      )}
    >
      <div
        className="orb-animate absolute -left-[15%] -top-[10%] h-[50%] w-[45%] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
          "--orb-duration": "20s",
          "--orb-delay": "0s",
        } as React.CSSProperties}
      />
      <div
        className="orb-animate absolute right-[-10%] top-[15%] h-[40%] w-[40%] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
          "--orb-duration": "25s",
          "--orb-delay": "-7s",
        } as React.CSSProperties}
      />
      <div
        className="orb-animate absolute bottom-[-15%] left-[20%] h-[45%] w-[50%] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          "--orb-duration": "28s",
          "--orb-delay": "-12s",
        } as React.CSSProperties}
      />
      <div
        className="orb-animate absolute bottom-[10%] right-[5%] h-[30%] w-[30%] rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          "--orb-duration": "16s",
          "--orb-delay": "-4s",
        } as React.CSSProperties}
      />
      <DataGridBackground />
      <NoiseLayer className="opacity-[0.02]" />
    </div>
  );
}
