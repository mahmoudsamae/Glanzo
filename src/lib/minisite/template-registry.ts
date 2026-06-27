import type { MinisiteTemplate } from "@/lib/validations/public-shop";

export type MinisiteTemplateConfig = {
  key: MinisiteTemplate;
  label: string;
  themeClass: string;
  fontClass: string;
};

export const MINISITE_TEMPLATES: Record<MinisiteTemplate, MinisiteTemplateConfig> = {
  classic: {
    key: "classic",
    label: "Classic",
    themeClass: "theme-classic",
    fontClass: "minisite-font",
  },
  midnight: {
    key: "midnight",
    label: "Midnight",
    themeClass: "theme-midnight",
    fontClass: "minisite-font",
  },
  bold: {
    key: "bold",
    label: "Bold",
    themeClass: "theme-bold",
    fontClass: "minisite-font minisite-display",
  },
  signature: {
    key: "signature",
    label: "Signature",
    themeClass: "theme-signature",
    fontClass: "minisite-font",
  },
  boutique: {
    key: "boutique",
    label: "Boutique",
    themeClass: "theme-boutique",
    fontClass: "minisite-font",
  },
  nicoles: {
    key: "nicoles",
    label: "Nicoles",
    themeClass: "theme-nicoles",
    fontClass: "minisite-font minisite-nicoles-fonts",
  },
  flux: {
    key: "flux",
    label: "Flux",
    themeClass: "theme-flux",
    fontClass: "minisite-font minisite-display",
  },
  mecca: {
    key: "mecca",
    label: "Mecca Noir",
    themeClass: "theme-mecca",
    fontClass: "minisite-font minisite-mecca-fonts",
  },
  forge: {
    key: "forge",
    label: "Forge",
    themeClass: "theme-forge",
    fontClass: "minisite-font minisite-forge-fonts",
  },
};

export function getMinisiteTemplate(key: MinisiteTemplate): MinisiteTemplateConfig {
  return MINISITE_TEMPLATES[key];
}
