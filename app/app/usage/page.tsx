import { getCurrentUserProfile } from "@/lib/auth";
import { recentExports } from "@/lib/data/exports";
import { getMonthlyUsage } from "@/lib/quota";
import { UsageView, type UsageViewProps } from "./UsageView";

export default async function UsagePage() {
  const profile = await getCurrentUserProfile();

  let dbUsage: UsageViewProps["dbUsage"] = null;
  let exportsHistory: UsageViewProps["exportsHistory"] = [];
  if (profile) {
    const [usage, recent] = await Promise.all([
      getMonthlyUsage(profile.id),
      recentExports(10),
    ]);
    dbUsage = {
      searches: usage.searches,
      leads: usage.leads,
      exports: usage.exports,
      cycleEnd: usage.cycleEnd,
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
