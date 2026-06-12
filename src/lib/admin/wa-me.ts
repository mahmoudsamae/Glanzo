/** WhatsApp share URL with prefilled German invite text. */
export function buildWhatsAppShareUrl(phoneE164: string | null, message: string): string {
  const encoded = encodeURIComponent(message);
  if (phoneE164) {
    const digits = phoneE164.replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function buildOwnerInviteMessage(shopName: string, inviteUrl: string): string {
  return `Hallo! Hier ist dein Glanzo-Link für ${shopName}: ${inviteUrl}`;
}
