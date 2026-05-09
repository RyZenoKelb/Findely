"use client";

import {
  BookmarkCheck,
  CreditCard,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { getPlanLimits, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

function isRouteActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/app") return false;
  return pathname.startsWith(href + "/");
}

interface SidebarProps {
  userEmail?: string | null;
  userPlan?: Plan | null;
}

function planLabel(plan: Plan, t: ReturnType<typeof useI18n>["t"]): string {
  const p = t.plans;
  switch (plan) {
    case "free":
      return p?.free ?? "Free";
    case "starter":
      return p?.starter ?? "Starter";
    case "pro":
      return p?.pro ?? "Pro";
    case "agency":
      return p?.agency ?? "Agency";
    case "api_starter":
      return p?.apiStarter ?? "API Starter";
    case "api_pro":
      return p?.apiPro ?? "API Pro";
    case "api_scale":
      return p?.apiScale ?? "API Scale";
    default:
      return plan;
  }
}

export function Sidebar({ userEmail = null, userPlan = null }: SidebarProps = {}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const canUseApi = userPlan ? getPlanLimits(userPlan).canUseApi : false;
  const LINKS = [
    { href: "/app", label: t.sidebar.overview, icon: LayoutDashboard },
    { href: "/app/search", label: t.sidebar.newSearch, icon: Search },
    {
      href: "/app/geo",
      label: t.sidebar.geoSearch ?? "Geo Search",
      icon: MapPin,
    },
    { href: "/app/lists", label: t.sidebar.leadLists, icon: ListChecks },
    {
      href: "/app/searches",
      label: t.sidebar.savedSearches,
      icon: BookmarkCheck,
    },
    { href: "/app/usage", label: t.sidebar.usage, icon: Gauge },
    {
      href: "/app/wallet",
      label: t.sidebar.wallet ?? "Wallet",
      icon: CreditCard,
    },
    ...(canUseApi
      ? [
          {
            href: "/app/api-keys",
            label: t.apiKeys?.sidebarLink ?? "API keys",
            icon: KeyRound,
          },
        ]
      : []),
    { href: "/app/settings", label: t.sidebar.settings, icon: Settings },
  ];

  return (
    <aside className="hidden h-dvh w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-background lg:flex">
      <div className="flex h-14 items-center border-b border-white/[0.06] px-5">
        <Logo href="/" />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
          {t.sidebar.workspace}
        </div>
        <ul className="flex flex-col gap-px">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isRouteActive(pathname ?? "", href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-md px-3 py-[7px] text-[13px] font-medium transition-colors",
                    active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-strong hover:bg-white/[0.04] hover:text-foreground"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(
                      "flex-none transition-colors",
                      active ? "text-accent-strong" : ""
                    )}
                  />
                  {label}
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-accent" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {userEmail && userPlan ? (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Sparkles size={12} className="text-accent-cyan" />
              {planLabel(userPlan, t)}
            </div>
            <p
              className="mt-1 truncate text-[11px] text-muted"
              title={userEmail}
            >
              {userEmail}
            </p>
            <div className="mt-3 flex gap-2">
              <LinkButton
                href="/app/usage"
                size="sm"
                variant="outline"
                className="flex-1 text-[11px]"
              >
                {t.sidebar.viewUsage}
              </LinkButton>
              <Link
                href="/signout"
                aria-label={t.auth?.signOut ?? "Sign out"}
                className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-white/[0.06] text-muted-strong transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <LogOut size={12} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Sparkles size={12} className="text-accent-cyan" />
              {t.sidebar.starterPlan}
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {t.sidebar.upgradeCopy}
            </p>
            <LinkButton
              href="/app/usage"
              size="sm"
              variant="outline"
              className="mt-3 w-full text-[11px]"
            >
              {t.sidebar.viewUsage}
            </LinkButton>
          </div>
        )}
      </div>
    </aside>
  );
}
