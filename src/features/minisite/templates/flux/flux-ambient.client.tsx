"use client";

import { useEffect } from "react";

/** Flux layout: slide reveals, aurora parallax, book bar neon reveal. */
export function FluxAmbient() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markReady = () => root.classList.add("ms-flux-ready");
    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];

    if (!CSS.supports("animation-timeline", "view()")) {
      const sections = document.querySelectorAll(".ms-flux-section, .ms-cinema-section");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("ms-flux-section--visible", "ms-cinema-section--visible");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
      );
      sections.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      document.querySelectorAll(".ms-flux-section, .ms-cinema-section").forEach((el) => {
        el.classList.add("ms-flux-section--visible", "ms-cinema-section--visible");
      });
    }

    const hero = document.querySelector("[data-flux-hero]");
    const bar = document.querySelector("[data-cinema-book-bar]");
    if (hero && bar) {
      const barIo = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            bar.classList.toggle("ms-cinema-book-bar--visible", !entry.isIntersecting);
          }
        },
        { threshold: 0, rootMargin: "-8% 0px 0px 0px" },
      );
      barIo.observe(hero);
      cleanups.push(() => barIo.disconnect());
    }

    if (!reduced) {
      const aurora = document.querySelector(".ms-flux-aurora") as HTMLElement | null;
      if (aurora && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        let frame = 0;
        const onMove = (event: Event) => {
          const pointer = event as PointerEvent;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const nx = pointer.clientX / window.innerWidth - 0.5;
            aurora.style.transform = `translate3d(${nx * 6}%, ${nx * -2}%, 0) skewY(${nx * 3}deg)`;
          });
        };
        const reset = () => {
          aurora.style.transform = "";
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerleave", reset);
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerleave", reset);
          cancelAnimationFrame(frame);
        });
      }
    }

    return () => {
      root.classList.remove("ms-flux-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
