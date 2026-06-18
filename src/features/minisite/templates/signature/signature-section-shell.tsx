import type { ReactNode } from "react";

type SignatureSectionShellProps = {
  children: ReactNode;
  className?: string;
};

/** Shared width + rhythm for all Signature content blocks. */
export function SignatureSectionShell({ children, className = "" }: SignatureSectionShellProps) {
  return <div className={`mx-auto w-full max-w-md min-w-0 ${className}`}>{children}</div>;
}
