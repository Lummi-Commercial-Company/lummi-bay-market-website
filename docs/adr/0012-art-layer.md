# 0012 — The art layer: built, reviewed, rejected

Status: **Rejected** — the illustrated layer was built, shown, and turned down on review
(2026-08-25). It has been removed from the build. What survives is recorded below: the
placement rule, which was never the problem, and two defects worth not rediscovering.

**What was removed:** wave waterlines, a shoreline band with cedars and the sasquatch,
per-Location motifs (canoe, salmon, crab), a paddle mark on section labels, and sasquatch tracks
on the Truck Stop callout. The waterline is a plain token bar again and the Location motifs are
marked placeholder boxes.

**What was kept:** the promo region's real layout and copy — that was content, not decoration,
and the rejection was of the art. The `aria-label` fix below is load-bearing for it.

Terms (Location, Truck Stop): `CONTEXT.md`. Motif library and the cultural guardrail: skill
`pnw-tribal-art`. Colour tokens: skill `brand-system` (LOCKED). Interacts with the promo region
(ADR 0007), the location list (ADR 0009) and the fuel price block (ADR 0005).

## Why it is still here
A rejected ADR is cheaper than rediscovering the same two defects, and the placement rule is
reusable by whoever draws the real art. Nothing below is a proposal to try again.

## Context
The layout was settled and correct and read as a wireframe. The ask was to make it warmer and
more personable "without over-doing it or adding too much creative elements with the
advertising" — which is a restraint brief, not a decoration brief. The company also has a
sasquatch it can use.

## The guardrail, restated because it constrains everything below
Coast Salish formline is specific to Lummi Nation. **Nothing in this build imitates formline**,
including the placeholders. What is drawn is the *subjects* skill `pnw-tribal-art` lists —
canoe, salmon, crab, paddle, cedar, moving water — as plain flat silhouettes that make no claim
to be Coast Salish design. Every one is a **slot for commissioned or tribe-approved art, not a
proposal for it**. Fabricating the visual language, even as a placeholder that everyone intends
to replace, is the specific thing the guardrail exists to prevent: placeholders have a way of
surviving to launch.

The sasquatch is a different case and is not covered by that rule — he is the company's own
mascot and broadly regional, not tribal art.

## The placement rule (still good, independent of the art)
**Decoration lives in the page's own furniture, and nowhere else.** The full map:

| Gets art | What |
|---|---|
| The waterline bands | a wave, not a bar — the theme's anchor |
| The shoreline, above the footer | cedars, water, the sasquatch |
| Location rows | one motif per place: canoe, salmon, crab |
| Section labels | a paddle mark |
| The Truck Stop callout | sasquatch tracks, at 13% |

| Never gets art | Why |
|---|---|
| **The promo region** | it already competes for attention; decorating it makes the page shout twice |
| The fuel price block | it is the most-used thing on the site and it is a table |
| The sticky header | the locked logo owns it |
| Behind any body copy | skill rule: motifs are accents, never backgrounds under text |

The promo exclusion is the load-bearing half. It is what lets the rest of the page be warm
without the page reading as advertising: **the personality is in the furniture around the promo,
so the promo itself can stay plain.** A promo that is also decorated has to compete with its own
frame.

**One generous piece per page, at the foot.** The shoreline is 56px of real height, spent once,
at the bottom — where nothing is competing for attention. That is why it goes there and not over
the hero: the top of the page is where the title, the prices and the promo are already
negotiating, and we spent several rounds getting the phone title to 190px (ADR 0007).

**Motifs ship as CSS masks, never as coloured artwork.** The shape comes from the mask, the
colour from a locked token. A motif therefore *cannot* introduce an off-brand colour, and the
whole set restyles from the palette without touching a drawing. It also means one file per
shape rather than one per shape-and-colour.

**The sasquatch appears once per page, quietly.** A full silhouette in the shoreline treeline at
50% opacity against trees at 20%, plus tracks on the Truck Stop callout at 13%. A mascot that
reads instantly is a mascot in the way; one you notice on the second visit is the one people
mention. He is standing *in* the treeline, not in front of it.

## The two defects, which are the durable part
- **Unsupported masks render every motif as a solid coloured block.** Not a hypothetical: it
  happened in this build when the custom properties failed to parse, and a page of cedar
  rectangles is far worse than a page with no art. There is now an `@supports not (mask-image)`
  branch that hides the decorative layer entirely and returns the waterline to the plain token
  bar. Decoration degrades to nothing, never to debris.
- **A promo with real copy must not carry an `aria-label`.** The placeholders had
  `aria-label="Promo — see product details"` from when they were empty boxes. An `aria-label`
  *overrides* the element's text, so once the promos carried a real eyebrow and headline, a
  screen reader would have announced the placeholder instead of the offer — on every promo,
  sitewide. Removed. ADR 0007's rule stands, with the correction that it applies to image-only
  promos: **the accessible name must be whatever describes the offer, and it must not be two
  things.**
- All decorative elements are `aria-hidden="true"` or pseudo-elements, so none of this reaches a
  screen reader.
- The shoreline costs 36px more than the waterline it replaced, once per page. That took the
  desktop Home page to **1.72 screens — 0.03 below the Back-to-top threshold** (ADR 0011). Not a
  defect, but the threshold is now near a boundary on a real page rather than comfortably clear
  of one; real copy will settle it in the other direction.
- The promo copy on the proof is placeholder and deliberately carries **no numbers** — no cents
  off, no gallon counts. A sample offer with a figure in it is the kind of thing that gets
  screenshotted and repeated. Copy-editor owns the real thing.
- Fifteen or so silhouettes now have to be commissioned or approved before launch, and they are
  enumerated in skill `pnw-tribal-art`. That is a procurement item with a lead time, not a build
  task, and it is on the critical path in the same way the logo is.

## What this leaves open
- **The site has no illustration or photography of any kind.** That is now a known gap, not an
  oversight. Whatever fills it — commissioned Lummi art, photography of the three stores, the
  company's own sasquatch, or some combination — is an art-direction decision with a real budget
  and lead time, and it is on the critical path in the same way the logo is.
- The guardrail above does not expire. Whoever draws the final art works to it.
