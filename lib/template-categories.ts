/** Stable list of categories every template gets sorted into. */
export const TEMPLATE_CATEGORIES = [
  "Business",
  "Education",
  "Healthcare",
  "Government",
  "Event",
  "Membership",
  "Other",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export function isTemplateCategory(v: unknown): v is TemplateCategory {
  return typeof v === "string" && (TEMPLATE_CATEGORIES as readonly string[]).includes(v);
}
