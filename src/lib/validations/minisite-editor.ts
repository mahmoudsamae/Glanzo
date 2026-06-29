import { z } from "zod";

import { isTemplateStockPath } from "@/lib/minisite/template-stock-images";
import {
  minisiteContentSchema,
  minisiteTemplateSchema,
} from "@/lib/validations/public-shop";

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const minisiteSaveInputSchema = z.object({
  template: minisiteTemplateSchema,
  accentHex: hexColorSchema,
  content: minisiteContentSchema,
});

export type MinisiteSaveInput = z.infer<typeof minisiteSaveInputSchema>;

const MEDIA_KINDS = ["logo", "cover", "gallery", "service", "hero_video"] as const;
export type ShopMediaKind = (typeof MEDIA_KINDS)[number];

export function isValidShopMediaPath(
  shopId: string,
  path: string,
  kind?: ShopMediaKind,
): boolean {
  if (isTemplateStockPath(path)) {
    return true;
  }

  if (!shopId || shopId.includes("/") || shopId.includes("..")) {
    return false;
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length < 3) {
    return false;
  }

  const [prefix, segmentKind, ...rest] = segments;
  if (prefix !== shopId) {
    return false;
  }

  if (!MEDIA_KINDS.includes(segmentKind as ShopMediaKind)) {
    return false;
  }

  if (kind && segmentKind !== kind) {
    return false;
  }

  if (rest.length < 1 || rest.some((part) => !part || part.includes(".."))) {
    return false;
  }

  return true;
}

type MediaContentFields = {
  logo_path?: string | null;
  cover_path?: string | null;
  cover_video_path?: string | null;
  gallery?: string[] | null;
};

export function validateMinisiteMediaPaths(
  shopId: string,
  content: MediaContentFields,
): boolean {
  if (content.logo_path && !isValidShopMediaPath(shopId, content.logo_path, "logo")) {
    return false;
  }
  if (content.cover_path && !isValidShopMediaPath(shopId, content.cover_path, "cover")) {
    return false;
  }
  if (content.cover_video_path && !isValidShopMediaPath(shopId, content.cover_video_path, "hero_video")) {
    return false;
  }
  if (content.gallery) {
    for (const path of content.gallery) {
      if (!isValidShopMediaPath(shopId, path, "gallery")) {
        return false;
      }
    }
  }
  return true;
}
