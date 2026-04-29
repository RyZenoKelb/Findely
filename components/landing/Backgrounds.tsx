import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Layered background system used across the public site.
 * All layers are pointer-events-none and rendered behind main content.
 */

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
        className="absolute -left-[20%] -top-[10%] h-[55%] w-[60%] rounded-full opacity-70 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-[10%] top-[5%] h-[45%] w-[45%] rounded-full opacity-60 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[20%] h-[55%] w-[70%] rounded-full opacity-60 blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.32) 0%, transparent 70%)",
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
            "linear-gradient(rgba(140,170,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function FloatingLeadNodes({ className }: { className?: string }) {
  const nodes = [
    { top: "12%", left: "8%", s: 3, o: 0.9 },
    { top: "18%", left: "72%", s: 2, o: 0.7 },
    { top: "34%", left: "22%", s: 4, o: 1 },
    { top: "55%", left: "85%", s: 2, o: 0.6 },
    { top: "68%", left: "14%", s: 3, o: 0.85 },
    { top: "78%", left: "58%", s: 2, o: 0.5 },
    { top: "40%", left: "48%", s: 3, o: 0.8 },
    { top: "22%", left: "40%", s: 2, o: 0.6 },
  ];
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {nodes.map((n, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent-cyan"
          style={{
            top: n.top,
            left: n.left,
            width: n.s,
            height: n.s,
            opacity: n.o,
            boxShadow:
              "0 0 12px 2px rgba(34,211,238,0.6), 0 0 2px 0 rgba(59,130,246,0.9)",
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
      ? "rgba(34,211,238,0.28)"
      : tone === "violet"
        ? "rgba(139,92,246,0.32)"
        : "rgba(59,130,246,0.38)";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0", className)}
      style={{ top: y, height: "60%" }}
    >
      <div
        className="mx-auto h-full w-[90%] max-w-5xl rounded-[50%] opacity-60 blur-[140px]"
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
        "pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]",
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
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 20%, rgba(34,211,238,0.15), transparent 55%), radial-gradient(ellipse 60% 50% at 0% 50%, rgba(139,92,246,0.16), transparent 55%)",
        }}
      />
      <DataGridBackground />
      <NoiseLayer />
    </div>
  );
}
