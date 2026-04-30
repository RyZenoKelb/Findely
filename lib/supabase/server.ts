import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Uses the request cookie store so the auth session is
 * honored on the server.
 *
 * Throws if Supabase is not configured — callers should gate on
 * env.supabaseConfigured before calling from auth-protected paths.
 */
export async function createSupabaseServerClient() {
  const url = env.supabaseUrl;
  const anon = env.supabaseAnonKey;
  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Middleware handles session refresh in that case.
        }
      },
    },
  });
}
