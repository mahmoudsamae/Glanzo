type ForgeLogoIconProps = {
  className?: string;
};

/** Minimal barber mark — crossed blades. */
export function ForgeLogoIcon({ className = "" }: ForgeLogoIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M18 46L46 18M20 18l26 26"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M32 14v8M32 42v8M14 32h8M42 32h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
