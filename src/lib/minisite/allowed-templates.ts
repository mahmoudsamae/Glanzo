import type { MinisiteTemplate } from "@/lib/validations/public-shop";

export function normalizeAllowedMinisiteTemplates(
  allowed: MinisiteTemplate[] | null | undefined,
  fallback: MinisiteTemplate,
): MinisiteTemplate[] {
  const unique = [...new Set((allowed ?? []).filter(Boolean))];
  if (unique.length === 0) {
    return [fallback];
  }
  return unique;
}

export function isMinisiteTemplateAllowed(
  template: MinisiteTemplate,
  allowed: MinisiteTemplate[],
): boolean {
  return allowed.includes(template);
}

export function filterAllowedMinisiteTemplates(
  candidates: MinisiteTemplate[],
  allowed: MinisiteTemplate[],
): MinisiteTemplate[] {
  return candidates.filter((template) => allowed.includes(template));
}
