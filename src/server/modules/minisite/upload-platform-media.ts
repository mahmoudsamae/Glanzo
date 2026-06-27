"use server";

import { randomUUID } from "crypto";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { ShopMediaKind } from "@/lib/validations/minisite-editor";
import { getActor } from "@/server/modules/auth/get-actor";

const MAX_BYTES = 5 * 1024 * 1024;

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
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { ok: false, message: "Nur Bilddateien erlaubt." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, message: "Bild ist zu groß (max. 5 MB)." };
  }

  const path = `${shopId}/${kind}/${randomUUID()}.webp`;
  const uploadOptions = {
    contentType: file.type || "image/webp",
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
