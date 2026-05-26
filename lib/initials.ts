/**
 * "Aarav Sharma" → "AS"
 * "alice"        → "A"
 * "Test User"    → "TU"
 * "x"            → "X"
 * undefined/""   → "?"
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).join("");
}
