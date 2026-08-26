# public/brand — the shipped logo files

Files here are **served publicly** at `/brand/<filename>` on the live site. Only put
web-ready, approved art in this folder. Working files (AI, EPS, PSD, PDF) go in
`assets/brand-source/` instead — that folder is not served.

The logo is **locked** (CLAUDE.md): use the art as-is. Never redraw, recolour, distort or
re-typeset it. Do not "fix" the navy-on-navy header problem by knocking the wordmark out
to white yourself — that needs an approved reversed lockup from the brand owner.

## Filenames the build expects

| File | What it is | Used by |
|---|---|---|
| `logo-market.svg` | The Market lockup as supplied — navy wordmark, cedar paddle, light ground | Home hero, any light-ground surface, `/rewards`, print |
| `logo-market-reversed.svg` | Approved **reversed / light** lockup for dark grounds | The sticky header (navy) — see below |
| `logo-market.png` | Optional raster fallback, 336 × 120 (3× of 112 × 40) | Social / OG images, email |
| `favicon.svg`, `icon.png` (512 × 512) | Site icon derived from the mark | Browser tab, PWA |

Add nothing else here without asking — every file in `public/` is on the internet.

## Sizes

The lockup is **~2.8:1**. It renders at **95 × 34** in the phone header and **112 × 40** on
desktop; **123 × 44** / **146 × 52** in the home hero. Minimum width ~72px, clear space =
the paddle-handle height on all sides (skill `brand-system`).

SVG is strongly preferred — one file covers every size. The header height is set from the
art's real ratio, not the reverse (ADR 0006).

## Blocked: the header cannot carry the logo yet

The sticky header is `--lb-navy` and the supplied wordmark is navy, so the wordmark
disappears. Until `logo-market-reversed.svg` lands here — or the client chooses a light
header ground instead — the header's final styling is blocked on every page.
Phase 0 items 1 and 2: `docs/roadmap.md`, ADR `docs/adr/0006-sticky-header.md`.
