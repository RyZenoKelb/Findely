"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Browser-side Supabase client — safe to call from "use client" components.
 *
 * Throws if Supabase env vars are missing. Callers should gate UI on
 * env.supabaseConfigured and render a setup prompt instead of a crash.
 */
export function createSupabaseBrowserClient() {
  const url = env.supabaseUrl;
  const anon = env.supabaseAnonKey;
  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createBrowserClient(url, anon);
}
