"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = ".ms-velvet-reveal";
const HERO_ENTER_SELECTOR = ".ms-velvet-hero-enter";
const SLIDESHOW_INTERVAL_MS = 5000;

/** Velvet: scroll reveals, hero entrance, hero image slideshow, hero parallax. */
export function VelvetAmbient() {
  useEffect(() => {
    const root = document.querySelector(".ms-velvet-root");
    if (!root) return;

    const markReady = () => root.classList.add("ms-velvet-ready");
    if (document.readyState === "complete") {
      markReady();
    } else {
      window.addEventListener("load", markReady, { once: true });
    }

    const cleanups: Array<() => void> = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ——— Scroll reveals ——— */
    if (!reducedMotion) {
      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-inview");
            revealIo.unobserve(entry.target);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
      );

      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealIo.observe(el));
      cleanups.push(() => revealIo.disconnect());

      const staggerGroups = root.querySelectorAll("[data-velvet-stagger]");
      const staggerIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.querySelectorAll(REVEAL_SELECTOR).forEach((child, i) => {
              const node = child as HTMLElement;
              if (!node.style.getPropertyValue("--velvet-delay")) {
                node.style.setProperty("--velvet-delay", `${i * 100}ms`);
              }
              node.classList.add("is-inview");
            });
            staggerIo.unobserve(entry.target);
          }
        },
        { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
      );

      staggerGroups.forEach((g) => staggerIo.observe(g));
      cleanups.push(() => staggerIo.disconnect());
    } else {
      root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => el.classList.add("is-inview"));
    }

    /* ——— Hero entrance stagger ——— */
    root.querySelectorAll(HERO_ENTER_SELECTOR).forEach((el, i) => {
      (el as HTMLElement).style.setProperty("--velvet-delay", `${i * 120}ms`);
    });

    /* ——— Hero image slideshow ——— */
    const hero = root.querySelector<HTMLElement>("[data-velvet-hero]");
    const heroVideo = hero?.querySelector<HTMLVideoElement>("[data-velvet-hero-video]");
    const slides = root.querySelectorAll<HTMLElement>("[data-velvet-slide]");
    const dots = root.querySelectorAll<HTMLElement>("[data-velvet-dot]");

    if (!heroVideo && slides.length > 1 && !reducedMotion) {
      let current = 0;

      function showSlide(index: number) {
        slides.forEach((slide, i) => {
          const isActive = i === index;
          slide.style.opacity = isActive ? "1" : "0";
          slide.style.zIndex = isActive ? "1" : "0";
          slide.style.transition = isActive ? "opacity 1.4s ease" : "opacity 0s";
        });

        dots.forEach((dot, i) => {
          if (i === index) {
            dot.classList.add("ms-velvet-hero-dot--active");
          } else {
            dot.classList.remove("ms-velvet-hero-dot--active");
          }
        });

        current = index;
      }

      showSlide(0);

      const timer = setInterval(() => {
        showSlide((current + 1) % slides.length);
      }, SLIDESHOW_INTERVAL_MS);

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          clearInterval(timer);
          showSlide(i);
        });
      });

      cleanups.push(() => clearInterval(timer));
    } else if (!heroVideo && slides.length === 1) {
      (slides[0] as HTMLElement).style.opacity = "1";
    }

    /* ——— Hero parallax on mouse move ——— */
    if (hero && !reducedMotion) {
      const orb = hero.querySelector<HTMLElement>(".ms-velvet-hero-orb");

      function onMouseMove(e: MouseEvent) {
        const rect = hero!.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        const maxX = rect.width / 2;
        const maxY = rect.height / 2;
        const rx = (cx / maxX) * 10;
        const ry = (cy / maxY) * 8;

        if (orb) {
          orb.style.transform = `translate(${rx * 1.5}px, ${ry * 1.2}px)`;
        }

        const parallaxTransform = `scale(1.04) translate(${rx * 0.4}px, ${ry * 0.3}px)`;
        if (heroVideo) {
          heroVideo.style.transform = parallaxTransform;
        } else {
          slides.forEach((slide) => {
            slide.style.transform = parallaxTransform;
          });
        }
      }

      function onMouseLeave() {
        if (orb) orb.style.transform = "";
        if (heroVideo) {
          heroVideo.style.transform = "";
        } else {
          slides.forEach((slide) => {
            slide.style.transform = "";
          });
        }
      }

      hero.addEventListener("mousemove", onMouseMove, { passive: true });
      hero.addEventListener("mouseleave", onMouseLeave);
      cleanups.push(() => {
        hero.removeEventListener("mousemove", onMouseMove);
        hero.removeEventListener("mouseleave", onMouseLeave);
      });
    }

    /* ——— BookBar hide/show on hero scroll ——— */
    if (hero) {
      const bookBar = document.querySelector("[data-cinema-book-bar]");
      if (bookBar) {
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
    }

    return () => {
      root.classList.remove("ms-velvet-ready");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
