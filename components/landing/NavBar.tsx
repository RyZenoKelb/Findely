"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "/";

  const links = [
    { href: "/features", label: t.nav.features },
    { href: "/use-cases", label: t.nav.useCases },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/pricing", label: t.nav.pricing },
  ];

  return (
    <div className="sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4">
      <header className="glass-lighter mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-border-strong px-4 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] lg:px-5">
        <Logo href="/" />
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-medium transition-colors",
                  active
                    ? "bg-white/5 text-foreground"
                    : "text-muted-strong hover:bg-white/5 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <LinkButton
            href="/signin"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            {t.nav.signIn}
          </LinkButton>
          <LinkButton
            href="/app/search"
            size="sm"
            rightIcon={<ArrowRight size={12} />}
          >
            {t.nav.cta}
          </LinkButton>
        </div>
      </header>
    </div>
  );
}
