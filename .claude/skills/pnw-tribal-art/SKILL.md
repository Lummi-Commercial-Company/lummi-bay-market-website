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

## Motif library (subjects for the build)
Echo the logo's world: canoe + paddle (already in the logo), eagle, salmon, orca
(killer whale), crab, and moving water.
- **Waterline** — the signature. A horizontal wave band gradienting `--lb-teal` →
  `--lb-navy`, separating sections and echoing the brand book's cyan wave. This is the
  theme's anchor. Those two tokens are the only colors it uses, and both come from
  skill `brand-system`.
- **Paddle** — dividers, list markers, scroll accents (never alter the logo's paddle).
- **Salmon / orca / crab / eagle** — spot illustrations, section icons, empty-state
  art, footer band.

## Usage rules
- Style: simple, flat, 1–2 colors max (blue + one wood tone). Clean, not busy.
- Placement: decorative only — never block text or reduce contrast/legibility.
- Motifs are accents, not backgrounds behind body copy.
- Decorative SVGs get `aria-hidden="true"`; meaningful images get real alt text.
- One "hero" motif per page max; the waterline is the connective tissue between them.

## Waterline component (reusable)
Build one `<Waterline />` React component: an SVG wave band, gradient `--lb-teal` →
`--lb-navy`, used between sections and above the footer. Every page uses it so the
brand feels consistent.

Owner decision (2026-08-21): the waterline gradients `--lb-teal` → `--lb-navy`, and
`brand-system` is the single color vocabulary for this project. Two tokens this skill
once named were never in the approved palette and have been removed. Never introduce a
second name for a brand color here — define colors in `brand-system` or not at all.
