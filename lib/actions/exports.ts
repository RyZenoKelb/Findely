"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { recordUsageEvent } from "@/lib/quota";

export interface RecordExportInput {
  leadCount: number;
  /** "selected" | "visible" | "list" | "all" — analytics label. */
  kind?: string;
  filename?: string;
  businessType?: string;
  location?: string;
  demoCount?: number;
  realCount?: number;
}

/**
 * Records a CSV export in public.exports and bumps the monthly usage counter.
 *
 * Best-effort: returns { ok: false } silently if the user is not authenticated
 * or if Supabase is not configured. Never throws — the CSV download has
 * already succeeded client-side by the time this runs.
 */
export async function recordExport(
  input: RecordExportInput
): Promise<{ ok: boolean }> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const metadata = {
      kind: input.kind ?? "all",
      filename: input.filename,
      businessType: input.businessType,
      location: input.location,
      demoCount: input.demoCount,
      realCount: input.realCount,
    };

    await supabase.from("exports").insert({
      user_id: user.id,
      type: "csv",
      lead_count: Math.max(0, Math.floor(input.leadCount)),
      metadata,
    });

    await recordUsageEvent(user.id, "export", 1, metadata);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
