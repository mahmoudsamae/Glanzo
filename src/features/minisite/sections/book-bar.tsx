"use client";

import { useEffect } from "react";

import { BookCta } from "./book-cta";

type BookBarProps = {
  bookHref: string;
  suspended: boolean;
};

/** Fixed bottom book bar — glass overlay, reveals after hero scrolls past. */
export function BookBarSection({ bookHref, suspended }: BookBarProps) {
  useEffect(() => {
    const bar = document.querySelector("[data-cinema-book-bar]");
    const onInteract = () => bar?.classList.add("ms-cinema-book-bar--interacted");
    bar?.addEventListener("click", onInteract, { once: true });
    return () => bar?.removeEventListener("click", onInteract);
  }, []);

  return (
    <div
      data-cinema-book-bar
      className="ms-cinema-book-bar pointer-events-none fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--ms-border-subtle)] px-[var(--space-4)] pb-[max(var(--space-4),env(safe-area-inset-bottom))] pt-[var(--space-3)] lg:hidden"
      aria-label="Buchen"
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-lg justify-center">
        <BookCta href={bookHref} label="Jetzt buchen" suspended={suspended} cinema className="w-full" />
      </div>
    </div>
  );
}
