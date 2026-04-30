import { ApiKeysPanel } from "@/components/apiKeys/ApiKeysPanel";
import { listApiKeys } from "@/lib/actions/apiKeys";
import { getCurrentUserProfile } from "@/lib/auth";
import { getPlanLimits, normalizePlan } from "@/lib/plans";

export default async function ApiKeysPage() {
  const [profile, rows] = await Promise.all([
    getCurrentUserProfile(),
    listApiKeys(),
  ]);
  const plan = normalizePlan(profile?.plan);
  const canUseApi = getPlanLimits(plan).canUseApi;

  return <ApiKeysPanel initialRows={rows} canUseApi={canUseApi} />;
}
