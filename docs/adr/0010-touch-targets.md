# 0010 — Touch targets on phones: the footer goes two columns

Status: Accepted

Header and the Rewards pill: ADR 0006. Nav: ADR 0008. Footer contents: `CLAUDE.md`.

## Context
The phone footer ran one column — seven links stacked, 515px tall, which is a screen and a half
of scrolling past a list of six words. Two columns halves that, and the obvious worry is that
packing links closer makes them easier to mistouch. The worry is testable, so it was tested
rather than argued.

## Decision
**Two columns on phones**, with **every link padded to a 44px-tall hit area spanning the full
column width**. The text is short; the target is not. A thumb aiming at a word should not have
to land on the word.

Measured on a 375px frame: columns are 169px wide with a 12px gutter, links 169x44, and the
footer drops from **515px to 324px** — 191px, 37% shorter.

**Two columns is not worse than one.** An aim-error simulation — aim at the centre of each
link's visible text, offset by every integer point within a radius, and hit-test what the
browser actually returns — gives an identical curve for both layouts:

| aim error | lands on the wrong link |
| --- | --- |
| ±18px | 0% |
| ±22px | 0.1% |
| ±26px | 2.6% |
| ±30px | 5.9% |

Identical, because **the failure mode is vertical, and vertical spacing did not change.**
Classifying every wrong hit at a ±30px error over 22,568 sample points: **5.9% vertical
neighbours, 0.0% horizontal.** Not one crossed the gutter. It cannot: the smallest sideways
error that leaves a target at all is 29px, and reaching the next column needs that plus the
12px gutter.

**Keep the 14px row gap.** At ±30px, 9.3% of touches land on it and do nothing. That is the
gap earning its place, not wasting space: a touch that does nothing is a better outcome than a
touch that navigates somewhere the guest did not ask for. Closing the gap would convert those
no-ops into wrong destinations.

## Consequences
- Footer links are anchors with padding, not text spans. The hit area is the styling, so it
  cannot be lost by someone restyling the text later.
- The "Lummi Commercial Companies" link spans both columns under a rule, as ADR 0001 requires —
  one link, still the only mention.
- The method generalises: aim at the text, offset, hit-test what the browser returns. It is the
  way to settle any "is this too close together" question on this project without arguing.

## Open
**The phone header's nav still fails this test and has not been fixed.** Its items measure
26px, 43px and 48px wide against the 44px guideline (ADR 0006). The bar has 52px of height to
spend, so padding them vertically is free; padding them horizontally is not, because that bar
already has zero slack. This is the one place on a phone where the targets are known to be
short, and it is the header — the thing on every page.
