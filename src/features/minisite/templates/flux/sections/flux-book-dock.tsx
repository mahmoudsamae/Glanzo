"use client";

import { useEffect } from "react";

import { BookCta } from "../../../sections/book-cta";

type FluxBookDockProps = {
  bookHref: string;
  suspended: boolean;
};

/** Flux booking chrome — bottom rail on mobile, floating dock on desktop. */
export function FluxBookDock({ bookHref, suspended }: FluxBookDockProps) {
  useEffect(() => {
    const dock = document.querySelector("[data-flux-book-dock]");
    const hero = document.querySelector("[data-flux-hero]");
    if (!dock || !hero) {
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          dock.classList.toggle("ms-flux-book-dock--visible", !entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "-10% 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      data-flux-book-dock
      className="ms-flux-book-dock pointer-events-none fixed inset-x-0 bottom-[max(var(--space-4),env(safe-area-inset-bottom))] z-30 px-[var(--space-4)] lg:inset-x-auto lg:bottom-[var(--space-6)] lg:right-[var(--space-6)] lg:px-0"
      aria-label="Buchen"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-lg lg:mx-0 lg:w-auto">
        <BookCta
          href={bookHref}
          label="Termin sichern"
          suspended={suspended}
          className="ms-flux-book-cta ms-flux-book-dock-btn w-full rounded-none uppercase tracking-wider lg:w-auto lg:min-w-[14rem]"
        />
      </div>
    </div>
  );
}
