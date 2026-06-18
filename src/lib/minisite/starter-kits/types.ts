import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";

export type StarterKitTier = "free" | "pro";

export type StarterKitDefinition = {
  id: string;
  tier: StarterKitTier;
  label: string;
  tagline: string;
  description: string;
  template: MinisiteTemplate;
  accentHex: string;
  content: Partial<MinisiteContent>;
};

export type StarterKitApplyContext = {
  shopName: string;
  shopSlug: string;
  address?: string | null;
};
