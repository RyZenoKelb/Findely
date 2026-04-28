import { Download, MapPin, Search } from "lucide-react";

interface Row {
  name: string;
  category: string;
  signal: string;
  signalTone: "warning" | "success" | "accent";
  score: number;
}

const ROWS: Row[] = [
  {
    name: "Saffron & Co.",
    category: "Restaurant · Paris",
    signal: "No website",
    signalTone: "warning",
    score: 92,
  },
  {
    name: "Atlas Pixel Studio",
    category: "Agency · London",
    signal: "High opportunity",
    signalTone: "success",
    score: 81,
  },
  {
    name: "Harbor Bistro",
    category: "Restaurant · NYC",
    signal: "Outreach ready",
    signalTone: "accent",
    score: 74,
  },
];

const TONE: Record<Row["signalTone"], string> = {
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  accent: "bg-accent/20 text-accent-strong",
};

function Score({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1 w-20 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent-cyan"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-foreground">
        {score}
      </span>
    </div>
  );
}

export function HeroPreview() {
  return (
    <div className="relative">
      <div className="glow-accent-strong relative overflow-hidden rounded-2xl border border-border-strong bg-surface">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
          <div className="ml-auto inline-flex items-center gap-2 rounded-md border border-border bg-white/5 px-2.5 py-1 text-[11px] text-muted-strong">
            <Search size={11} />
            findely.app / search
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4 text-sm">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-1.5">
            <Search size={13} className="text-muted" />
            <span className="text-foreground">restaurants</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-1.5">
            <MapPin size={13} className="text-muted" />
            <span className="text-foreground">Paris, France</span>
          </div>
          <span className="ml-auto hidden items-center gap-2 text-xs text-muted sm:inline-flex">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
            48 leads · Google Places
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground">
            <Download size={12} /> Export
          </button>
        </div>

        <div className="divide-y divide-border">
          {ROWS.map((r) => (
            <div
              key={r.name}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-6 px-6 py-4"
            >
              <div className="min-w-0">
                <div className="truncate text-[15px] font-medium text-foreground">
                  {r.name}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">
                  {r.category}
                </div>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TONE[r.signalTone]}`}
              >
                {r.signal}
              </span>
              <Score score={r.score} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
