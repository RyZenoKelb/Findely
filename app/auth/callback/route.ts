import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/safeRedirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after email confirmation / magic link clicks with
 * ?code=<one-time-code>. We exchange the code for a session (which sets
 * the auth cookie via the cookie adapter) and then redirect into the app.
 *
 * The ?next= query param is validated to prevent open-redirect abuse.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"), "/app");

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Fall through — the user will land on /signin and can retry.
    }
  }

  url.pathname = next;
  url.searchParams.delete("code");
  url.searchParams.delete("next");
  return NextResponse.redirect(url);
}
