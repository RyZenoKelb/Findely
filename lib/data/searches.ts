import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface LeadSearchSummary {
  id: string;
  businessType: string;
  location: string;
  country: string | null;
  language: string | null;
  objective: string | null;
  resultCount: number;
  createdAt: string;
}

/**
 * Recent lead_searches rows for the current user. Returns [] when
 * unauthenticated.
 *
 * Phase 4 scaffold — Phase 5 will wire /app/searches + the /api/search
 * pipeline to insert into lead_searches and read from here.
 */
export async function recentSearches(
  limit = 50
): Promise<LeadSearchSummary[]> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("lead_searches")
      .select(
        "id, business_type, location, country, language, objective, result_count, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(200, limit)));

    if (!data) return [];
    return (
      data as Array<{
        id: string;
        business_type: string;
        location: string;
        country: string | null;
        language: string | null;
        objective: string | null;
        result_count: number;
        created_at: string;
      }>
    ).map((row) => ({
      id: row.id,
      businessType: row.business_type,
      location: row.location,
      country: row.country,
      language: row.language,
      objective: row.objective,
      resultCount: row.result_count,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
