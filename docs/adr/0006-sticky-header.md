# 0006 — The site header is sticky; the fuel price rail is not

Status: Accepted

Terms (Location, Truck Stop, Fuel Price): `CONTEXT.md`. The fuel price block's own display
contract is ADR 0005; this ADR decides the header it sits under, and the one rule that
interaction forced.

## Context
The locked architecture gives every page a header carrying the Market lockup and the four
primary nav items — Home, Locations, Truck Stop, Fuel Prices — plus an optional top-right
utility slot. Location pages and the Truck Stop page are long: amenities, hours, directions,
photos. A guest who scrolls to the bottom of the Exit 260 page to read the truck-stop summary
has no way back to the nav but to scroll all the way up.

Separately, ADR 0005 put the fuel price block in a right-hand rail and opens it as an HTML
popover, which renders in the browser's **top layer**. A top-layer element outranks every
z-index on the page. A sticky header and a top-layer panel are exactly the pair that fights.

## Decision
**The header is sticky.** It pins to the top of the viewport at every width and stays there for
the whole scroll. This is what "exceptional navigation" asks for on pages that are long enough
to lose the guest.

**The fuel price rail is not sticky while its panel is anchored to it.** An anchor-positioned
panel plus a sticky anchor is broken; see below. On phones that is the whole story — the rail
sits at the top of the page and scrolls away.

**On desktop the block is sticky, because its panel stopped being anchored.** Once the page has
scrolled through the block's middle it condenses to a one-line bar pinned under the header, and
its panel is positioned against the viewport rather than against the block (ADR 0005). With no
`position-anchor` in play the defect below cannot occur: retested with a sticky block and a
viewport-fixed panel, scrolled 1200px, clicking inside the open panel reached the panel 3 of 3.
The rule here was always conditional on the mechanism; the mechanism changed, so the rule did.

**The header's top-right utility slot carries a "Get the App" pill on every page.** This
reverses an earlier decision recorded here twice — that a nav-sized pill would read as
wayfinding rather than as a product, so the slot should stay free. It is settled the other way.

Two things make the reversal work rather than merely overrule the objection. The label is an
**instruction, not a noun**: "Get the App" asks for an action where a bare "Rewards" pill would
have sat at the same weight as Locations and Truck Stop. And it is **cedar on the navy header**,
so it does not read as a fifth nav item. Being global, Rewards now appears exactly once per
page and always in the same place: interior pages lose the rail entirely (prices become a band
below the header, ADR 0005) and Home's rail is the price card alone.

## Why the rail cannot be sticky
Pinning the price card under the pinned header is the obvious next move — prices would follow
the guest down the page. It was built and tested, and it breaks the panel.

With a `position: sticky` price card, after roughly 300px of scroll the open panel is **painted
in the correct place but is not there for the pointer**. Hit-testing a point inside the visibly
open panel returns the collapsed card behind it; the click reaches that card, and light-dismiss
then closes the panel. The guest sees a panel, taps a price, and the panel vanishes. Reproduced
3 of 3 runs. A non-sticky card, scrolled the same distance, hit-tests correctly.

The good news from the same test: **the panel never covers the sticky header.** The top-layer
worry does not materialise, because the panel is anchored to a card that sits below the header
and opens downward. Hit-tested inside the header at scroll offsets 0, 300, 900 and 1800 with
the panel open, the header answered every time.

**On a phone the logo carries Home; the nav carries the other two.** Measured at 375px — the
*widest* common phone — the bar needs exactly its full 349px of usable width for logo +
three nav items + the "Get the App" pill. Zero slack. At 360px (common Android) or 320px
(iPhone SE) it overflows or the nav wraps to a second line, and a two-row sticky header costs
that height on every page and every scroll.

The three destinations are all still reachable: the Market lockup links Home, as the locked
architecture already specifies, and the nav shows Locations · Truck Stop. This is the same
"drop what there is no room for" call already made for the condensed bar's affordance, applied
to the header. The alternatives were an icon-only Rewards pill (measured to fit with 59px to
spare, but it strips the words off a decision made deliberately to keep Rewards prominent) and
a hamburger drawer (fits everything, hides everything behind a tap, and is more machinery than
three destinations warrant).

*Resolved (ADR 0010):* the nav items are now 44px-tall targets, 53px and 58px wide, and the
**phone bar is 56px, not 52px** — the 4px is what a row of real tap targets costs. The pill
drops "Get the" below 370px to keep the width budget honest, and the phone nav is
`flex-wrap: nowrap` so an overfill shows as an overflow instead of silently becoming a second
row of sticky header.

## Consequences
- The header holds **56px** of every phone viewport permanently — about 7% of a 375x812 screen.
  Accepted: it buys the primary destinations from anywhere on the page. It has grown twice for
  reasons, not for taste: 47px → 52px when the logo lockup was measured at its real ratio (see
  below), and 52px → 56px to seat a row of 44px tap targets (ADR 0010).
- ~~**The supplied logo cannot sit on a navy header.**~~ **Resolved — the header stays navy.**
  This ADR recorded the lockup as a navy wordmark on a light ground against a `--lb-navy`
  header: navy on navy, 1.6:1, and a locked logo that may not be recoloured to fix it. Two
  ways out were offered, both the client's call — an approved reversed lockup, or a light
  header ground. **A reversed lockup was supplied**, so the first option carried and the
  header's ground never had to change. The white wordmark measures **8.28:1** against
  `--lb-navy`. The header's final styling is no longer blocked.
- The lockup is roughly **2.8:1**, not the 4.5:1 slot the mockups had assumed. Correcting it is
  what moved the phone header from 47px to 52px, before tap targets took it to 56px. **The
  supplied files confirm 2.8:1** — both 336 x 120 rasters match it exactly. What varies between
  files is the *ink* inside that canvas (3.06:1 in the on-dark lockup, 3.10:1 in the on-light
  one), which is a per-file cropping difference, not a reason to revisit the header height.
- **Chromium 141 only.** It is the one engine available in the build container. The sticky
  failure is an anchor-positioning interop bug of exactly the kind that varies by engine, so
  Safari and Firefox still need checking. The decision is safe either way — not making the
  rail sticky avoids the whole class of problem rather than working around one instance.
- If prices should later follow the guest down the page, that is a **different mechanism** —
  a separate pinned element, or a nav item that opens the panel — not a `position` change on
  the rail. Changing the rail to sticky reintroduces the defect above.
- In-page anchor links need `scroll-margin-top` equal to the header height, or targets land
  underneath the pinned header.
- The header is now permanently over page content, so its contrast against every background
  it crosses is fixed, not incidental. It is `--lb-navy` throughout, and now settled: the
  reversed lockup resolved the logo question without changing that ground.
- The compact Rewards control is cedar partly because of this decision: directly beneath a
  permanently visible navy header, a navy control reads as a second nav bar (ADR 0005).

## Rejected
- **A header that hides on scroll down and returns on scroll up.** Cheaper in screen space,
  but it needs JavaScript, and it moves under the guest — the opposite of wayfinding.
- **Sticky header plus a sticky, anchor-positioned price rail.** The defect above. A sticky
  block whose panel is viewport-positioned is a different thing and is now the desktop
  behaviour (ADR 0005).
- ~~**Rewards as a header pill.**~~ Rejected twice, then adopted — see the Decision above.
  It costs no page height, which is what it was always worth; the objection was about
  emphasis, and the "Get the App" wording answers it.

## Amendment — the logo question, closed

*Recorded after the real logo files reached the repo. The decision above is unchanged; only its
one open consequence is.*

**The header stays `--lb-navy`.** A reversed lockup was supplied, so the light-ground alternative
this ADR offered was never needed. Rendered evidence: `docs/proofs/logo-in-use.html`.

Three things about the supplied art that the header depends on:

- **It ships as PNG, not vector.** A vector arrived and was rejected by ownership: its paddle
  rendered pale and ungrained where the approved raster's is saturated cedar with visible grain,
  and a locked logo cannot ship art that does not match. The file is archived, unserved, at
  `assets/brand-source/logo-market.svg`. This costs the header nothing — measured, the rasters
  clear 3x device pixel ratio at every size the logo appears at.
- **Two files, named for the background they sit on.** `logo-market-on-dark.png` carries the
  white wordmark and is the header's; `logo-market-on-light.png` carries the navy one. They were
  briefly named `logo-market.png` and `logo-market-reversed.png`, and got swapped, because
  "reversed" and "light" each read as either the ink or the ground. The name states the
  background so it cannot be read backwards. `logo-market-on-dark@3x.png` is a density variant,
  referenced only from `srcset`.
- **2.8:1 held up.** See the amended consequence above.

What is *not* resolved by this: the favicon. The supplied set carries the full lockup, which is a
3:1 band and unreadable at 16px, and ownership has ruled that the paddle alone is not acceptable
as a standalone mark. A favicon therefore needs new art. That is a brand item with a lead time,
not a header question, and it does not block anything this ADR decides.
