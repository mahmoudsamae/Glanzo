# Font licenses

Glanzo self-hosts two variable fonts under `src/fonts/`. Do not substitute files without updating this document.

## Fraunces (`Fraunces-Variable.woff2`)

- **Source:** [undercasetype/Fraunces](https://github.com/undercasetype/Fraunces) — `fonts/webfonts/variable/Fraunces[SOFT,WONK,opsz,wght].woff2`
- **Designers:** Phaedra Charles & Flavia Zimbardi / Undercase Type
- **License:** [SIL Open Font License 1.1 (OFL)](https://scripts.sil.org/OFL)
- **Use:** Display / editorial headings (`font-display`). Axes: opsz, SOFT, WONK, wght.

## General Sans (`GeneralSans-Variable.woff2`)

- **Source:** [Fontshare — General Sans](https://www.fontshare.com/fonts/general-sans) (Indian Type Foundry)
- **License:** [ITF Free Font License (ITF FFL)](https://fontshare.com/terms) — free for personal and commercial use per Fontshare terms
- **Use:** UI and body copy (`font-sans`). Upright variable weight only in MVP.

## Compliance

- Keep this file with the committed WOFF2 assets.
- Do not redistribute modified font binaries without respecting each license.
- No `next/font/google` or third-party font CDNs in production code paths.
