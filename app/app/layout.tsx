import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();
  return (
    <AppShell
      userEmail={profile?.email ?? null}
      userPlan={profile?.plan ?? null}
      onboardingCompleted={profile?.onboarding_completed ?? false}
    >
      {children}
    </AppShell>
  );
}
