# 0008 — Primary nav is three items; Fuel Prices comes out

Status: Accepted

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
panel rather than from the nav.** A nav item is for navigation; a page is for being found.
"Diesel prices Bellingham" and "gas prices near me" are high-intent local searches, and a page
that answers exactly that question is the natural landing page for them. Dropping the nav item
does not have to cost the search entry point, and a page with no route in is worse than either
choice — so if it is kept, it must be linked.

## Consequences
- The header has more room, which matters now that it also carries the Rewards "Get the App"
  pill (ADR 0006) and the logo lockup is 2.8:1 rather than the 4.5:1 first assumed.
- `/fuel-prices` still loads its block expanded and in flow, per ADR 0005's rule that a panel
  open on arrival cannot overlay. Nothing about that changes.
- Three items sit comfortably on a phone without a hamburger, where four were tight.
- Anything that linked to Fuel Prices as a nav destination — sitemap, footer, any copy written
  against the old IA — needs checking. The footer link becomes load-bearing rather than
  decorative.

## Rejected
- **Retiring `/fuel-prices` entirely.** Simpler, and defensible since the block is everywhere,
  but it throws away the one page that matches a high-intent search phrase exactly. If it is
  retired later, that should be a decision about SEO, not about navigation.
- **Keeping four items and cutting something else.** Home, Locations and Truck Stop are each
  the only route to their content. Fuel Prices was the only one that was not.
