import { cn } from "@/lib/utils";

export function scoreTone(
  score: number
): "success" | "accent" | "warning" | "danger" {
  if (score >= 85) return "success";
  if (score >= 70) return "accent";
  if (score >= 50) return "warning";
  return "danger";
}

const TONE_BG: Record<ReturnType<typeof scoreTone>, string> = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-warning",
  danger: "bg-danger",
};

const TONE_TEXT: Record<ReturnType<typeof scoreTone>, string> = {
  success: "text-success",
  accent: "text-accent-strong",
  warning: "text-warning",
  danger: "text-danger",
};

export function LeadScore({
  score,
  compact,
  className,
}: {
  score: number;
  compact?: boolean;
  className?: string;
}) {
  const tone = scoreTone(score);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-white/[0.06]",
          compact ? "h-1 w-12" : "h-1.5 w-16"
        )}
      >
        <div
          className={cn("absolute inset-y-0 left-0", TONE_BG[tone])}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span
        className={cn(
          "font-mono tabular-nums",
          compact ? "text-[11px]" : "text-xs",
          TONE_TEXT[tone]
        )}
      >
        {score}
      </span>
    </div>
  );
}
