"use client";

import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

function buildStages(large: boolean, locale: "en" | "fr") {
  if (locale === "fr") {
    return large
      ? [
          "Recherche de plusieurs lots Google Places…",
          "Extraction des données entreprises…",
          "Déduplication des leads…",
          "Récupération des détails…",
          "Calcul des scores…",
          "Préparation des résultats…",
        ]
      : [
          "Recherche dans les sources…",
          "Extraction des données entreprises…",
          "Nettoyage des doublons…",
          "Calcul des scores…",
          "Préparation des résultats…",
        ];
  }
  return large
    ? [
        "Searching multiple Google Places batches…",
        "Extracting business data…",
        "Deduplicating leads…",
        "Fetching details…",
        "Scoring leads…",
        "Preparing results…",
      ]
    : [
        "Searching selected sources…",
        "Extracting business data…",
        "Cleaning duplicates…",
        "Scoring leads…",
        "Preparing results…",
      ];
}

export function LoadingSteps({
  running,
  large = false,
  locale = "en",
}: {
  running: boolean;
  large?: boolean;
  locale?: "en" | "fr";
}) {
  const stages = React.useMemo(() => buildStages(large, locale), [large, locale]);
  const [idx, setIdx] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [prevRunning, setPrevRunning] = React.useState(running);

  if (running !== prevRunning) {
    setPrevRunning(running);
    setIdx(0);
    setElapsed(0);
  }

  React.useEffect(() => {
    if (!running) return;
    const interval = large ? 1200 : 650;
    const id = setInterval(() => {
      setIdx((i) => (i < stages.length - 1 ? i + 1 : i));
    }, interval);
    return () => clearInterval(id);
  }, [running, large, stages.length]);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!running) return null;

  const title = locale === "fr" ? "Recherche de leads…" : "Finding leads…";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2 size={14} className="animate-spin text-accent" />
          {title}
        </div>
        <span className="font-mono text-xs text-muted">{elapsed}s</span>
      </div>
      <ol className="mt-4 space-y-2.5">
        {stages.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <li
              key={s}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                done || current ? "text-foreground" : "text-muted"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[10px]",
                  done
                    ? "border-success/40 bg-success/10 text-success"
                    : current
                      ? "border-accent/40 bg-accent/10 text-accent-strong"
                      : "border-white/[0.06] bg-white/[0.04] text-muted"
                )}
              >
                {done ? (
                  <Check size={10} />
                ) : current ? (
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                ) : (
                  i + 1
                )}
              </span>
              <span>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
