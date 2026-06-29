"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { navHrefTarget, type NavLink } from "@/lib/minisite/about-blocks";
import { defaultNavLinksForTemplate, getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { MinisiteContent } from "@/lib/validations/public-shop";

type VelvetNavProps = {
  shopName: string;
  content: MinisiteContent | null;
  bookHref: string;
  preview?: boolean;
  basePath?: string;
};

function scrollToAnchor(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolvePageHref(href: string | undefined, basePath: string): string | null {
  if (!href || href === "__book__") return null;
  if (!href.startsWith("#")) {
    if (href.startsWith("/")) return `${basePath}${href}`;
    return null;
  }
  const anchor = href.slice(1);
  if (anchor === "ms-velvet-top") return basePath;
  return `${basePath}${href}`;
}

function isBookNavLink(link: NavLink): boolean {
  return link.href === "__book__" || link.href === "/terminbuchung";
}

function VelvetGemIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="ms-velvet-nav-gem">
      <path
        d="M10 2.5L3 8l7 9.5L17 8l-7-5.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M3 8h14M7 8l3-5.5M13 8l-3-5.5M10 17.5L7 8M10 17.5L13 8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VelvetNav({
  shopName,
  content,
  bookHref,
  preview = false,
  basePath,
}: VelvetNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const anchors = getMinisiteAnchors("velvet");
  const [active, setActive] = useState<string>(anchors.top);

  const links = useMemo(() => {
    const custom =
      content?.nav_links?.filter((l) => l.visible !== false && l.label.trim()) ?? [];
    return custom.length > 0 ? custom : defaultNavLinksForTemplate("velvet");
  }, [content]);

  const navLinks = useMemo(() => links.filter((l) => !isBookNavLink(l)), [links]);

  const scrollLinks = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        targetId: navHrefTarget(link.href, anchors.about),
      })),
    [navLinks, anchors.about],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (basePath) return;
    const sections = scrollLinks
      .map((l) => document.getElementById(l.targetId))
      .filter(Boolean);
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((s) => io.observe(s!));
    return () => io.disconnect();
  }, [scrollLinks, basePath]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function isLinkActive(link: NavLink): boolean {
    if (basePath) {
      const pageHref = resolvePageHref(link.href, basePath);
      if (!pageHref) return false;
      if (pageHref === basePath) return pathname === basePath;
      const pagePath = pageHref.split("#")[0] ?? pageHref;
      return pathname === pagePath || pathname.startsWith(pagePath);
    }
    return active === navHrefTarget(link.href, anchors.about);
  }

  function onNav(link: NavLink) {
    setOpen(false);
    if (!basePath) scrollToAnchor(link.href ?? `#${anchors.about}`);
  }

  function renderLink(link: NavLink, className: string) {
    const activeClass = isLinkActive(link) ? `${className}--active` : "";

    if (basePath && !preview) {
      const pageHref = resolvePageHref(link.href, basePath);
      if (pageHref) {
        return (
          <Link href={pageHref} className={`${className} ${activeClass}`} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        );
      }
    }

    return (
      <button type="button" className={`${className} ${activeClass}`} onClick={() => onNav(link)}>
        {link.label}
      </button>
    );
  }

  const navClass = [
    "ms-velvet-nav",
    scrolled ? "ms-velvet-nav--scrolled" : "ms-velvet-nav--dark",
  ].join(" ");

  const brandContent = (
    <>
      <VelvetGemIcon />
      <span className="ms-velvet-nav-logo truncate">{shopName}</span>
    </>
  );

  return (
    <header className={navClass}>
      <div className="ms-velvet-nav-inner">
        {basePath && !preview ? (
          <Link href={basePath} className="ms-velvet-nav-brand" onClick={() => setOpen(false)}>
            {brandContent}
          </Link>
        ) : (
          <button
            type="button"
            className="ms-velvet-nav-brand"
            onClick={() => { setOpen(false); scrollToAnchor(`#${anchors.top}`); }}
          >
            {brandContent}
          </button>
        )}

        <nav className="ms-velvet-nav-desktop" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-velvet-nav-link")}</span>
          ))}
        </nav>

        <div className="ms-velvet-nav-actions">
          {preview ? null : (
            <Link href={bookHref} scroll={false} className="ms-velvet-nav-cta">
              Book Now
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`ms-velvet-nav-menu-btn ${open ? "ms-velvet-nav-menu-btn--open" : ""}`}
          aria-expanded={open}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open ? (
        <nav className="ms-velvet-nav-drawer" aria-label="Mobile Navigation">
          {navLinks.map((link) => (
            <span key={link.id}>{renderLink(link, "ms-velvet-nav-drawer-link")}</span>
          ))}
          {preview ? null : (
            <Link
              href={bookHref}
              scroll={false}
              className="ms-velvet-nav-cta ms-velvet-nav-cta--drawer"
              onClick={() => setOpen(false)}
            >
              Book Now
            </Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}
