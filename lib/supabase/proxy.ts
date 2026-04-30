import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safeRedirect";

/**
 * Refreshes the Supabase session on every matched request and gates /app
 * routes behind an authenticated user (unless FINDELY_DEMO_MODE allows
 * unauth browsing).
 *
 * If Supabase is not configured, this is a no-op — the app keeps working
 * in local/demo mode with localStorage persistence.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = env.supabaseUrl;
  const anon = env.supabaseAnonKey;
  if (!url || !anon) {
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: auth.getUser() is what triggers the session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAppRoute = path === "/app" || path.startsWith("/app/");

  if (isAppRoute && !user && !env.demoMode) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/signin";
    // Only round-trip /app/* paths through the redirect param — prevents
    // phishing via path-confusion chains.
    redirect.searchParams.set("redirect", safeRedirectPath(path, "/app", "/app"));
    return NextResponse.redirect(redirect);
  }

  return response;
}
