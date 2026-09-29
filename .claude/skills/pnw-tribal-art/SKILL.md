---
name: pnw-tribal-art
description: Motif library and usage rules for Lummi Bay Market's Coast Salish / Pacific Northwest visual theme — canoe, paddle, eagle, salmon, orca, crab, and the blue waterline. Load when placing decorative art, building the waterline band, or choosing imagery. Includes the cultural guardrail.
---

# PNW Tribal Art Theme

## Cultural guardrail (read first)
Coast Salish formline is specific to Lummi Nation. AI/stock imitations can be
inaccurate or appropriative.
- For the BUILD: use representative placeholder motifs so layouts are complete.
- Mark every placeholder: `<!-- TODO: replace with authentic/approved Lummi art -->`.
- Final art must be authentic, commissioned, or tribe-approved before launch.
  Never present placeholder art as final.

## The sasquatch
The company has its own sasquatch and may want to use him. He is **not** covered by the
guardrail above — a regional mascot, not tribal art — so he needs their artwork, not approval.
An illustrated treatment using him was built and rejected on review (ADR 0012); nothing here
proposes a second attempt.

## Motif library (subjects for the build)
Echo the logo's world: canoe + paddle (already in the logo), eagle, salmon, orca
(killer whale), crab, and moving water.
- **Waterline** — the signature. A horizontal blue wave band (using `--lb-teal`)
  separating sections, echoing the brand book's cyan wave. This is the theme's anchor.
- **Paddle** — dividers, list markers, scroll accents. Drawn in the motif style: ornament,
  not the logo's paddle extracted. The logo's own paddle is still never altered here — the one
  exception lives outside this skill, in the approved icon mark (see `brand-system`).
- **Salmon / orca / crab / eagle** — spot illustrations, section icons, empty-state
  art, footer band.

## Colour comes from the locked palette
Every colour here is a token defined in skill `brand-system`, which is LOCKED. Never invent
a token. In particular the waterline is `--lb-teal` fading to `--lb-navy`; `--lb-navy-deep`
is reserved for fuel prices and emphasis, so it is not available for decoration.

## Where art goes — and where it must not
Whenever art does arrive, this is the map. It survived the review that rejected the first
illustrated layer (ADR 0012) — the placement was never the objection.

**Never:** the promo region (it already competes for attention; decorating it makes the page
shout twice), the fuel price block (the most-used thing on the site, and it is a table), and
behind any body copy.

**The sticky header, amended — ADR 0021.** It was on the Never list — the locked logo owns it.
Art is allowed there now, under one hard rule:

> **No image in the header may come within 20px of the right edge of the text navigation.**
> Scaling a motif up may never cross that line.
>
> **One row of motifs, ever** — at every scale and every viewport width.
>
> **Right-aligned** — motifs gather at the far end from the navigation, and slack falls on the
> nav side, never between the nav and the first motif.

A floor, not a target: the lockup's clear space (skill `brand-system`) still applies, so art
starts at whichever of the two lands further right. Where the nav collapses to a menu button
there is no text navigation to measure from, and only the lockup rule binds.

The rule settles placement by itself. Art *behind* the nav sits left of that edge, so it is out —
just as well, because it was independently unusable: the active nav item already sits on a 16%
bone highlight, and a band behind it caps at 6% opacity in bone, 5% in white, 11% in teal.

A repeating band must use `mask-repeat: space no-repeat` — whole tiles across, nothing down.
`space` alone tiles *both* axes, so a scale control silently grows a second row; `repeat-x` cuts
the last motif in half wherever the width is not an exact multiple.

Measure the gap off the rendered boxes rather than trusting the arithmetic. `docs/proofs/motif-header.html`
reads it out live, which is how a NaN that silently dropped the band 243px inside the line
was caught.

**Ship motifs as masks, not coloured art.** A white-on-transparent SVG used as `mask-image` over
a token background: shape from the mask, colour from `brand-system`, so a motif cannot introduce
an off-brand colour. **Always pair it with an `@supports not (mask-image)` branch that hides the
decoration** — without masks every motif renders as a solid coloured rectangle. That happened in
the build, and a page of coloured blocks is far worse than a page with no art.

## Usage rules
- Style: simple, flat, 1–2 colors max (blue + one wood tone). Clean, not busy.
- Placement: decorative only — never block text or reduce contrast/legibility.
- Motifs are accents, not backgrounds behind body copy.
- Decorative SVGs get `aria-hidden="true"`; meaningful images get real alt text.
- One "hero" motif per page max; the waterline is the connective tissue between them.

## Waterline component (reusable)
Build one `<Waterline />` React component: an SVG wave band, gradient
`--lb-teal` → `--lb-navy`, used between sections and above the footer. It takes no
colour props — the token layer owns colour, so every waterline on the site matches.
Every page uses it so the brand feels consistent.
