import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";
import type { ShopPublicData } from "@/lib/validations/public-shop";

export type MinisiteEditorData = {
  shopId: string;
  shopSlug: string;
  template: MinisiteTemplate;
  accentHex: string;
  content: MinisiteContent;
  publicData: ShopPublicData;
};
