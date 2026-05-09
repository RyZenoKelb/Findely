import { getCurrentUserProfile } from "@/lib/auth";
import GeoSearchView from "./GeoSearchView";

export default async function GeoPage() {
  const profile = await getCurrentUserProfile();
  return <GeoSearchView authed={Boolean(profile)} />;
}
