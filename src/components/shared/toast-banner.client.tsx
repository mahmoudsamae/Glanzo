"use client";

type ToastBannerProps = {
  message: string | null;
  onDismiss: () => void;
};

export function ToastBanner({ message, onDismiss }: ToastBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-[var(--space-4)] right-[var(--space-4)] z-50 mx-auto max-w-[360px] rounded-sm border border-border bg-[var(--ink-1)] px-[var(--space-4)] py-[var(--space-3)] text-sm text-[var(--text-1)] shadow-lg lg:bottom-[var(--space-4)]"
      role="status"
    >
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <p>{message}</p>
        <button
          type="button"
          className="shrink-0 text-muted-foreground"
          onClick={onDismiss}
          aria-label="Schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
