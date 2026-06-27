import type { MinisiteTemplate } from "@/lib/validations/public-shop";

/** Templates with dedicated sub-routes (/about, /leistungen, /terminbuchung, /kontakt). */
export const MULTI_PAGE_MINISITE_TEMPLATES = ["nicoles", "forge"] as const satisfies readonly MinisiteTemplate[];

export type MultiPageMinisiteTemplate = (typeof MULTI_PAGE_MINISITE_TEMPLATES)[number];

export function isMultiPageMinisiteTemplate(
  template: MinisiteTemplate,
): template is MultiPageMinisiteTemplate {
  return (MULTI_PAGE_MINISITE_TEMPLATES as readonly string[]).includes(template);
}
