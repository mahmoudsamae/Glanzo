"use client";

import { useEffect } from "react";

/** Mecca: root ready state + section reveal fallback when view() is unsupported. */
export function MeccaAmbient() {
  useEffect(() => {
    const root = document.querySelector(".ms-mecca-root");
    const markReady = () => {
      root?.classList.add("ms-mecca-ready");
    };

    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];

    if (!CSS.supports("animation-timeline", "view()")) {
      const sections = document.querySelectorAll(".ms-mecca-section");
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("ms-mecca-section--visible");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
      );
      sections.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      document.querySelectorAll(".ms-mecca-section").forEach((el) => {
        el.classList.add("ms-mecca-section--visible");
      });
    }

    return () => {
      root?.classList.remove("ms-mecca-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
