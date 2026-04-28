"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n, type Dict } from "@/lib/i18n";

function titleFor(pathname: string, t: Dict): { title: string; sub?: string } {
  if (pathname === "/app")
    return { title: t.app.welcomeTitle, sub: t.app.welcomeSub };
  if (pathname.startsWith("/app/search"))
    return {
      title: t.sidebar.newSearch,
      sub: t.app.quickSearchTitle,
    };
  if (pathname.startsWith("/app/lists"))
    return { title: t.sidebar.leadLists, sub: t.app.savedListsTitle };
  if (pathname.startsWith("/app/searches"))
    return { title: t.sidebar.savedSearches, sub: t.app.recentSearches };
  if (pathname.startsWith("/app/usage"))
    return { title: t.usage.currentPlan, sub: t.usage.thisCycle };
  if (pathname.startsWith("/app/settings"))
    return { title: t.sidebar.settings, sub: t.settings.searchDefaultsSub };
  return { title: t.sidebar.overview };
}

export function Topbar() {
  const pathname = usePathname() ?? "/app";
  const { t } = useI18n();
  const current = titleFor(pathname, t);

  return (
    <header className="sticky top-0 z-20 glass border-b border-border">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
                {current.title}
              </h1>
              <Badge tone="outline" className="hidden md:inline-flex">
                {t.topbar.demo}
              </Badge>
            </div>
            {current.sub ? (
              <p className="truncate text-xs text-muted">{current.sub}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <LinkButton
            href="/app/search"
            size="sm"
            leftIcon={<Search size={14} />}
          >
            {t.topbar.quickSearch}
          </LinkButton>
          <Link
            href="/"
            className="hidden h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs text-muted-strong hover:bg-surface-2 md:inline-flex"
          >
            {t.topbar.backToSite} <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </header>
  );
}
