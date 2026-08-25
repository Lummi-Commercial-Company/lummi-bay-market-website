---
name: location-content-model
description: The content schema for the three Lummi Bay Market locations and how they differ (names, amenities, fuel grades). Load when building location pages, the CMS config, navigation, or the fuel-price model.
---

# Location Content Model

## Schema (per location)
Each location is one Markdown/MDX file in `content/locations/`, defined as a TinaCMS
"Locations" collection (content lives as files in the git repo — no database):
- `id` (slug): exit-260 | mini-mart | fishermans-cove
- `name`: full name (e.g., "Lummi Bay Market at Exit 260")
- `navLabel`: short nav label (Exit 260 | Mini Mart | Fisherman's Cove)
- `shortLabel`: the tightest display label, for the fuel price band where horizontal
  room is scarce (Exit 260 | Mini Mart | **The Cove**). Falls back to `navLabel` when
  the two are the same. This is a third name, not a reuse of `aka` — `aka` records what
  a place is *also called*; `shortLabel` is what we *print* in a constrained slot.
- `aka`: legacy/alternate name(s)
- `address`, `city`, `state`, `zip`, `phone`, `hours`
- `map`: embed or lat/lng
- fuel prices are NOT stored here. All eight live in `content/fuel-prices.json`;
  the grades a place sells are the entries present in its price list (ADR 0004,
  skill `fuel-price-update`).
- `amenities`: string list (drives badges/icons — never hand-place per page)
- `truckStop`: boolean (only exit-260 is true)
- `hero`: image + alt (mark placeholder if art not final)

## The three locations
(Addresses/hours below pulled from lcc-lummi.com — copy-editor should confirm with the
client before launch.)

1. **exit-260** — "Lummi Bay Market at Exit 260"; nav "Exit 260"; aka Salish Village.
   4839 Rural Ave, Bellingham WA 98226 · open 24 hours · 360-778-1894. The flagship.
   Amenities: 24-hr convenience store, ~16 fuel lanes, tobacco & liquor drive-thru,
   quick-serve food, and a separate TRUCK STOP (diesel lanes, driver store, showers,
   lounge, truck parking). truckStop: true.

2. **mini-mart** — "Lummi Bay Market Mini Mart"; nav "Mini Mart".
   4884 Haxton Way, Ferndale WA 98248 · ~6AM–10PM · 360-380-2049. Next to Silver Reef
   Casino. Amenities: fuel + convenience store. truckStop: false.

3. **fishermans-cove** — "Lummi Bay Market at Fisherman's Cove"; nav "Fisherman's Cove";
   shortLabel "The Cove"; aka The Cove. 2570 Lummi View Drive, Bellingham WA 98226 · ~6AM–9PM · 360-758-2448.
   Amenities: fuel + convenience store, the Cove Kitchen, ethanol-free fuel.
   truckStop: false.

## Rules
- **The location list is derived, never authored per page** (ADR 0009). Order is Truck Stop
  callout first, then Exit 260, Mini Mart, Fisherman's Cove. The component filters out the
  page's own Location, and the heading becomes "Our other locations" when it does.
- **The Truck Stop is a second store, not a wing of Exit 260.** It shares the Exit 260 property
  physically, and that is all it shares: two c-stores, two fuel needs, two sets of customers
  (truckers at one, everything else at the other). Consequences that follow from this and not
  from anything else: the two are separate rows in the price table (ADR 0004/0005), and the
  **Exit 260 card is still listed on `/truck-stop`** — the filter drops the page's *subject*
  (there, the callout), never everything at the page's street address (ADR 0009).
- **On a phone the Location list renders as compact rows**, not stacked cards: motif, name,
  a two-line description, chevron — 78px a row against 148px a card. The whole row is the
  link, so no per-row "VISIT" label. Same component, one width breakpoint (ADR 0009).
- Amenity badges/icons are driven by the `amenities` list — don't hand-place them.
- Only exit-260 (truckStop: true) shows the Truck Stop summary + links to `/truck-stop`.
- Keep addresses/hours in data, never in page markup, so staff edit via the CMS.
- Only regular, diesel and DEF are priced on this site. Midgrade, premium and
  ethanol-free may remain Amenities, but carry no posted price.
- The footer "Lummi Commercial Companies" link is global, not per-location.
