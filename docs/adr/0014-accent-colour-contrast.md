# 0014 — Cedar and teal are large-graphic colours; three places already break that

Status: Accepted

Terms (Location, Truck Stop, Fuel Price): `CONTEXT.md`. Constrains the header's Rewards pill
(ADR 0006), the promo eyebrow (ADR 0007) and the fuel block's panel caption (ADR 0005). The
tokens themselves are locked by skill `brand-system` and do not move.

## Context
`docs/loose-ends.md` §3 recorded that contrast had never been measured — tap targets and layout
were measured to the pixel, colour was not measured at all. It has now been measured, with
`docs/proofs/scripts/contrast.mjs`. That script is the proof; re-run it rather than trusting the
numbers copied below.

The measurement did **not** discover a new rule. `brand-system` already says, in the locked
text: *"`--lb-teal` and `--lb-cedar` are DECORATIVE / large-graphic colors. They fail AA as
small text on light backgrounds — never use them for body copy or small labels."*

What the measurement discovered is that **the rule was written correctly and then not applied
everywhere it belonged** — the failure shape `HANDOFF.md` warns about. Three places break it,
and one of them is on every page of the site.

## What was measured

Passing, and settled:

| Pair | Ratio | Floor |
|---|---|---|
| ink on ground | 14.03 | 4.5 |
| ink @ `.70` opacity on ground | 5.38 | 4.5 |
| ink @ `.75` opacity on ground | 6.36 | 4.5 |
| navy on ground | 7.87 | 4.5 |
| navy-deep on paper (prices) | 11.49 | 4.5 |
| bone on navy (reversed) | 7.35 | 4.5 |

The opacity worry in `loose-ends.md` §3 is closed: body copy at `.70`–`.75` passes comfortably.
Prices, the most important text on the site, pass at 11.49.

Failing:

| Pair | Ratio | Floor | Where |
|---|---|---|---|
| cedar on ground / paper / bone | 3.24 / 3.41 / 3.02 | 4.5 | small labels |
| cedar @ `.75` opacity on ground | 2.34 | 4.5 | — |
| paper text on cedar fill | 3.41 | 4.5 | the Rewards pill |
| cedar fill against navy header | 2.43 | 3.0 (1.4.11) | the Rewards pill |
| teal on ground | 2.37 | 4.5 | guard only |

## Decision

**Cedar is a large-text-and-graphic colour only.** It carries text only at >=24px, or >=18.66px
bold, where it clears 3:1 on all three light grounds. Below that the text is ink or navy and
cedar is demoted to the rule, the icon or the underline beside it.

**Cedar never takes opacity.** At `.75` it measures 2.34 and fails *large* text as well. Nothing
in `brand-system` said this, because opacity was never considered. It is a hard rule now: cedar
is used at full strength or not at all.

**Teal never carries text on a light ground** (2.37). Teal as the waterline, as a divider, or as
a decorative band is unaffected — WCAG 1.4.11 exempts purely decorative graphics, and the
waterline is decorative by definition. The 2.37 figure for the waterline against ground is
reported by the script for completeness and is **not** a defect.

**The Rewards pill changes fill.** This is the consequential one. ADR 0006 put a cedar-filled
"Get the App" pill in the header's utility slot on **every page**, with `#fff` text at 9.5px on
a phone and 11px on desktop. That is 3.41:1 text on a fill that is itself 2.43:1 against the
navy header — a control that fails twice over, repeated on every page of the site.

The pill becomes **bone fill with navy text**. Bone against navy measures 7.35 for the fill
boundary and navy on bone is far above 4.5 for the label, so both failures clear at once with no
new token.

This does not overturn ADR 0006's reasoning, and that is worth being precise about. ADR 0006
chose cedar so the pill *"does not read as a fifth nav item"*. That intent is intact: what stops
the pill reading as navigation is its shape, its size and its verb — "Get the App" is an
instruction, not a noun, which is ADR 0006's own argument. Low contrast was never the mechanism;
it was a side effect, and it was the wrong one to rely on.

**The eyebrows change colour.** `.panel-cap` (9.5px), `.blk-title` (10px) and `.promo .pe`
(8.5px) in `docs/proofs/fuel-strip-proof.html` are all cedar uppercase micro-labels at 3.24:1.
In the components they are set in navy, which measures 7.87 on ground at any size.

## Consequences
- **The proof sheet is now wrong in four places and stays that way.** It is a lab notebook, not
  a source (`HANDOFF.md`), and rewriting it would cost more than it returns. This ADR is the
  correction; whoever writes the components follows the ADR, not the frames.
- Run `node docs/proofs/scripts/contrast.mjs` when any colour pairing is added. It exits with a
  count, needs no browser, and takes under a second.
- Contrast is checked **before** a component is written, not after, per `loose-ends.md` §3. The
  palette is locked, so every failure has to become a usage rule — and usage rules are far
  cheaper to apply while the component is being written than to retrofit across a built site.
- `--lb-cedar` on the navy header is still available for **non-informational** decoration, where
  1.4.11 does not apply. Only the pill is constrained here.


## Revision — the pill goes back to cedar, on the owner's call

The decision above moved the Rewards pill to a bone fill because cedar failed twice. Ownership
has ruled that cedar is the on-brand colour and asked for it back. Recorded here rather than
quietly reversed, with what it costs.

Every label colour was measured against a cedar fill first, looking for one that clears 4.5:1:

| Label on cedar | Ratio |
|---|---|
| white | 3.41 |
| bone | 3.02 |
| **ink** | **4.33** |
| navy | 2.43 |
| navy-deep | 3.37 |

**None reaches 4.5:1.** Ink is the best the locked palette offers and is 4% short. A cedar fill
cannot carry an accessible small label, and no amount of arranging changes that — the only
remedies are a darker cedar, which the locked palette forbids, or type at 18.66px bold, which
would make the pill the loudest thing in the header and undo ADR 0006's intent.

**What is fixed:** the pill takes a **bone ring**. Cedar against navy is 2.43:1 and fails
WCAG 1.4.11's 3:1 for a component boundary; bone against navy is 7.35:1 and against the cedar
fill 3.02:1, so the ring carries the boundary from both sides. That failure is gone.

**What is accepted:** the label is ink on cedar at **4.33:1 against a 4.5:1 requirement**, at
11px desktop and 10.5px phone. One control, one word pair, on every page. It is a knowing
exception, not an oversight, and it is the only one in the palette.

The fully-passing variant — bone fill, navy label — is kept one toggle away in the review pages
so the comparison stays available rather than becoming a memory. If accessibility is ever
audited formally, this is the finding that will come back, and this section is the answer to it.
