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

**A page never lists its own Location.** On the Exit 260 page the Exit 260 card is not
rendered; the section heading becomes "Our other locations". On Home all four appear.

## Consequences
- The list is derived, not authored: the component takes the current page's Location id and
  filters it out. Nothing is hand-placed per page, which is the same rule the amenity badges
  already follow.
- On a Location page the grid drops from three cards to two. It is an auto-fitting grid, so
  the two widen rather than leaving a hole.
- The heading has two forms — "Our locations" and "Our other locations" — and which one shows
  follows from whether anything was filtered out.

## Open, and deliberately not decided here
- **What the Truck Stop callout does on the pages it belongs to.** The Truck Stop is *at* Exit
  260, so two cases need a decision rather than a guess. On `/truck-stop` the callout should
  clearly drop — the guest is on it. On the Exit 260 page it currently stays, but that page
  already carries a truck-stop summary in the locked architecture, so it would show both.
  **Recommended: drop the callout on both those pages** and let the Exit 260 page's own
  summary do that job.
