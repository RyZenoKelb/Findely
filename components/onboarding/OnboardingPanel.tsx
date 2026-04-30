"use client";

import { ArrowRight, Building2, Globe2, MapPin, Sparkles, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LS_KEY = "findely:onboardingCompleted";

/** useSyncExternalStore subscribe fn — listens for storage events. */
function subscribeToLocalStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

interface Template {
  title: string;
  niche: string;
  location: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  objective: "no_website" | "seo_outreach" | "marketing_outreach";
}

/**
 * First-login panel that surfaces 3 starter searches.
 *
 * Two persistence modes:
 *  - Authenticated (Phase 3): a server action will flip
 *    profiles.onboarding_completed. For now we mirror with localStorage so
 *    demo users also get a "complete once" experience.
 *  - Unauthenticated (demo): localStorage only.
 */
export function OnboardingPanel({
  initiallyCompleted = false,
  className,
  authed = false,
}: {
  initiallyCompleted?: boolean;
  className?: string;
  /** When true, dismissal also flips profiles.onboarding_completed on the server. */
  authed?: boolean;
}) {
  const { t } = useI18n();
  const o = t.onboarding;

  // Read the localStorage flag via useSyncExternalStore — the idiomatic React
  // way to snapshot an external store without setState-in-effect.
  const storedDismissed = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => {
      try {
        return window.localStorage.getItem(LS_KEY) === "true";
      } catch {
        return false;
      }
    },
    () => initiallyCompleted,
  );

  const [manuallyDismissed, setManuallyDismissed] =
    React.useState<boolean>(false);

  if (initiallyCompleted || storedDismissed || manuallyDismissed || !o) {
    return null;
  }

  const templates: Template[] = [
    {
      title: o.template1Title,
      niche: o.template1Niche,
      location: o.template1Location,
      icon: Building2,
      objective: "no_website",
    },
    {
      title: o.template2Title,
      niche: o.template2Niche,
      location: o.template2Location,
      icon: Globe2,
      objective: "seo_outreach",
    },
    {
      title: o.template3Title,
      niche: o.template3Niche,
      location: o.template3Location,
      icon: MapPin,
      objective: "marketing_outreach",
    },
  ];

  function href(tpl: Template) {
    const params = new URLSearchParams({
      q: tpl.niche,
      where: tpl.location,
      obj: tpl.objective,
    });
    return `/app/search?${params.toString()}`;
  }

  function handleDismiss() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LS_KEY, "true");
      } catch {
        // Ignore quota errors.
      }
    }
    setManuallyDismissed(true);
    if (authed) {
      void completeOnboarding();
    }
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-strong bg-gradient-to-br from-accent/[0.08] via-surface to-surface p-6 glow-accent",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={o.skip}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-white/5 hover:text-foreground"
      >
        <X size={14} />
      </button>
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-accent-cyan">
        <Sparkles size={12} />
        {o.eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {o.title}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-strong">{o.subtitle}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <Link
              key={tpl.title}
              href={href(tpl)}
              onClick={handleDismiss}
              className="group relative flex flex-col rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-strong">
                <Icon size={14} />
              </span>
              <div className="mt-3 text-sm font-medium leading-snug text-foreground">
                {tpl.title}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.15em] text-muted">
                {tpl.niche} · {tpl.location}
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-accent-cyan opacity-0 transition-opacity group-hover:opacity-100">
                {o.cta} <ArrowRight size={11} />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          {o.skip}
        </button>
      </div>
    </section>
  );
}
