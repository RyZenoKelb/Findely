import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

/**
 * Number of seen_leads rows for the current user. Returns 0 when
 * unauthenticated.
 *
 * Phase 5 scaffold — Phase 6 will integrate the per-user dedup fingerprint
 * lookup into the /api/search pipeline (currently handled client-side by
 * lib/seenLeads.ts localStorage).
 */
export async function countSeenLeads(): Promise<number> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("seen_leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    return count ?? 0;
  } catch {
    return 0;
  }
}
