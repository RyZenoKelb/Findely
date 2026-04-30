import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Privileged Supabase client using the service role key.
 *
 * Bypasses RLS — use only in server-side code for admin tasks such as API
 * key lookup by prefix or cross-user analytics. NEVER import this from a
 * "use client" component. The `server-only` import throws at build time
 * if that accidentally happens.
 */
export function createSupabaseAdminClient() {
  const url = env.supabaseUrl;
  const serviceKey = env.supabaseServiceRoleKey;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client unavailable. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
