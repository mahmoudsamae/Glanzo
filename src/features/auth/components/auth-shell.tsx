import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthShell({ title, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-full w-full max-w-[360px] flex-1 flex-col justify-center px-[var(--space-4)] py-[var(--space-8)]",
        className,
      )}
    >
      <header className="mb-[var(--space-8)] space-y-[var(--space-2)] text-center">
        <p className="font-display text-2xl text-[var(--text-0)]">{title}</p>
        {subtitle ? <p className="text-base text-muted-foreground">{subtitle}</p> : null}
      </header>
      <div className="space-y-[var(--space-6)]">{children}</div>
      {footer ? <footer className="mt-[var(--space-8)] text-center text-base">{footer}</footer> : null}
    </main>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
