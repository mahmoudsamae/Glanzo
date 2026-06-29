"use server";

import { randomUUID } from "crypto";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { ShopMediaKind } from "@/lib/validations/minisite-editor";
import { getActor } from "@/server/modules/auth/get-actor";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
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

export async function uploadPlatformShopMediaAction(
  shopId: string,
  kind: ShopMediaKind,
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const actor = await getActor();
  if (!actor?.isPlatformAdmin) {
    return {
      ok: false,
      message:
        "Kein Plattform-Zugang. In Supabase SQL: INSERT INTO platform_admins (user_id) VALUES ('deine-user-id');",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, message: "Datei fehlt." };
  }

  const isHeroVideo = kind === "hero_video";
  if (isHeroVideo) {
    const mime = resolveHeroVideoMime(file);
    if (!mime) {
      return { ok: false, message: "Nur MP4- oder WebM-Videos erlaubt (.mp4 / .webm)." };
    }
  } else if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Nur Bilddateien erlaubt." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const maxBytes = isHeroVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > maxBytes) {
    return {
      ok: false,
      message: isHeroVideo ? "Video ist zu groß (max. 20 MB)." : "Bild ist zu groß (max. 5 MB).",
    };
  }

  const mime = isHeroVideo ? resolveHeroVideoMime(file)! : file.type;
  const ext = isHeroVideo ? (mime === "video/webm" ? "webm" : "mp4") : "webp";
  const path = `${shopId}/${kind}/${randomUUID()}.${ext}`;
  const uploadOptions = {
    contentType: mime || (isHeroVideo ? "video/mp4" : "image/webp"),
    upsert: false,
  };

  const supabase = await createServerSupabaseClient();
  let { error } = await supabase.storage.from("shop-media").upload(path, bytes, uploadOptions);

  if (error) {
    try {
      const admin = createServiceRoleClient();
      const fallback = await admin.storage.from("shop-media").upload(path, bytes, uploadOptions);
      error = fallback.error;
    } catch {
      return {
        ok: false,
        message:
          (error?.message ?? "Upload fehlgeschlagen") +
          " — prüfe SUPABASE_SERVICE_ROLE_KEY oder platform_admins.",
      };
    }
  }

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, path };
}
