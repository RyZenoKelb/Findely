"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; value: T })
  | { ok: false; error: string };

export interface LeadListRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Create a new lead list. Name is required, trimmed, ≤ 80 chars. */
export async function createLeadList(
  name: string,
  description?: string
): Promise<ActionResult<LeadListRecord>> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };
  if (trimmed.length > 80) {
    return { ok: false, error: "Name must be 80 characters or fewer." };
  }

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("lead_lists")
      .insert({
        user_id: user.id,
        name: trimmed,
        description: description?.trim() || null,
      })
      .select("id, name, description, created_at, updated_at")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Could not create list." };
    }
    revalidatePath("/app/lists");
    return { ok: true, value: data as LeadListRecord };
  } catch {
    return { ok: false, error: "You must sign in to create lists." };
  }
}

export async function renameLeadList(
  id: string,
  name: string,
  description?: string
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing list id." };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required." };

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("lead_lists")
      .update({ name: trimmed, description: description?.trim() || null })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/lists");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}

export async function deleteLeadList(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing list id." };
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("lead_lists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/lists");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}

/**
 * Upsert a lead into a list. Status and notes are optional. The
 * (list_id, lead_id) unique constraint ensures one row per membership.
 */
export async function addLeadToListAction(
  listId: string,
  leadId: string,
  extras: { status?: string; notes?: string } = {}
): Promise<ActionResult> {
  if (!listId || !leadId) {
    return { ok: false, error: "Missing list or lead id." };
  }
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("lead_list_items").upsert(
      {
        user_id: user.id,
        list_id: listId,
        lead_id: leadId,
        status: extras.status ?? "new",
        notes: extras.notes ?? null,
      },
      { onConflict: "list_id,lead_id" }
    );
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/lists");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}

export async function removeLeadFromListAction(
  listId: string,
  leadId: string
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("lead_list_items")
      .delete()
      .eq("user_id", user.id)
      .eq("list_id", listId)
      .eq("lead_id", leadId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/lists");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}
