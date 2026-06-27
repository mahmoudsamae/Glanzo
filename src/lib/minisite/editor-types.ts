import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";
import type { ShopPublicData } from "@/lib/validations/public-shop";

export type MinisiteEditorData = {
  shopId: string;
  shopSlug: string;
  template: MinisiteTemplate;
  allowedTemplates: MinisiteTemplate[];
  accentHex: string;
  content: MinisiteContent;
  publicData: ShopPublicData;
  /** When true, owner dashboard must not allow edits (platform-managed site). */
  minisiteManaged?: boolean;
  /** Who is using the editor UI. */
  editorMode?: "owner" | "admin";
};
