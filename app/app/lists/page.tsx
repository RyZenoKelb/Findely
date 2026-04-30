import { getCurrentUser } from "@/lib/auth";
import ListsView from "./ListsView";

export default async function ListsPage() {
  const user = await getCurrentUser();
  return <ListsView authed={Boolean(user)} />;
}
