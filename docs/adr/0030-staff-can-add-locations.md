# 0030 — Staff can add a Location

Status: Accepted. Owner's direction, 2 Oct 2026: "we should add the ability to create new
locations as well." Amends the fixed three in **CONTEXT.md** (Location), **ADR 0004** (where
prices are stored) and **ADR 0009** (the order of the Location list). Constrained by
**ADR 0016** (a Tenant is never a Location).

Terms (Location, Truck Stop, Tenant, Fuel Price): `CONTEXT.md`.

## Context
The site was built on "exactly three Locations exist; there are no others in scope". The CMS
had adding switched off, the id was a closed list of three, and the fuel prices were three fixed
sets of boxes. A fourth store meant an engineer. The owner wants to add one the way they add a
page.

## Decision
**"Location Details" has an Add File button.** A new Location is a document like the first
three. Its **file name is its id and its web address** (`/locations/{file name}`), filled in
from the short name as it is typed ("Bob's Corner Store" → `bobs-corner-store`). The old
"Location ID" field is hidden; the first three keep their `id` line, which matches their file
names.

Everything that lists Locations already reads the set, so a new one appears with no further
work in: the Locations page, the Locations menu, "Our locations" cards, `/contact`, the hours
table, the sitemap, its own page with structured data, and the Other Businesses location picker.

Not automatic, on purpose:
- **The footer.** Its Visit column is the owner's own list (Site settings → Footer links,
  ADR 0029); a new store is added there by hand, where its position can be chosen.
- **The map.** It is one Google My Maps embed (ADR 0019); a pin is added in that map.
- **The fuel table**, until a price is entered — next.

**Prices.** ADR 0004 holds: every price is in `content/fuel-prices.json`. The first three keep
their fixed boxes (and the shared-price switch, which copies Exit 260 into Minimart and
Fisherman's Cove only). A Location added later is priced in a list, **Fuel Prices → Other store
prices**: one row per store, pick the Location, type its prices. The site folds those rows into
the same price map (`lib/live-shapes.ts`, `withOtherStores`), live like every price (ADR 0024).
A new Location joins the price table **once it has at least one price** — a row of dashes would
read as "sold out". Until then its own page leads its price block with Exit 260.

**Order.** A new field, "Position in lists" (1 is first), places a Location everywhere it is
listed, prices included. Left blank, the usual order holds: Exit 260, Minimart, Fisherman's Cove,
then any others A–Z. A set position wins a tie with the usual one, so a new store set to 2 is
second. `lib/location-order.ts`, with tests.

**"Show on the website"** (on unless switched off) takes a Location off the site everywhere,
its address included — for writing a store up before it opens, or retiring one. **Deleting stays
off**: a Location's address is printed, bookmarked and linked from promotions.

## Consequences
- The Locations collection is no longer a closed set; `LocationSlug` is any id. Code that needs
  the flagship still names `exit-260`, and the Truck Stop is still a record on a Location, not
  a Location (CONTEXT.md).
- A business renting space on a property is still an Other Business (ADR 0016), and a part of a
  store with its own page is still a page linked from "Also inside this location" — neither is
  a new Location.
- The brand line "one company, three locations" describes today, not a limit.
