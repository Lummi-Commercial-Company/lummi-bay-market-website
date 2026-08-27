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
shout twice), the fuel price block (the most-used thing on the site, and it is a table), the
sticky header (the locked logo owns it), and behind any body copy.

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
