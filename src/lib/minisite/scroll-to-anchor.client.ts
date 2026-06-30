const PREVIEW_SCROLL_SELECTOR = ".salon-dash-minisite-preview-scroll";
const DEFAULT_NAV_OFFSET_PX = 88;

let activeAnimation: number | null = null;

function easeVelvetScroll(t: number): number {
  // Matches velvet motion: cubic-bezier(0.16, 1, 0.3, 1)
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function findScrollRoot(start: Element | null): HTMLElement | Window {
  let node = start?.parentElement ?? null;

  while (node) {
    if (node.matches(PREVIEW_SCROLL_SELECTOR)) {
      return node;
    }

    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }

    node = node.parentElement;
  }

  return window;
}

function getScrollTop(root: HTMLElement | Window): number {
  if (root === window) return window.scrollY;
  return (root as HTMLElement).scrollTop;
}

function setScrollTop(root: HTMLElement | Window, top: number): void {
  if (root === window) {
    window.scrollTo(0, top);
    return;
  }
  (root as HTMLElement).scrollTop = top;
}

function animateScroll(root: HTMLElement | Window, targetTop: number): void {
  if (activeAnimation !== null) {
    cancelAnimationFrame(activeAnimation);
    activeAnimation = null;
  }

  const startTop = getScrollTop(root);
  const delta = targetTop - startTop;
  if (Math.abs(delta) < 2) return;

  if (prefersReducedMotion()) {
    setScrollTop(root, targetTop);
    return;
  }

  const duration = Math.min(1400, Math.max(520, Math.abs(delta) * 0.62));
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min(1, (now - startTime) / duration);
    setScrollTop(root, startTop + delta * easeVelvetScroll(progress));
    if (progress < 1) {
      activeAnimation = requestAnimationFrame(step);
    } else {
      activeAnimation = null;
    }
  }

  activeAnimation = requestAnimationFrame(step);
}

export type ScrollToMinisiteAnchorOptions = {
  offsetPx?: number;
};

export function scrollToMinisiteAnchor(
  href: string,
  options: ScrollToMinisiteAnchorOptions = {},
): void {
  const id = href.startsWith("#") ? href.slice(1) : href;
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const offset = options.offsetPx ?? DEFAULT_NAV_OFFSET_PX;
  const scrollRoot = findScrollRoot(target);

  if (scrollRoot === window) {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    animateScroll(window, Math.max(0, top));
    return;
  }

  const root = scrollRoot as HTMLElement;
  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const top = targetRect.top - rootRect.top + root.scrollTop - offset;
  animateScroll(root, Math.max(0, top));
}
