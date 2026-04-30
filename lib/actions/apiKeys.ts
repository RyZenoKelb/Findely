"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { generateApiKey } from "@/lib/apiKeys";
import { getPlanLimits, normalizePlan } from "@/lib/plans";

export interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export type CreateApiKeyResult =
  | { ok: true; fullKey: string; row: ApiKeyRow }
  | { ok: false; error: string };

export async function createApiKey(
  name: string
): Promise<CreateApiKeyResult> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Name is required." };
  }
  if (trimmed.length > 80) {
    return { ok: false, error: "Name must be 80 characters or fewer." };
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: "You must sign in to create API keys." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = normalizePlan(profile?.plan);
  const limits = getPlanLimits(plan);
  if (!limits.canUseApi) {
    return {
      ok: false,
      error: "Your plan does not include API access.",
    };
  }

  const { fullKey, keyPrefix, keyHash } = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      name: trimmed,
      key_prefix: keyPrefix,
      key_hash: keyHash,
    })
    .select("id, name, key_prefix, last_used_at, revoked_at, created_at")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message || "Could not create key." };
  }

  revalidatePath("/app/api-keys");
  return { ok: true, fullKey, row: data as ApiKeyRow };
}

export type RevokeApiKeyResult =
  | { ok: true }
  | { ok: false; error: string };

export async function revokeApiKey(id: string): Promise<RevokeApiKeyResult> {
  if (!id) return { ok: false, error: "Missing key id." };

  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: "You must sign in to revoke API keys." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/api-keys");
  return { ok: true };
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, last_used_at, revoked_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return (data as ApiKeyRow[] | null) ?? [];
  } catch {
    return [];
  }
}
