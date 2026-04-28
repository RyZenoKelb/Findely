"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { HeroPreview } from "./HeroPreview";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 text-center lg:px-8 lg:pb-32 lg:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-3 py-1 text-xs font-medium text-muted-strong">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent-cyan/70" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          </span>
          {t.hero.badge}
        </span>
        <h1 className="mx-auto mt-7 max-w-3xl text-[44px] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {t.hero.titleA}
          <br />
          <span className="text-gradient text-glow">{t.hero.titleB}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-strong sm:text-base">
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

        <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
          <div className="absolute -inset-x-10 -top-10 bottom-0 bg-radial-fade opacity-80" />
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
