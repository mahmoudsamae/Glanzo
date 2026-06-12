import localFont from "next/font/local";

/** Fraunces display — axes tuned via CSS (SOFT 0, WONK 0, optical sizing auto). */
export const fontDisplay = localFont({
  src: "../fonts/Fraunces-Variable.woff2",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
  weight: "100 900",
});

/** General Sans workhorse — upright variable weight only. */
export const fontSans = localFont({
  src: "../fonts/GeneralSans-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
  weight: "200 700",
});

export const fontClassNames = `${fontDisplay.variable} ${fontSans.variable}`;
