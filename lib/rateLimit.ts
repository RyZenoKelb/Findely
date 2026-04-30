/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Not distributed-safe — fine for single-node dev/beta. The interface is
 * deliberately narrow so it can be swapped for Upstash/Redis later without
 * touching callers.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

interface Bucket {
  windowStartMs: number;
  hits: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Throttle a key to `max` hits per `windowMs`. Returns whether the call is
 * allowed plus how many hits remain and when the window resets.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartMs >= windowMs) {
    buckets.set(key, { windowStartMs: now, hits: 1 });
    return { allowed: true, remaining: max - 1, resetMs: windowMs };
  }

  existing.hits += 1;
  const remaining = Math.max(0, max - existing.hits);
  const resetMs = windowMs - (now - existing.windowStartMs);

  return {
    allowed: existing.hits <= max,
    remaining,
    resetMs,
  };
}

/**
 * Derive a stable limiter key from a request — prefers authenticated user id,
 * falls back to a standard proxy header, otherwise a sentinel.
 */
export function getRateLimitKey(
  request: Request,
  userId: string | null
): string {
  if (userId) return `user:${userId}`;
  const headers = request.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anon";
  return `ip:${ip}`;
}
