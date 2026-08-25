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
The company has its own sasquatch. He is **not** covered by the guardrail above — a regional
mascot, not tribal art — so unlike everything else here he does not need approval, only their
artwork. Rules: **one appearance per page, quietly.** A full silhouette in the shoreline
treeline (50% against trees at 20%) and tracks on the Truck Stop callout at 13%. He stands *in*
the treeline, not in front of it. A mascot that reads instantly is a mascot in the way; one you
notice on the second visit is the one people mention. See ADR 0012.

## Motif library (subjects for the build)
Echo the logo's world: canoe + paddle (already in the logo), eagle, salmon, orca
(killer whale), crab, and moving water.
- **Waterline** — the signature. A horizontal blue wave band (using `--lb-teal`)
  separating sections, echoing the brand book's cyan wave. This is the theme's anchor.
- **Paddle** — dividers, list markers, scroll accents (never alter the logo's paddle).
- **Salmon / orca / crab / eagle** — spot illustrations, section icons, empty-state
  art, footer band.

## Colour comes from the locked palette
Every colour here is a token defined in skill `brand-system`, which is LOCKED. Never invent
a token. In particular the waterline is `--lb-teal` fading to `--lb-navy`; `--lb-navy-deep`
is reserved for fuel prices and emphasis, so it is not available for decoration.

## Where art goes — and where it must not (ADR 0012)
| Gets art | What |
|---|---|
| Waterline bands | a wave, not a bar |
| The shoreline above the footer | cedars, water, the sasquatch — the one generous piece |
| Location rows | one motif per place: canoe (Exit 260), salmon (Mini Mart), crab (The Cove) |
| Section labels | a paddle mark |
| The Truck Stop callout | tracks, 13% |

| Never | Why |
|---|---|
| **The promo region** | it already competes for attention; decorating it makes the page shout twice |
| The fuel price block | the most-used thing on the site, and it is a table |
| The sticky header | the locked logo owns it |
| Behind body copy | accents, never backgrounds |

The promo exclusion is what lets the rest of the page be warm. The personality sits in the
furniture *around* the advertising, so the advertising can stay plain.

## Ship motifs as masks, not as coloured art
Each motif is a white-on-transparent SVG used as a CSS `mask-image` over a token background:
shape from the mask, colour from `brand-system`. A motif therefore cannot introduce an
off-brand colour, and the whole set restyles from the palette. One file per shape, not one per
shape-and-colour.

**Always ship the `@supports not (mask-image)` branch with it.** Without masks every motif
renders as a solid coloured rectangle — this happened in the build, and a page of cedar blocks
is far worse than a page with no art. Decoration must degrade to nothing, never to debris.

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
