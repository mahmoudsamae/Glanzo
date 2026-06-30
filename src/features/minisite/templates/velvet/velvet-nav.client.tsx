"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { navHrefTarget, type NavLink } from "@/lib/minisite/about-blocks";
import { scrollToMinisiteAnchor } from "@/lib/minisite/scroll-to-anchor.client";
import { defaultNavLinksForTemplate, getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";

const PREVIEW_SCROLL_SELECTOR = ".salon-dash-minisite-preview-scroll";

type VelvetNavProps = {
  shopName: string;
  content: MinisiteContent | null;
  bookHref: string;
  preview?: boolean;
  basePath?: string;
  i18n: VelvetI18n;
};

function scrollNavTo(href: string, topAnchor: string) {
  scrollToMinisiteAnchor(href, {
    offsetPx: href === `#${topAnchor}` || href === topAnchor ? 0 : undefined,
  });
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
  i18n,
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
  const logoUrl = content?.logo_path?.trim() ? shopMediaPublicUrl(content.logo_path.trim()) : null;

  const scrollLinks = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        targetId: navHrefTarget(link.href, anchors.about),
      })),
    [navLinks, anchors.about],
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    if (!document.getElementById(id)) return;

    const frame = requestAnimationFrame(() => {
      scrollNavTo(hash, anchors.top);
    });
    return () => cancelAnimationFrame(frame);
  }, [anchors.top]);

  useEffect(() => {
    const previewScroll = document.querySelector<HTMLElement>(PREVIEW_SCROLL_SELECTOR);
    const scrollRoot: HTMLElement | Window = previewScroll ?? window;

    const onScroll = () => {
      const y =
        scrollRoot === window
          ? window.scrollY
          : (scrollRoot as HTMLElement).scrollTop;
      setScrolled(y > 72);
    };

    onScroll();
    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const scrollRoot =
      document.querySelector<HTMLElement>(PREVIEW_SCROLL_SELECTOR) ?? null;

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
      {
        root: scrollRoot,
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.2, 0.5],
      },
    );

    sections.forEach((s) => io.observe(s!));
    return () => io.disconnect();
  }, [scrollLinks]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function isLinkActive(link: NavLink): boolean {
    const href = link.href ?? "";
    if (href.startsWith("#")) {
      return active === navHrefTarget(href, anchors.about);
    }

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
    scrollNavTo(link.href ?? `#${anchors.about}`, anchors.top);
  }

  function renderLink(link: NavLink, className: string) {
    const activeClass = isLinkActive(link) ? `${className}--active` : "";
    const href = link.href ?? `#${anchors.about}`;

    if (href.startsWith("#")) {
      return (
        <button type="button" className={`${className} ${activeClass}`} onClick={() => onNav(link)}>
          {link.label}
        </button>
      );
    }

    if (basePath && !preview) {
      const pageHref = resolvePageHref(href, basePath);
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
      {logoUrl ? (
        <span className="ms-velvet-nav-logo-mark">
          <Image src={logoUrl} alt="" width={180} height={64} className="ms-velvet-nav-logo-img" />
        </span>
      ) : (
        <VelvetGemIcon />
      )}
      <span className="ms-velvet-nav-logo truncate">{shopName}</span>
    </>
  );

  return (
    <header className={navClass}>
      <div className="ms-velvet-nav-inner">
        {basePath && !preview ? (
          <Link
            href={basePath}
            className="ms-velvet-nav-brand"
            onClick={(event) => {
              setOpen(false);
              if (pathname === basePath) {
                event.preventDefault();
                scrollNavTo(`#${anchors.top}`, anchors.top);
              }
            }}
          >
            {brandContent}
          </Link>
        ) : (
          <button
            type="button"
            className="ms-velvet-nav-brand"
            onClick={() => {
              setOpen(false);
              scrollNavTo(`#${anchors.top}`, anchors.top);
            }}
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
              {i18n.nav.bookNow}
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`ms-velvet-nav-menu-btn ${open ? "ms-velvet-nav-menu-btn--open" : ""}`}
          aria-expanded={open}
          aria-label={open ? i18n.nav.menuClose : i18n.nav.menuOpen}
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
