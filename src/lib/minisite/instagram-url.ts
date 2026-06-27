export function instagramProfileUrl(handle: string): string {
  const trimmed = handle.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const fromInstagram = trimmed.match(/instagram\.com\/([^/?#]+)/i)?.[1];
    if (fromInstagram) {
      return `https://instagram.com/${encodeURIComponent(fromInstagram.replace(/^@/, ""))}`;
    }
    return trimmed;
  }

  const clean = trimmed.replace(/^@/, "");
  return `https://instagram.com/${encodeURIComponent(clean)}`;
}
