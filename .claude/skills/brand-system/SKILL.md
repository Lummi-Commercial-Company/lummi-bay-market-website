---
name: brand-system
description: Canonical, LOCKED brand design tokens for Lummi Bay Market — the approved 2026 palette, typography, logo rules, and spacing. Load whenever creating or styling any UI, choosing colors or fonts, or reviewing visual consistency. These values are approved; do not invent alternatives.
---

# Brand System — Lummi Bay Market (approved 2026 refresh)

## Logo (LOCKED)
- Use the supplied vector logo files as-is (client confirmed vectors exist).
- Master mark = the "Market" lockup, used sitewide (header, home hero). Location
  pages may use their own name in type, but the mark stays the Market lockup.
- Never redraw, recolor, distort, or re-typeset the logo.
- **The paddle alone is the icon mark — approved 27 Aug 2026, for that and nothing else.** It
  fills the small square slots the lockup cannot: favicon, app icon, avatar. It ships white on a
  navy disc, and the 16px size carries a thickened paddle because a straight downscale reads as
  a dot. **This reverses the earlier ruling** that the paddle alone was unacceptable — anything
  written against that ruling is out of date.
- **Otherwise no part of the lockup may stand alone**, and the carve-out is not a licence to
  modify the lockup. Do not extract, recolour or re-weight any part of it for any other purpose.
- Separate from all of the above: the *decorative* paddle motif in skill `pnw-tribal-art`.
  A divider or list marker drawn in that style is ornament, not the logo's paddle extracted.
- Clear space = the paddle-handle height on all sides. Minimum width ~72px.
- **Header imagery keeps 20px clear of the text navigation's right edge** — a separate floor from
  the logo's clear space; art starts at whichever lands further right. See `pnw-tribal-art`.
- The logo art contains the original brand blue #000F9F. That blue lives INSIDE the
  logo only — it is NOT a UI color in this system. UI blues are the navies below.

## Color tokens (APPROVED — locked)
Define once in global CSS as custom properties:

```css
:root {
  --lb-navy: #1C4E8F;       /* structure: headers, headlines, labels, primary */
  --lb-navy-deep: #14396B;  /* fuel prices, emphasis */
  --lb-teal: #0FB5C4;       /* accent, dividers, the waterline motif */
  --lb-cedar: #C9772E;      /* warm accent, decorative only */
  --lb-ground: #FBF9F4;     /* page background */
  --lb-paper: #FFFFFF;      /* cards */
  --lb-ink: #2A2820;        /* body text */
  --lb-bone: #F5F1E8;       /* text on navy fills */
}
```

Roles: navy = identity + structure; deep-navy = prices; teal = accent/waterline;
cedar = warm decorative accent; ground/paper = backgrounds; ink = body; bone = text
on navy.

### Contrast rules (test, don't assume)
- Body text meets WCAG AA (>= 4.5:1). Navy, deep-navy, and ink on ground/paper pass.
- `--lb-teal` and `--lb-cedar` are DECORATIVE / large-graphic colors. They fail AA as
  small text on light backgrounds — never use them for body copy or small labels.
  If an accent must carry small text, darken it first and verify.
- Prices (`--lb-navy-deep`) on `--lb-paper` pass comfortably.

## Typography (APPROVED — locked)
- Display / headings: **Space Grotesk** (700). Google Fonts, license-clean.
- Body / labels: **Inter** (400 / 500 / 600).
- Type scale (rem): 3 / 2.25 / 1.75 / 1.375 / 1.125 / 1 / 0.875. Line-height 1.5 body,
  1.1 display. Sentence case for headings and UI (the logo's own caps are the logo's,
  not a type rule).

## Motif style (see also skill `pnw-tribal-art`)
Flat, 1–2 colors, drawn from teal + cedar + navy. The waterline is teal. All motifs in
the build are placeholders marked for authentic/approved Lummi art before launch.

## Spacing & layout
- Spacing scale (px): 4 8 12 16 24 32 48 64 96. Max content width ~1200px.
- Corners: `var(--radius)` (8px) for controls, 12px for cards. Soft, no heavy shadows.

## Do / Don't
- DO make navy dominant, teal + cedar as accents, the waterline the recurring signature.
- DO use `--lb-navy-deep` only for prices/emphasis so prices stay a recognizable cue.
- DON'T touch the logo. DON'T use #000F9F as a UI color (logo only). DON'T set body
  text in teal or cedar. DON'T add colors or type families beyond those above.
