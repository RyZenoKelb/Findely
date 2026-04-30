import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface ExportSummary {
  id: string;
  type: string;
  leadCount: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Recent export history for the current user. Returns [] when unauthenticated.
 *
 * Phase 4 scaffold — Phase 5 will render this on /app/usage and add
 * per-list export filters.
 */
export async function recentExports(limit = 20): Promise<ExportSummary[]> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("exports")
      .select("id, type, lead_count, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(100, limit)));

    if (!data) return [];
    return (
      data as Array<{
        id: string;
        type: string;
        lead_count: number;
        metadata: Record<string, unknown>;
        created_at: string;
      }>
    ).map((row) => ({
      id: row.id,
      type: row.type,
      leadCount: row.lead_count,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
