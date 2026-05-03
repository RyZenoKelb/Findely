import { getCurrentUserProfile } from "@/lib/auth";
import { SettingsView } from "./SettingsView";

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();
  return (
    <SettingsView
      plan={profile?.plan ?? null}
      email={profile?.email ?? null}
    />
  );
}
