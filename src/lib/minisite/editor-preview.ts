import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { ShopPublicData } from "@/lib/validations/public-shop";

/** Merge editor draft into cached public payload for live preview. */
export function mergeEditorDraftIntoPublicData(
  base: ShopPublicData,
  draft: MinisiteSaveInput,
): ShopPublicData {
  return {
    ...base,
    minisite: {
      template: draft.template,
      accent_hex: draft.accentHex,
      content: draft.content,
    },
  };
}
