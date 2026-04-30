/**
 * Returns a safe same-origin redirect path, or `fallback` if the input
 * would allow a cross-origin redirect or protocol-relative URL.
 *
 * Accepts only values that start with a single "/" followed by a
 * non-slash / non-backslash character. Rejects:
 *   - absent / empty / oversized (>512 chars)
 *   - absolute URLs (e.g. "https://evil.com")
 *   - protocol-relative ("//evil.com")
 *   - backslash-smuggled ("/\\evil.com")
 *   - CR/LF smuggling (header injection defense)
 *
 * Optional `requirePrefix` restricts the redirect target (e.g. proxy uses "/app").
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
  requirePrefix?: string
): string {
  if (typeof value !== "string") return fallback;
  if (value.length === 0 || value.length > 512) return fallback;
  if (value[0] !== "/") return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\r\n]/.test(value)) return fallback;
  if (requirePrefix && !value.startsWith(requirePrefix)) return fallback;
  return value;
}
