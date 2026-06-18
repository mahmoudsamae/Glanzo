"use client";

import { useEffect } from "react";

/** Preview-only: mark sections visible (ambient clients are disabled in preview). */
export function MinisitePreviewReveal() {
  useEffect(() => {
    const preview = document.querySelector(".minisite-preview");
    if (!preview) {
      return;
    }

    preview.classList.add("ms-cinema-ready", "ms-signature-ready", "ms-boutique-ready", "ms-nicoles-ready", "ms-flux-ready");
    preview
      .querySelectorAll(
        ".ms-cinema-section, .ms-signature-section, .ms-boutique-section, .ms-nicoles-section, .ms-flux-section",
      )
      .forEach((el) => {
        el.classList.add(
          "ms-cinema-section--visible",
          "ms-signature-section--visible",
          "ms-boutique-section--visible",
          "ms-nicoles-section--visible",
          "ms-flux-section--visible",
        );
      });

    return () => {
      preview.classList.remove(
        "ms-cinema-ready",
        "ms-signature-ready",
        "ms-boutique-ready",
        "ms-nicoles-ready",
        "ms-flux-ready",
      );
    };
  }, []);

  return null;
}
