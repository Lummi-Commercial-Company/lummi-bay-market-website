# 0021 — Motifs in the header: the rule that replaced the prohibition

Status: **Accepted** (2026-09-15). Supersedes one row of ADR 0012's placement table and the
matching line in skill `pnw-tribal-art`. The rules themselves were applied in code on
2026-08-28; this records them and the measurements behind them.

Terms (Location, Truck Stop): `CONTEXT.md`. Colour tokens and the logo's clear space: skill
`brand-system` (LOCKED). Motif library and the cultural guardrail: skill `pnw-tribal-art`.
The placement map this amends, and the mask defect it inherits: ADR 0012. Contrast method:
ADR 0014. The header itself: ADR 0006. The one prior exception to a placement rule: ADR 0020.

## Context
The ask was art in the header bar — a band of motifs behind the navigation, reference image
supplied, "some continuation of the tribal feel." Then, once it existed, three constraints in
quick succession: keep it 20px clear of the navigation, never more than one row, right-align it.

The header was on the **Never** list. ADR 0012's placement table says *the sticky header — the
locked logo owns it*, and skill `pnw-tribal-art` repeated it. So the first question was not how
to build it but whether the prohibition still meant what it said.

It turned out to mean something narrower than it read. **"The locked logo owns it" is an
objection about clear space**, not about the header as a surface. A band that never enters the
lockup's clear space does not take anything the logo owns. That is answerable by geometry, and
the answer is measurable.

## Decision
**The header may carry a motif band, under four rules.** Three are ownership's; the fourth is
inherited from ADR 0012's defect list. None of them is a preference — each one is either a
measured floor or a failure mode that has already happened in this build.

| Rule | What it prevents |
|---|---|
| **20px clear of the text navigation's right edge** | art crowding the nav, and art behind the nav |
| **One row of motifs, ever** | a scale control silently producing a layout nobody chose |
| **Right-aligned** | slack falling between the nav and the first motif |
| **Masked over a token colour, with a no-mask fallback** | off-brand colour, and a header of solid rectangles |

The band is decorative: `aria-hidden="true"`, no pointer events, hidden under
`prefers-contrast: more`.

### 20px clear of the navigation

> **No image in the header may come within 20px of the right edge of the text navigation.**
> Scaling a motif up may never cross that line.

It is a **floor, not a target.** The lockup's own clear space (skill `brand-system`) still
applies, so art starts at whichever of the two lands further right. Where the navigation
collapses to a menu button there is no text navigation to measure from, and only the lockup
rule binds.

The rule settles placement by itself: art *behind* the nav sits left of that edge, so it is out.
That is the whole of the decision, and it happens to agree with the measurement below.

### Behind the nav was independently unusable, and the number is not close
Before the rule existed, "behind the nav" was built and measured. A lighter band raises the
background luminance and eats the contrast of the bone nav text sitting on it.

**The binding case is the active item, not the plain links.** `Home` already sits on a 16% bone
highlight, so it starts lighter than its neighbours before any motif exists — 5.06:1 against a
4.5 floor, most of the headroom already spent. Measured against `--lb-navy` with the band
composited under that highlight:

| Ink | Ceiling | Active item at the ceiling | Plain link at the ceiling |
|---|---|---|---|
| Bone `#F5F1E8` | **6%** | 4.50 | 6.40 |
| White `#FFFFFF` | **5%** | 4.55 | 6.47 |
| Teal `#0FB5C4` | **11%** | 4.53 | 6.38 |

At those opacities the art is barely visible, so the entire contrast budget buys something
nobody sees. **Measuring the plain links alone would have missed this** — they hold 6.4:1 at the
point where the active item fails, which is exactly the kind of near-miss that ships.

Clear of the nav, none of it binds: nothing sits on the band, so opacity and scale are taste
decisions rather than compliance ones.

### One row, right-aligned — and why the repeat mode is the whole of it
Of the three plausible `mask-repeat` values, only one satisfies both rules:

- `repeat-x` — cuts the last motif in half wherever the band width is not an exact multiple.
- `space` — lays down whole tiles and distributes the slack, but tiles **both axes**: below
  roughly half the header height it grew a second row on its own. The scale slider could
  produce a layout nobody chose.
- **`space no-repeat`** — whole tiles across, nothing down. One row at every scale and width.

`mask-position` is `right center`, so motifs gather at the far end from the navigation and slack
falls on the nav side. Where several tiles fit, `space` pins the first and last to the band's two
edges and spreads the gap between them, so it fills the width either way and the alignment only
shows when a single tile fits.

**A tile only repeats if it fits.** The mixed four-motif strip is one tile roughly 272px wide, so
in the phone's ~115px gap no whole tile can ever fit and `space` degrades to a single clipped
tile. That is what made the band look cut in half on the phone — the tile, not the repeat mode.
The phone tiles a **single** motif, which fits at any width the header can produce.

### Masked, not painted
The band is a `mask-image` over a token background: shape from the SVG, colour from
`brand-system`. A motif cannot introduce an off-brand colour, and re-tinting the whole band is
one token.

`@supports not ((-webkit-mask-image:none) or (mask-image:none))` hides the decoration entirely.
This is not defensive habit — it is ADR 0012's first durable defect: without the branch every
motif renders as a solid coloured rectangle, and that has happened in this build. Decoration
degrades to nothing, never to debris.

### Navy deep would solve the hard case, and is not available
A *darker* ink raises contrast with bone text instead of eating it, which would make the
behind-the-nav placement work outright. The obvious candidate is `--lb-navy-deep` — but skill
`pnw-tribal-art` reserves it for fuel prices and emphasis and states it is not available for
decoration, so it is not offered. **If ownership releases it for this, the constraint changes
and this ADR should be revisited.** It is the only live route back to art behind the nav.

## The rule this breaks
ADR 0012's placement table lists the sticky header under **Never gets art**, reason: *the locked
logo owns it*. That row is amended, not deleted — the reason was sound and is now satisfied by
construction rather than by prohibition.

The exception is narrow and does not generalise:
- It covers **the header band only**. Every other row of that table stands, and the promo
  exclusion in particular is still the load-bearing half.
- It does not weaken the guardrail. The motifs here are placeholders under the same rule as
  everywhere else.
- It survives because the objection was answerable by measurement. *"The logo owns the header"*
  became *"art starts 20px past the navigation and after the lockup's clear space, whichever is
  further right,"* which is a number a reviewer can check.

This is the second exception to a placement rule, after ADR 0020's mascot backdrop. Two is a
pattern worth naming: **a placement rule holds until someone can state the objection as a
measurable distance, and then it becomes that distance.** A third exception without a number
behind it should be refused.

## What is still a placeholder
The motifs are **flat silhouettes — orca, salmon, eagle, canoe — and they look like placeholders
on purpose.** The guardrail in skill `pnw-tribal-art` exists because imitations of Coast Salish
formline can be inaccurate or appropriative. A silhouette that obviously is not the real thing
cannot be mistaken for finished art; a convincing imitation is the failure mode, not the goal.

Every instance is marked `TODO: replace with authentic/approved Lummi art`. Authentic,
commissioned or tribe-approved art replaces them before launch. ADR 0012's warning applies:
placeholders have a way of surviving to launch, and a header band is on every page.

## Consequences
- ADR 0012's placement table and skill `pnw-tribal-art` both carry the amendment. Leaving a flat
  prohibition in either while the site does the opposite is how a rule stops being read.
- **Measure the gap off the rendered boxes, not the arithmetic.** The proof at
  `docs/proofs/motif-header.html` reads it out live. That caught a real bug in this work: the
  placement code took `lock.right` where `lock` was the element and its rect was `l`, producing
  `NaN`, so the style was dropped and the band fell back to a CSS default **243px inside** the
  line it was meant to respect — while looking entirely correct on screen.
- The ceilings above assume the current nav: three items, the active one on a 16% bone highlight.
  A fourth nav item, a different highlight, or a change to `--lb-navy` invalidates them. They
  only matter if someone revisits behind-the-nav placement, which today only releasing
  `--lb-navy-deep` would justify.
- On the phone the 20px rule cannot bind, because there is no text navigation. Only the lockup's
  clear space holds the band there. If the phone header ever gains text navigation, this needs
  re-checking rather than assuming it carried over.
- One more surface where a placeholder must not survive to launch, on every page.
