import * as React from "react";
import type { Plan } from "@/lib/plans";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userPlan?: Plan | null;
  onboardingCompleted?: boolean;
}

export function AppShell({
  children,
  userEmail = null,
  userPlan = null,
}: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar userEmail={userEmail} userPlan={userPlan} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
