import type { ReactNode } from "react";

type BoutiqueSectionShellProps = {
  children: ReactNode;
  className?: string;
};

/** Shared width + rhythm for all Boutique content blocks. */
export function BoutiqueSectionShell({ children, className = "" }: BoutiqueSectionShellProps) {
  return <div className={`mx-auto w-full max-w-md min-w-0 ${className}`}>{children}</div>;
}
