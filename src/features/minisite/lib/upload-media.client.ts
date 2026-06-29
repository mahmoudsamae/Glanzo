"use client";

import type { ShopMediaKind } from "@/lib/validations/minisite-editor";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { compressImageToWebp } from "@/lib/minisite/compress-image.client";

const HERO_VIDEO_MAX_BYTES = 20 * 1024 * 1024;
const HERO_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

function resolveHeroVideoMime(file: File): string | null {
  if (file.type && HERO_VIDEO_MIME_TYPES.has(file.type)) {
    return file.type;
  }

  const ext = file.name.toLowerCase().split(".").pop();
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  return null;
}

export async function uploadShopMediaFile(
  shopId: string,
  kind: ShopMediaKind,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  if (kind === "hero_video") {
    return uploadShopHeroVideoFile(shopId, file);
  }

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

async function uploadShopHeroVideoFile(
  shopId: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const mime = resolveHeroVideoMime(file);
  if (!mime) {
    return { ok: false, message: "Nur MP4- oder WebM-Videos erlaubt (.mp4 / .webm)." };
  }

  if (file.size > HERO_VIDEO_MAX_BYTES) {
    return { ok: false, message: "Video ist zu groß (max. 20 MB)." };
  }

  const ext = mime === "video/webm" ? "webm" : "mp4";
  const path = `${shopId}/hero_video/${crypto.randomUUID()}.${ext}`;
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from("shop-media").upload(path, file, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    const hint =
      /mime|content type|not allowed/i.test(error.message)
        ? " — Supabase: Migration „hero_video“ anwenden (MP4/WebM im Bucket erlauben)."
        : /row-level security|policy/i.test(error.message)
          ? " — Supabase: RLS für Ordner hero_video prüfen (shop_media_path_writable)."
          : "";
    return { ok: false, message: `${error.message}${hint}` };
  }

  return { ok: true, path };
}
