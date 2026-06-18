import type { NicolesBookingOptionKind } from "@/lib/minisite/nicoles-terminbuchung-page";

type NicolesBookingIconProps = {
  kind: NicolesBookingOptionKind;
  className?: string;
};

export function NicolesBookingIcon({ kind, className = "" }: NicolesBookingIconProps) {
  const shared = `size-[3.75rem] ${className}`.trim();

  switch (kind) {
    case "phone":
      return (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden className={shared}>
          <path
            d="M18 10h10l4 12-6 4c3 8 8 13 16 16l4-6 12 4v10c0 2-2 4-4 4C28 54 10 36 10 14c0-2 2-4 4-4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden className={shared}>
          <path
            d="M32 8c-13.2 0-24 10.8-24 24 0 4.2 1.1 8.2 3 11.7L8 56l12.6-3.1C24 54.9 27.9 56 32 56c13.2 0 24-10.8 24-24S45.2 8 32 8Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M24 26c.6-1.3 1.2-1.3 1.8-1.3h1c.6 0 1 .3 1.3.9l1.8 4.2c.3.6.2 1-.3 1.4l-1.1 1.1c1.8 3.4 4.5 6.1 7.9 7.9l1.1-1.1c.4-.5 1-.6 1.4-.3l4.2 1.8c.6.3.9.7.9 1.3v1c0 .6-.1 1.2-1.3 1.8-1 .5-2.4.8-3.6.8-1.6 0-3.8-.6-6.4-2.8-2.8-2.4-5.6-6.4-6.4-8.4-.8-2-.8-3.2-.3-4.2Z"
            fill="currentColor"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden className={shared}>
          <rect x="14" y="14" width="36" height="36" rx="10" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="44" cy="20" r="2.5" fill="currentColor" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden className={shared}>
          <rect x="10" y="18" width="44" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
          <path d="M10 22 32 36 54 22" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
