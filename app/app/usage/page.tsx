import { getCurrentUserProfile } from "@/lib/auth";
import { recentExports } from "@/lib/data/exports";
import { getUsageSummary } from "@/lib/quota";
import { UsageView, type UsageViewProps } from "./UsageView";

export default async function UsagePage() {
  const profile = await getCurrentUserProfile();

  let dbUsage: UsageViewProps["dbUsage"] = null;
  let exportsHistory: UsageViewProps["exportsHistory"] = [];
  if (profile) {
    const [summary, recent] = await Promise.all([
      getUsageSummary(profile.id, profile.plan),
      recentExports(10),
    ]);
    dbUsage = {
      searches: summary.usage.searches,
      leads: summary.usage.leads,
      exports: summary.usage.exports,
      apiSearches: summary.usage.apiSearches,
      apiCredits: summary.usage.apiCredits,
      cycleEnd: summary.usage.cycleEnd,
    };
    exportsHistory = recent.map((e) => ({
      id: e.id,
      type: e.type,
      leadCount: e.leadCount,
      createdAt: e.createdAt,
    }));
  }

  return (
    <UsageView
      plan={profile?.plan ?? null}
      email={profile?.email ?? null}
      dbUsage={dbUsage}
      exportsHistory={exportsHistory}
    />
  );
}
