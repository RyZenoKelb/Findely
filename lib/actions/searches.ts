"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "./lists";

/**
 * Delete a saved search. /api/search inserts lead_searches rows after
 * successful searches (best-effort), so delete is the only write-side
 * operation callers need today.
 */
export async function deleteSavedSearch(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing search id." };
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("lead_searches")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/searches");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}
