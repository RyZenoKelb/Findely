import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizePlan, type Plan } from "@/lib/plans";

/** SHA-256 of a fixed string, used as a constant-time comparison baseline. */
const DUMMY_HASH = createHash("sha256").update("findely-dummy").digest("hex");

/** Constant-time hex string comparison. */
function hashesEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Token format: findely_{env}_{prefix}_{secret}
 *   - env: "live" in production, "test" elsewhere
 *   - prefix: 12 base62 chars — stored on the row for display/lookup
 *   - secret: 40 hex chars — never stored, only its SHA-256 hash is
 */

const PREFIX_LEN = 12;
const SECRET_BYTES = 20; // → 40 hex chars

const BASE62 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function base62(len: number): string {
  const buf = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += BASE62[buf[i] % 62];
  return out;
}

export function keyEnvLabel(): "live" | "test" {
  return env.isProduction ? "live" : "test";
}

export interface GeneratedKey {
  /** Full token — shown to the user exactly once. */
  fullKey: string;
  /** Stored as-is on the row (e.g. "findely_live_abc123def456"). */
  keyPrefix: string;
  /** SHA-256 hex digest of fullKey. */
  keyHash: string;
}

export function generateApiKey(): GeneratedKey {
  const envLabel = keyEnvLabel();
  const prefix = base62(PREFIX_LEN);
  const secret = randomBytes(SECRET_BYTES).toString("hex");
  const fullKey = `findely_${envLabel}_${prefix}_${secret}`;
  const keyPrefix = `findely_${envLabel}_${prefix}`;
  const keyHash = hashApiKey(fullKey);
  return { fullKey, keyPrefix, keyHash };
}

export function hashApiKey(fullKey: string): string {
  return createHash("sha256").update(fullKey).digest("hex");
}

/** Extract the `findely_{env}_{prefix}` portion from a full token. */
export function prefixFromKey(fullKey: string): string | null {
  const m = fullKey.match(/^(findely_(?:live|test)_[A-Za-z0-9]+)_/);
  return m ? m[1] : null;
}

export interface ResolvedApiKey {
  userId: string;
  keyId: string;
  plan: Plan;
  keyPrefix: string;
}

/**
 * Verify a Bearer token and return the owner. Returns null for invalid,
 * revoked, or unknown keys. Uses the admin client to bypass RLS for the
 * cross-user prefix lookup.
 *
 * Updates last_used_at on success (best-effort, ignored on failure).
 */
export async function resolveApiKey(
  fullKey: string
): Promise<ResolvedApiKey | null> {
  if (!fullKey.startsWith("findely_")) return null;
  const keyPrefix = prefixFromKey(fullKey);
  if (!keyPrefix) return null;

  const keyHash = hashApiKey(fullKey);

  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return null;
  }

  const { data: row } = await supabase
    .from("api_keys")
    .select("id, user_id, key_hash, key_prefix, revoked_at")
    .eq("key_prefix", keyPrefix)
    .maybeSingle();

  // Timing-safe comparison path: always runs, even when the row is missing
  // or revoked, so the latency doesn't leak prefix existence.
  const storedHash =
    row && !row.revoked_at && typeof row.key_hash === "string"
      ? row.key_hash
      : DUMMY_HASH;
  const matches = hashesEqual(storedHash, keyHash);
  if (!row || row.revoked_at || !matches) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", row.user_id)
    .maybeSingle();

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);

  return {
    userId: row.user_id,
    keyId: row.id,
    plan: normalizePlan(profile?.plan),
    keyPrefix: row.key_prefix,
  };
}

/** Extract a Bearer token from an Authorization header. */
export function readBearer(header: string | null): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return m ? m[1] : null;
}
