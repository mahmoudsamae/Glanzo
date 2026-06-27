"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = ".ms-mecca-reveal";
const EASE_MS = 900;

/** Mecca: scroll reveals, hero entrance, smooth in-view motion. */
export function MeccaAmbient() {
  useEffect(() => {
    const root = document.querySelector(".ms-mecca-root");
    if (!root) return;

    const markReady = () => {
      root.classList.add("ms-mecca-ready");
    };

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion) {
      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-inview");
            revealIo.unobserve(entry.target);
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -7% 0px" },
      );

      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealIo.observe(el));
      cleanups.push(() => revealIo.disconnect());

      const staggerGroups = root.querySelectorAll("[data-mecca-stagger]");
      const staggerIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const group = entry.target;
            group.querySelectorAll(REVEAL_SELECTOR).forEach((child, index) => {
              const node = child as HTMLElement;
              if (!node.style.getPropertyValue("--mecca-delay")) {
                node.style.setProperty("--mecca-delay", `${index * 110}ms`);
              }
              node.classList.add("is-inview");
            });
            staggerIo.unobserve(group);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
      );

      staggerGroups.forEach((group) => staggerIo.observe(group));
      cleanups.push(() => staggerIo.disconnect());
    } else {
      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        el.classList.add("is-inview");
      });
    }

    root.querySelectorAll(".ms-mecca-hero-enter").forEach((el, index) => {
      (el as HTMLElement).style.setProperty("--mecca-delay", `${index * 100}ms`);
    });

    const hero = root.querySelector("[data-mecca-hero]");
    const bookBar = document.querySelector("[data-cinema-book-bar]");
    if (hero && bookBar) {
      const barIo = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            bookBar.classList.toggle("ms-cinema-book-bar--visible", !entry.isIntersecting);
          }
        },
        { threshold: 0, rootMargin: "-10% 0px 0px 0px" },
      );
      barIo.observe(hero);
      cleanups.push(() => barIo.disconnect());
    }

    return () => {
      root.classList.remove("ms-mecca-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
