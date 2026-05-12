import { getCurrentUserProfile } from "@/lib/auth";
import { countSavedLeads, listLeadLists } from "@/lib/data/lists";
import { recentSearches } from "@/lib/data/searches";
import { getUsageSummary, type UsageSummary } from "@/lib/quota";
import DashboardView, { type DashboardOverviewData } from "./DashboardView";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();

  let summary: UsageSummary | null = null;
  let overview: DashboardOverviewData | null = null;
  if (profile) {
    const [usageSummary, searches, lists, savedLeads] = await Promise.all([
      getUsageSummary(profile.id, profile.plan),
      recentSearches(6),
      listLeadLists(),
      countSavedLeads(),
    ]);
    summary = usageSummary;
    overview = {
      recentSearches: searches.map((s) => ({
        id: s.id,
        businessType: s.businessType,
        location: s.location,
        objective: s.objective,
        createdAt: s.createdAt,
      })),
      recentLists: lists.slice(0, 6).map((l) => ({
        id: l.id,
        name: l.name,
        leadCount: l.leadCount,
      })),
      savedLeadsCount: savedLeads,
    };
  }

  return (
    <DashboardView
      authed={Boolean(profile)}
      onboardingCompleted={profile?.onboarding_completed ?? false}
      email={profile?.email ?? null}
      profileName={profile?.full_name ?? null}
      summary={summary}
      overview={overview}
    />
  );
}
