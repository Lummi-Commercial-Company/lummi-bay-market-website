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
Truck Stop, Exit 260, Minimart, Fisherman's Cove.

**A page never advertises itself.** On the Exit 260 page the Exit 260 card is not rendered; the
section heading becomes "Our other locations". On `/truck-stop` the Truck Stop callout is not
rendered. On Home everything appears.

**The callout stays on the Exit 260 page**, even though that page already carries a truck-stop
summary in the locked architecture. Exit 260 is the truck stop's home, and two routes to it
from the page it lives on is emphasis, not duplication.

**The Exit 260 card stays on `/truck-stop`.** This was raised as a possible redundancy — the
truck stop *is* at Exit 260, so listing Exit 260 on the truck stop's own page looks like a page
listing itself. It is not, and the reason is a fact about the business rather than a layout
preference: **Exit 260 and the Truck Stop are two c-stores sharing one property.** Different
stores, different fuel needs, different customers — truckers at one, everything else at the
other. A driver reading `/truck-stop` who wants the main store needs that card, and the union
rule in ADR 0005 already treats them as two rows for exactly the same reason.

This is why "a page never advertises itself" is scoped to the page's **subject**, not its
address. `/truck-stop`'s self is the callout, which is dropped; the Exit 260 Location is a
different destination at the same street address, and stays.

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
  different lengths.

**On a phone the list is a list, not a stack of cards.** Three stacked cards ran **439px** on a
375px screen — over half a viewport spent on three names. The compact row is motif, name, one
line, chevron: **61px per row, 199px for three**, a **240px saving — 55%**.

Three-across was measured first, since it is the obvious fix and it is worse: **88px columns**,
`Fisherman's` rendering **100px wide inside an 88px box**, body copy at **8 / 6 / 4 lines**, and
only a 150px saving. Less room saved, for text that cannot be read.

The per-row `VISIT →` label goes with it. The whole row is the link, so three rows carried three
identical labels for three different destinations; a chevron says the same thing in 18px. This
is a phone-width rendering of the same component, not a second component.

**The description is one line, and it is the street and the hours** — "4839 Rural Ave · Open 24
hours". Not a sentence about the place: the two facts a guest picking between three stops
actually needs. The amenities that used to be in that sentence are already the `amenities` list
and belong on the detail page, so nothing was lost, only moved off a list view. This is a change
to the field, not a phone-only string, so the desktop card takes it too and drops **108px → 89px**.

**The line truncates rather than wrapping, which makes its length a copy budget.** Slack from the
end of the longest string to the edge of its box: **74px at 375, 59px at 360, 33px at 320** —
about five characters on the narrowest common phone, and that is *after* a step down one type
size below 340px, which buys back 14px. Concretely: hours must stay in the `6am–9pm` form.
`6:00 AM – 9:00 PM` does not fit, and it is the hours that get cut, because the street comes
first. Truncating with an ellipsis is the right failure here — the row height is fixed either
way, and a wrap would push every row below it.
- The heading has two forms — "Our locations" and "Our other locations" — and which one shows
  follows from whether anything was filtered out.
