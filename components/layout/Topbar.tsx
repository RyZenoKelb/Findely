"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n, type Dict } from "@/lib/i18n";

function titleFor(pathname: string, t: Dict): string {
  if (pathname === "/app") return t.sidebar.overview;
  if (pathname.startsWith("/app/search")) return t.sidebar.newSearch;
  if (pathname.startsWith("/app/lists")) return t.sidebar.leadLists;
  if (pathname.startsWith("/app/searches")) return t.sidebar.savedSearches;
  if (pathname.startsWith("/app/usage")) return t.sidebar.usage;
  if (pathname.startsWith("/app/settings")) return t.sidebar.settings;
  if (pathname.startsWith("/app/api-keys")) return t.apiKeys?.sidebarLink ?? "API keys";
  return t.sidebar.overview;
}

export function Topbar() {
  const pathname = usePathname() ?? "/app";
  const { t } = useI18n();
  const title = titleFor(pathname, t);

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
          <h1 className="hidden truncate text-[14px] font-semibold tracking-tight text-foreground sm:block">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
