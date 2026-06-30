"use client";

import type { ReactNode } from "react";

import { scrollToMinisiteAnchor } from "@/lib/minisite/scroll-to-anchor.client";

type VelvetAnchorLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function VelvetAnchorLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: VelvetAnchorLinkProps) {
  if (!href.startsWith("#")) {
    return (
      <a href={href} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        scrollToMinisiteAnchor(href);
      }}
    >
      {children}
    </a>
  );
}
