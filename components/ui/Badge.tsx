import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "outline";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-white/[0.04] text-muted-strong border-white/[0.06]",
  accent: "bg-accent/10 text-accent-strong border-accent/25",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  muted: "bg-white/[0.06] text-muted border-white/[0.06]",
  outline: "bg-transparent text-muted-strong border-white/[0.08]",
};

export function Badge({
  tone = "default",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
