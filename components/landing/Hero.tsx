"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { AuroraText } from "@/components/ui/aurora-text";
import { useI18n } from "@/lib/i18n";
import { HeroBackground } from "./Backgrounds";
import { HeroPreview } from "./HeroPreview";

export function Hero() {
  const { t, locale } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-24 text-center lg:px-8 lg:pb-32 lg:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-3 py-1 text-xs font-medium text-muted-strong shadow-[0_0_0_1px_rgba(100,140,255,0.12),0_10px_30px_-20px_rgba(47,123,255,0.5)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent-cyan/70" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          </span>
          {t.hero.badge}
        </span>
        <h1 className="mx-auto mt-7 max-w-3xl text-balance text-[44px] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {t.hero.titleA}
          <br />
          <AuroraText className="text-glow">{t.hero.titleB}</AuroraText>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-muted-strong sm:text-base">
          {t.hero.subtitle}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <LinkButton
            href="/app/search"
            size="lg"
            rightIcon={<ArrowRight size={16} />}
          >
            {t.hero.ctaPrimary}
          </LinkButton>
          <LinkButton
            href="/app"
            size="lg"
            variant="outline"
            leftIcon={<PlayCircle size={16} />}
          >
            {t.hero.ctaSecondary}
          </LinkButton>
        </div>
        <p className="mt-5 text-xs text-muted">{t.hero.note}</p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent-cyan" />
            {locale === "fr" ? "Données Google Places" : "Google Places data"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent-cyan" />
            {locale === "fr"
              ? "Scoring par objectif"
              : "Objective-aware scoring"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent-cyan" />
            {locale === "fr" ? "Export CSV propre" : "Clean CSV export"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-accent-cyan" />
            {locale === "fr" ? "Français & Anglais" : "English & French"}
          </span>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl lg:mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(47,123,255,0.35), transparent 65%)",
            }}
          />
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
