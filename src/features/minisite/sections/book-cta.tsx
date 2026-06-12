import Link from "next/link";

type BookCtaProps = {
  href: string;
  label: string;
  suspended: boolean;
  className?: string;
  cinema?: boolean;
};

export function BookCta({ href, label, suspended, className = "", cinema = false }: BookCtaProps) {
  if (suspended) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md border border-[color:var(--ms-border)] px-[var(--space-6)] py-[var(--space-3)] text-md text-[color:var(--ms-text-muted)] ${className}`}
        aria-disabled="true"
      >
        Online-Buchung pausiert
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={`inline-flex items-center justify-center rounded-md bg-[color:var(--ms-accent)] px-[var(--space-6)] py-[var(--space-3)] text-md font-medium text-[color:var(--ms-on-accent)] transition-colors hover:bg-[color:var(--ms-accent-hover)] ${
        cinema ? "ms-cinema-book-cta" : ""
      } ${className}`}
    >
      {label}
    </Link>
  );
}
