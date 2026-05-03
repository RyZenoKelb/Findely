"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { LinkButton } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/features", label: t.nav.features },
    { href: "/use-cases", label: t.nav.useCases },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/developers", label: t.nav.developers ?? "Developers" },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-200",
        scrolled
          ? "border-b border-white/[0.06] bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo href="/" />
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-strong hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
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
            href="/signup"
            size="sm"
            rightIcon={<ArrowRight size={12} />}
            className="hidden sm:inline-flex"
          >
            {t.auth?.signUpCta ?? t.nav.cta}
          </LinkButton>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] text-muted-strong md:hidden"
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-white/[0.06] bg-background/95 px-5 pb-4 pt-2 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-0.5 text-[13px]">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-muted-strong hover:bg-white/[0.04] hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <LinkButton
                href="/signin"
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {t.nav.signIn}
              </LinkButton>
              <LinkButton href="/signup" size="sm" className="flex-1">
                {t.auth?.signUpCta ?? t.nav.cta}
              </LinkButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
