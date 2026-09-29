# 0010 — Touch targets on phones: the footer goes two columns

Status: Accepted
**Amended 29 Sep 2026 by ADR 0029:** the phone header no longer carries the nav (it is behind a
☰), so the phone nav measurements below describe a header that is gone. The footer rule — two
columns, every link a 44px-tall target — stands.

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

## The header, fixed the same way
The phone header nav failed this test when the footer was written: items 26px, 43px and 48px
wide against the 44px guideline. Fixed by spending the bar's height, which is cheap, and its
width, which is not:

- **Nav items and the Rewards pill are 44px tall targets.** The bar grows 52px → **56px**. That
  is the whole cost, once, on a sticky header.
- **Nav items are 53px and 58px wide** — a 44px `min-width` with 5px of padding, so a short word
  never makes a short target.
- **The pill's hit area is the anchor, not the cedar shape.** The shape keeps its size; the
  anchor around it is 44px tall. A filled button forced to 44px would have dominated the bar.
- **`flex-wrap: nowrap` on the phone nav.** It wrapped silently to a second row before, which is
  the worst failure mode for a sticky header — it doubles the chrome on every page and nobody
  notices in review. Now an overfill overflows visibly instead.
- **The pill drops "Get the" below 370px.** The same "drop the word there is no room for" call
  already made for the condensed bar's affordance. `★ Get the App` at 375px and up; `★ App`
  below.

Width budget after, measured, `available / needed`: **375px → 349/325**, 360px → 334/279,
320px → 294/279. No overflow at any of them; the 2016-era 320px phones were previously broken.

Aim-error simulation on the header, same method as the footer:

| aim error | wrong target |
| --- | --- |
| ±22px | 0% |
| ±26px | 0% |
| ±30px | 0% |
| ±34px | 0.9% |

Better than the footer (2.6% wrong at ±26px), for a structural reason: the footer's neighbours
are directly above and below, while the header's are beside, separated by a 4px gutter, with
nothing above or below the bar. Vertical overshoot leaves the bar and hits nothing — 16% of
touches at ±30px land on no target, which is the correct outcome for a slip.

**Desktop got the lower bar it needs**, not the phone one: nav items are 40px tall and 44–71px
wide. 44px is a thumb standard, but a 12px-tall link fails the 24px minimum that applies to any
input, and laptops have touchscreens. The desktop bar stays 58px — its existing padding already
had the room.
