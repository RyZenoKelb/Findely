"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { ActionResult } from "./lists";

export async function updateProfileName(
  name: string
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name cannot be empty." };
  if (trimmed.length > 80) return { ok: false, error: "Name too long." };

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/app/settings");
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}
