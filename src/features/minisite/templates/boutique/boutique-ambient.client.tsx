"use client";

import { useEffect } from "react";

/** Boutique boutique: section reveals, hero ken-burns ready, book bar. */
export function BoutiqueAmbient() {
  useEffect(() => {
    const root = document.documentElement;
    const markReady = () => {
      root.classList.add("ms-boutique-ready", "ms-cinema-ready");
    };
    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];

    if (!CSS.supports("animation-timeline", "view()")) {
      const sections = document.querySelectorAll(".ms-boutique-section, .ms-cinema-section");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("ms-boutique-section--visible", "ms-cinema-section--visible");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
      );
      sections.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      document.querySelectorAll(".ms-boutique-section, .ms-cinema-section").forEach((el) => {
        el.classList.add("ms-boutique-section--visible", "ms-cinema-section--visible");
      });
    }

    const hero = document.querySelector("[data-boutique-hero]");
    const bar = document.querySelector("[data-cinema-book-bar]");
    if (hero && bar) {
      const barIo = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            bar.classList.toggle("ms-cinema-book-bar--visible", !entry.isIntersecting);
          }
        },
        { threshold: 0, rootMargin: "-12% 0px 0px 0px" },
      );
      barIo.observe(hero);
      cleanups.push(() => barIo.disconnect());
    }

    return () => {
      root.classList.remove("ms-boutique-ready", "ms-cinema-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
