import { getCurrentUser } from "@/lib/auth";
import SearchView from "./SearchView";

export default async function SearchPage() {
  const user = await getCurrentUser();
  return <SearchView authed={Boolean(user)} />;
}
