import type { ReactNode } from "react";

import { CutLine } from "@/components/shared/cut-line";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="salon-dash-empty flex flex-col items-center gap-[var(--space-4)] py-[var(--space-12)] text-center">
      <div className="ms-cinema-ornament" aria-hidden />
      <CutLine />
      <h2 className="font-display text-xl text-[color:var(--text-0)]">{title}</h2>
      {description ? <p className="text-base text-muted-foreground">{description}</p> : null}
      {children}
      {actionLabel && onAction ? (
        <Button type="button" className="salon-dash-btn-primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
