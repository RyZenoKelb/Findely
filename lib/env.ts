/**
 * Centralized env flag reader.
 * Never import process.env directly from UI / API code — import from here.
 */

export type FindelyEnv = "development" | "preview" | "production";

function boolish(v: string | undefined, fallback: boolean): boolean {
  if (v == null) return fallback;
  const s = v.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return fallback;
}

function readFindelyEnv(): FindelyEnv {
  const v =
    process.env.NEXT_PUBLIC_FINDELY_ENV ??
    process.env.NEXT_PUBLIC_APP_ENV ??
    "development";
  if (v === "production" || v === "preview" || v === "development") return v;
  return "development";
}

export const env = {
  get findelyEnv(): FindelyEnv {
    return readFindelyEnv();
  },

  get isProduction(): boolean {
    return readFindelyEnv() === "production";
  },

  /**
   * Unauthenticated demo searches + UI affordances.
   *
   * Fail-closed: defaults to `false` when the env var is absent. Local dev
   * should set `FINDELY_DEMO_MODE=true` explicitly in `.env.local`. This
   * prevents a misconfigured production deploy (missing
   * NEXT_PUBLIC_FINDELY_ENV) from silently exposing /app/* to anon users.
   */
  get demoMode(): boolean {
    return boolish(process.env.FINDELY_DEMO_MODE, false);
  },

  /**
   * Silent fallback to mockSource when Google Places is unavailable.
   * Fail-closed: defaults to `false`. Set `FINDELY_ALLOW_MOCK_FALLBACK=true`
   * explicitly in `.env.local` for local dev.
   */
  get allowMockFallback(): boolean {
    return boolish(process.env.FINDELY_ALLOW_MOCK_FALLBACK, false);
  },

  get enableGoogleMaps(): boolean {
    return boolish(process.env.FINDELY_ENABLE_GOOGLE_MAPS, true);
  },

  /** Supabase public URL — required for any auth flow. */
  get supabaseUrl(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
  },

  /** Supabase anon public key — safe to expose in the browser. */
  get supabaseAnonKey(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
  },

  /** Service role — server only. Never ship to the client bundle. */
  get supabaseServiceRoleKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
  },

  get supabaseConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  },
} as const;
