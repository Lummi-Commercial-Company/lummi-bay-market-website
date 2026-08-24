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

**The fuel price rail is not sticky.** It sits at the top of the page and scrolls away with the
content. This is not a stylistic preference — it is required for the panel to work; see below.

**The header's top-right utility slot is not used for Rewards.** Rewards is the compact control
at the top of the rail (ADR 0005). A nav-sized pill in the header reads as wayfinding at the
same weight as Locations and Truck Stop, not as a product. The slot stays free.

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

## Consequences
- The header holds roughly 47px of every phone viewport permanently. On a 375x812 screen that
  is about 6%. Accepted: it buys the four primary destinations from anywhere on the page.
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
  it crosses is fixed, not incidental. It is `--lb-navy` throughout.
- The compact Rewards control is cedar partly because of this decision: directly beneath a
  permanently visible navy header, a navy control reads as a second nav bar (ADR 0005).

## Rejected
- **A header that hides on scroll down and returns on scroll up.** Cheaper in screen space,
  but it needs JavaScript, and it moves under the guest — the opposite of wayfinding.
- **Sticky header plus sticky price rail.** The defect above.
- **Rewards as a header pill.** Costs no page height and would have returned about 55px on a
  phone, but demotes a product to wayfinding. Recorded in ADR 0005.
