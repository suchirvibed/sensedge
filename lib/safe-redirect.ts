/**
 * Sanitises a user-controlled return URL (e.g. the `from` query param on
 * /login). Rejects absolute URLs and protocol-relative URLs so an attacker
 * can't craft `/login?from=//evil.com` and phish the user after they sign in.
 *
 * Returns the URL if it's a same-origin path, otherwise `fallback`.
 */
export function safeReturnUrl(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  // Must start with single slash
  if (!raw.startsWith("/")) return fallback;
  // Reject protocol-relative `//evil.com`
  if (raw.startsWith("//")) return fallback;
  // Reject backslash tricks (some browsers normalise `/\evil.com`)
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}
