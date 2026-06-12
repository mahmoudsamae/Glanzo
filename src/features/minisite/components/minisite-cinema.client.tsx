"use client";

import { useEffect } from "react";

import { clampHeroTilt } from "@/lib/minisite/cinema-math";

/** ≤3 kB inline orchestration: post-LCP ready, section IO fallback, hero tilt, book bar reveal. */
export function MinisiteCinema() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const markReady = () => root.classList.add("ms-cinema-ready");
    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];

    if (!CSS.supports("animation-timeline", "view()")) {
      const sections = document.querySelectorAll(".ms-cinema-section");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("ms-cinema-section--visible");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      sections.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      document.querySelectorAll(".ms-cinema-section").forEach((el) => {
        el.classList.add("ms-cinema-section--visible");
      });
    }

    const hero = document.querySelector("[data-cinema-hero]");
    const bar = document.querySelector("[data-cinema-book-bar]");
    if (hero && bar) {
      const barIo = new IntersectionObserver(
        ([entry]) => {
          if (entry) {
            bar.classList.toggle("ms-cinema-book-bar--visible", !entry.isIntersecting);
          }
        },
        { threshold: 0, rootMargin: "-15% 0px 0px 0px" },
      );
      barIo.observe(hero);
      cleanups.push(() => barIo.disconnect());
    }

    if (!reduced) {
      const plane = document.querySelector(".ms-cinema-hero-plane") as HTMLElement | null;
      if (plane && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        let frame = 0;
        const onMove = (event: Event) => {
          const pointer = event as PointerEvent;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const rect = plane.getBoundingClientRect();
            const nx = (pointer.clientX - rect.left) / rect.width - 0.5;
            const ny = (pointer.clientY - rect.top) / rect.height - 0.5;
            const { rotateX, rotateY } = clampHeroTilt(nx, ny, 3);
            plane.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          });
        };
        const reset = () => {
          plane.style.transform = "";
        };
        plane.addEventListener("pointermove", onMove);
        plane.addEventListener("pointerleave", reset);
        cleanups.push(() => {
          plane.removeEventListener("pointermove", onMove);
          plane.removeEventListener("pointerleave", reset);
          cancelAnimationFrame(frame);
        });
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, []);

  return null;
}
