# 0009 — The location list: Truck Stop first, and a page never lists itself

Status: Accepted

Terms (Location, Truck Stop): `CONTEXT.md`. Location data and the `shortLabel` field:
skill `location-content-model`.

## Context
Every page ends with a list of where to find us: a Truck Stop callout and a card per Location.
Two things were wrong with it. The Truck Stop sat below the three Locations even though it is
the flagship's distinguishing feature and the reason a whole class of guests is on the site at
all. And every page listed every Location, including the one the guest was already reading.

## Decision
**The Truck Stop callout leads the list**, above the Location cards, at both widths. Order is
Truck Stop, Exit 260, Mini Mart, Fisherman's Cove.

**A page never advertises itself.** On the Exit 260 page the Exit 260 card is not rendered; the
section heading becomes "Our other locations". On `/truck-stop` the Truck Stop callout is not
rendered. On Home everything appears.

**The callout stays on the Exit 260 page**, even though that page already carries a truck-stop
summary in the locked architecture. Exit 260 is the truck stop's home, and two routes to it
from the page it lives on is emphasis, not duplication.

## Consequences
- The list is derived, not authored: the component takes the current page's Location id and
  filters it out. Nothing is hand-placed per page, which is the same rule the amenity badges
  already follow.
- On a Location page the grid drops from three cards to two, and **the row still fills the
  content column**: `repeat(auto-fit, minmax(220px, 1fr))`, not `repeat(3, 1fr)`. Auto-fit
  collapses the vacated track, so the two survivors split the width 50/50 — measured 398px
  each in an 810px column — instead of holding third-width and leaving 288px of dead space on
  the right. A fixed three-track grid looks correct on Home and broken on every Location page,
  which is exactly the bug that gets shipped, because Home is what gets reviewed.
- The desktop card puts the motif **beside** the name rather than above it, which takes the
  card from 151px to 108px tall. The `VISIT` link is floor-aligned (`align-self: end` on a
  `auto 1fr auto` row set) so the links line up across cards whose descriptions run to
  different lengths. Phone cards keep the stacked form — they are full-width there, so
  height is not the constraint.
- The heading has two forms — "Our locations" and "Our other locations" — and which one shows
  follows from whether anything was filtered out.
