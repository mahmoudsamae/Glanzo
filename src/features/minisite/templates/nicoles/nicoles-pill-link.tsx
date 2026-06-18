import Link from "next/link";

type NicolesPillLinkProps = {
  href: string;
  label: string;
  preview?: boolean;
  className?: string;
};

export function NicolesPillLink({ href, label, preview = false, className = "" }: NicolesPillLinkProps) {
  if (preview) {
    return <span className={`ms-nicoles-pill-cta ${className}`.trim()}>{label}</span>;
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={`ms-nicoles-pill-cta ${className}`.trim()}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={`ms-nicoles-pill-cta ${className}`.trim()}>
      {label}
    </Link>
  );
}
