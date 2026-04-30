"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

/** Flip profiles.onboarding_completed → true for the current user. */
export async function completeOnboarding(): Promise<{ ok: boolean }> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
