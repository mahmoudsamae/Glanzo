"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = ".ms-forge-reveal";
const FORGE_SECTION_SELECTOR = ".ms-forge-section.ms-cinema-section, .ms-nicoles-section.ms-cinema-section";

/** Forge: scroll reveals + book bar (smooth scroll via CSS on .ms-forge-root). */
export function ForgeAmbient() {
  useEffect(() => {
    const root = document.querySelector(".ms-forge-root");
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markReady = () => {
      root.classList.add("ms-forge-ready", "ms-cinema-ready");
      document.documentElement.classList.add("ms-forge-ready");
    };

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    if (!reducedMotion) {
      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-inview");
            revealIo.unobserve(entry.target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealIo.observe(el));
      cleanups.push(() => revealIo.disconnect());

      const staggerGroups = root.querySelectorAll("[data-forge-stagger]");
      const staggerIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.querySelectorAll(REVEAL_SELECTOR).forEach((child, index) => {
              const node = child as HTMLElement;
              if (!node.style.getPropertyValue("--forge-delay")) {
                node.style.setProperty("--forge-delay", `${index * 100}ms`);
              }
              node.classList.add("is-inview");
            });
            staggerIo.unobserve(entry.target);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
      );

      staggerGroups.forEach((group) => staggerIo.observe(group));
      cleanups.push(() => staggerIo.disconnect());

      const sectionIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("ms-cinema-section--visible");
            sectionIo.unobserve(entry.target);
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
      );

      root.querySelectorAll(FORGE_SECTION_SELECTOR).forEach((el) => sectionIo.observe(el));
      cleanups.push(() => sectionIo.disconnect());
    } else {
      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        el.classList.add("is-inview");
      });
      root.querySelectorAll(FORGE_SECTION_SELECTOR).forEach((el) => {
        el.classList.add("ms-cinema-section--visible");
      });
    }

    root.querySelectorAll(".ms-forge-hero-enter").forEach((el, index) => {
      (el as HTMLElement).style.setProperty("--forge-delay", `${index * 90}ms`);
    });

    const hero = root.querySelector("[data-forge-hero]");
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
      root.classList.remove("ms-forge-ready", "ms-cinema-ready");
      document.documentElement.classList.remove("ms-forge-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
