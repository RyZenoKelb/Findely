import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { normalizePlan, type Plan } from "@/lib/plans";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: Plan;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Returns the current user or null. Does not throw. */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  if (!env.supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Enforces authentication. Throws an Error annotated with a `status` of 401
 * that route handlers can catch and translate into an HTTP response.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return user;
}

/** Fetches the profile row for the current user. */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!env.supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, plan, role, onboarding_completed, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  const planOverride = process.env.FINDELY_DEV_PLAN_OVERRIDE;
  const plan = planOverride ? normalizePlan(planOverride) : normalizePlan(data.plan);
  return { ...data, plan };
}

/** Shortcut — returns the plan id, defaulting to "free". */
export async function getUserPlan(): Promise<Plan> {
  const profile = await getCurrentUserProfile();
  return normalizePlan(profile?.plan);
}
