# 0008 — Primary nav is three items; Fuel Prices comes out

Status: Accepted, amended 18 Sep 2026 — the footer link is dropped; the panel is the only
entry point.
Amended again 29 Sep 2026 by ADR 0029 — on a phone the three items sit behind a ☰ menu.

Terms (Location, Truck Stop, Fuel Price): `CONTEXT.md`.

## Context
The locked architecture set four primary nav items: Home, Locations, Truck Stop, Fuel Prices.
Since then the fuel price block has become a fixture of every page (ADR 0005) and every Location
page carries its own prices in full. The nav item points at a page whose entire content is
already in front of the guest wherever they are.

## Decision
**Primary nav is Home · Locations · Truck Stop.** Fuel Prices is removed.

This also settles a question that had been open since ADR 0005 was written — whether the block
duplicates the Fuel Prices page. It does, and the block wins, because it is on every page.

**The `/fuel-prices` page is kept, but reached from the footer and from the block's "All prices"
panel rather than from the nav.** *(Amended 18 Sep 2026: the footer link is dropped — see below.
The panel is the only entry point.)* A nav item is for navigation; a page is for being found.
"Diesel prices Bellingham" and "gas prices near me" are high-intent local searches, and a page
that answers exactly that question is the natural landing page for them. Dropping the nav item
does not have to cost the search entry point, and a page with no route in is worse than either
choice — so if it is kept, it must be linked.

## Consequences
- The header has more room, which matters now that it also carries the Rewards "Get the App"
  pill (ADR 0006) and the logo lockup is 2.8:1 rather than the 4.5:1 first assumed.
- `/fuel-prices` still loads its block expanded and in flow, per ADR 0005's rule that a panel
  open on arrival cannot overlay. Nothing about that changes.
- ~~Three items sit comfortably on a phone without a hamburger, where four were tight.~~
  **Superseded 29 Sep 2026 (ADR 0029):** measured at true device widths, the header clipped
  the Get the App pill on nearly every phone, so on a phone the three items are behind a ☰.
  Still three items.
- Anything that linked to Fuel Prices as a nav destination — sitemap, footer, any copy written
  against the old IA — needs checking. ~~The footer link becomes load-bearing rather than
  decorative.~~ **Amended 18 Sep 2026: there is no footer link. The panel carries it alone.**

## Rejected
- **Retiring `/fuel-prices` entirely.** Simpler, and defensible since the block is everywhere,
  but it throws away the one page that matches a high-intent search phrase exactly. If it is
  retired later, that should be a decision about SEO, not about navigation.
- **Keeping four items and cutting something else.** Home, Locations and Truck Stop are each
  the only route to their content. Fuel Prices was the only one that was not.

## Amendment — the footer link is dropped, 18 Sep 2026

Wiring the footer link was picked up as outstanding work, having never been built. Put to the
owner before building it, the answer was to drop it:

> *"do not wire /fuel-prices into the footer ... since the price blocks are on every page, there
> is no need to have them at the footer."*

**So `/fuel-prices` has exactly one internal entry point: the "All prices" link inside the price
block's panel.** The original decision above named two because the concern was a page with no
route in. That concern is satisfied by one route, and the route it kept is the better of the two:
the panel link sits directly beneath the prices a guest is already reading, which is the moment
they want all of them, whereas a footer link sits under content about something else.

This does not retire the page and does not touch the search argument — it is still the landing
page for "gas prices near me", and search engines reach it through the sitemap, which lists it
(`app/sitemap.ts`) and always did. The footer link was never what made it findable.

### What this depends on

The reasoning rests on the price block genuinely being everywhere, which is ADR 0005's rule
(*"Prices appear on every page"*). **At the time of this amendment the build does not quite meet
it: `/rewards` renders no price block**, so a guest who lands there has no route to `/fuel-prices`
at all now that the footer link is gone. That is a defect against ADR 0005 rather than a reason to
keep the footer link — the fix is to add the block to `/rewards`, not to add a link to the footer.
Recorded here because this amendment is what makes it load-bearing: before, the footer caught it.

`/fuel-prices` itself is the other page without a block, and that is correct — ADR 0005 settled
that on that page the block *is* the page (register item C6, option A).

### Consequences

- The footer keeps four columns plus the Lummi Commercial Companies row. Nothing moves.
- `/fuel-prices` is unreachable from any page lacking a price block. Today that is `/rewards`,
  and it should be fixed at the block, not the footer.
- If the page is ever to be retired, the argument is unchanged from the original *Rejected*
  section above: that is a decision about SEO, not about navigation.
