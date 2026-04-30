import { getCurrentUserProfile } from "@/lib/auth";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  return (
    <DashboardView
      authed={Boolean(profile)}
      onboardingCompleted={profile?.onboarding_completed ?? false}
    />
  );
}
