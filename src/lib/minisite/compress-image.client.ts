"use client";

const MAX_EDGE = 1920;
const WEBP_QUALITY = 0.82;

/**
 * Client-side resize/compress before shop-media upload (canvas, max 1920px long edge, webp).
 */
export async function compressImageToWebp(
  file: File,
  maxEdge: number = MAX_EDGE,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("WebP encoding failed"));
          return;
        }
        resolve(result);
      },
      "image/webp",
      WEBP_QUALITY,
    );
  });

  return blob;
}
