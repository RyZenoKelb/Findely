"use client";

import {
  BookmarkCheck,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LogOut,
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

/**
 * Path-segment-aware active-route matcher.
 * Returns true only when `pathname === href` or `pathname` starts with
 * `href + "/"` — preventing `/app/search` from matching `/app/searches`.
 */
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
    { href: "/app/lists", label: t.sidebar.leadLists, icon: ListChecks },
    {
      href: "/app/searches",
      label: t.sidebar.savedSearches,
      icon: BookmarkCheck,
    },
    { href: "/app/usage", label: t.sidebar.usage, icon: Gauge },
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
    <aside className="hidden h-dvh w-[248px] shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo href="/app" />
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {t.sidebar.workspace}
        </div>
        <ul className="flex flex-col gap-0.5">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isRouteActive(pathname ?? "", href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-gradient-to-r from-accent/15 to-transparent text-foreground"
                      : "text-muted-strong hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <Icon size={15} className={active ? "text-accent-strong" : undefined} />
                  {label}
                  {active ? (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent-strong" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border p-4">
        {userEmail && userPlan ? (
          <div className="rounded-xl border border-border bg-gradient-to-br from-accent/[0.08] to-transparent p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles size={14} className="text-accent-cyan" />
              {planLabel(userPlan, t)}
            </div>
            <p className="mt-1 truncate text-xs text-muted-strong" title={userEmail}>
              {userEmail}
            </p>
            <div className="mt-3 flex gap-2">
              <LinkButton
                href="/app/usage"
                size="sm"
                variant="outline"
                className="flex-1"
              >
                {t.sidebar.viewUsage}
              </LinkButton>
              <Link
                href="/signout"
                aria-label={t.auth?.signOut ?? "Sign out"}
                className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-strong transition-colors hover:bg-surface-3 hover:text-foreground"
              >
                <LogOut size={13} />
              </Link>
            </div>
            {(() => {
              const limits = getPlanLimits(userPlan);
              if (!Number.isFinite(limits.monthlyLeads)) return null;
              return (
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted">
                  {limits.monthlyLeads.toLocaleString()} {t.usage.leads}/
                  {t.usage.thisCycle.toLowerCase()}
                </p>
              );
            })()}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-gradient-to-br from-accent/[0.08] to-transparent p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles size={14} className="text-accent-cyan" />
              {t.sidebar.starterPlan}
            </div>
            <p className="mt-1 text-xs text-muted-strong">
              {t.sidebar.upgradeCopy}
            </p>
            <LinkButton
              href="/app/usage"
              size="sm"
              variant="outline"
              className="mt-3 w-full"
            >
              {t.sidebar.viewUsage}
            </LinkButton>
          </div>
        )}
      </div>
    </aside>
  );
}
