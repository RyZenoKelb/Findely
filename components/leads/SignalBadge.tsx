import { Badge } from "@/components/ui/Badge";
import { SIGNAL_LABELS, type LeadSignal } from "@/lib/leadTypes";

type Tone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "outline";

const SIGNAL_TONE: Record<LeadSignal, Tone> = {
  no_website: "warning",
  has_website: "accent",
  has_phone: "muted",
  missing_phone: "danger",
  has_address: "muted",
  missing_contact_info: "danger",
  high_opportunity: "success",
  local_business: "muted",
  needs_online_presence: "warning",
  outreach_ready: "success",
};

export function SignalBadge({ signal }: { signal: LeadSignal }) {
  return <Badge tone={SIGNAL_TONE[signal]}>{SIGNAL_LABELS[signal]}</Badge>;
}

export function SignalBadges({
  signals,
  max = 3,
}: {
  signals: LeadSignal[];
  max?: number;
}) {
  const primary = signals.slice(0, max);
  const rest = signals.length - primary.length;
  return (
    <div className="flex flex-wrap gap-1">
      {primary.map((s) => (
        <SignalBadge key={s} signal={s} />
      ))}
      {rest > 0 ? <Badge tone="outline">+{rest}</Badge> : null}
    </div>
  );
}
