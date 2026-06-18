export function instagramProfileUrl(handle: string): string {
  const trimmed = handle.trim().replace(/^@/, "");
  if (!trimmed) {
    return "";
  }
  return `https://instagram.com/${encodeURIComponent(trimmed)}`;
}
