import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface LeadListSummary {
  id: string;
  name: string;
  description: string | null;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches all lead lists for the current user, with a lead count computed
 * from lead_list_items. Returns [] when unauthenticated or on error.
 *
 * Phase 4 scaffold — Phase 5 wires this into /app/lists + the drawer's
 * "Save to list" flow, replacing the current localStorage path.
 */
export async function listLeadLists(): Promise<LeadListSummary[]> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("lead_lists")
      .select(
        "id, name, description, created_at, updated_at, lead_list_items(count)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) return [];

    return (
      data as Array<{
        id: string;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        lead_list_items: { count: number }[];
      }>
    ).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      leadCount: row.lead_list_items?.[0]?.count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Total lead-list-items across all lists for the current user. Used by
 * /app/usage and the dashboard to display a "saved leads" counter.
 */
export async function countSavedLeads(): Promise<number> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("lead_list_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    return count ?? 0;
  } catch {
    return 0;
  }
}
