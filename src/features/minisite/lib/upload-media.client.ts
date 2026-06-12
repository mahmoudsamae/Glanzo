"use client";

import { compressImageToWebp } from "@/lib/minisite/compress-image.client";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ShopMediaKind } from "@/lib/validations/minisite-editor";

export async function uploadShopMediaFile(
  shopId: string,
  kind: ShopMediaKind,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Nur Bilddateien erlaubt." };
  }

  let blob: Blob;
  try {
    blob = await compressImageToWebp(file);
  } catch {
    return { ok: false, message: "Bild konnte nicht verarbeitet werden." };
  }

  if (blob.size > 5 * 1024 * 1024) {
    return { ok: false, message: "Bild ist nach Komprimierung noch zu groß (max. 5 MB)." };
  }

  const path = `${shopId}/${kind}/${crypto.randomUUID()}.webp`;
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("shop-media").upload(path, blob, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, path };
}
