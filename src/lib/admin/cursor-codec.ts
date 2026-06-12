/** Cursor for platform_list_shops: `{created_at}|{uuid}` */
export function encodeShopListCursor(createdAt: string, id: string): string {
  return `${createdAt}|${id}`;
}

export function decodeShopListCursor(cursor: string): { createdAt: string; id: string } | null {
  const parts = cursor.split("|");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  return { createdAt: parts[0], id: parts[1] };
}
