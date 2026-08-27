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
- `cardLine`: the single line under the name in a Location card — **street, then hours**,
  e.g. `4839 Rural Ave · Open 24 hours`. Derived from `address` + `hours` where those are
  clean; stored when they are not, because the card wants "4839 Rural Ave", not the full
  postal address. **It truncates, it never wraps** — see the budget in the Rules below.
- `map`: embed or lat/lng
- fuel prices are NOT stored here. All eight live in `content/fuel-prices.json`;
  the grades a place sells are the entries present in its price list (ADR 0004,
  skill `fuel-price-update`).
- `amenities`: string list (drives badges/icons — never hand-place per page)
- `truckStop`: boolean (only exit-260 is true). **Under review — it wants to be a record.**
  The Truck Stop now has its own hours (24 hours), its own amenity set (diesel lanes, DEF,
  showers, driver lounge, secondary store, truck parking) and **its own phone,
  360-778-1696** (confirmed). Three fields hanging off a boolean is the schema asking to be
  `truckStop: { phone, hours, amenities }`, present or absent. Until it changes, the phone
  has nowhere to live — `phone` on the Location is the main store's.
- `hero`: image + alt (mark placeholder if art not final)

## The three locations
(Addresses/hours below pulled from lcc-lummi.com — copy-editor should confirm with the
client before launch.)

1. **exit-260** — "Lummi Bay Market at Exit 260"; nav "Exit 260"; aka Salish Village.
   4839 Rural Ave, Bellingham WA 98226 · open 24 hours · 360-778-1894. The flagship.
   Amenities: 24-hr convenience store, ~16 fuel lanes, tobacco & liquor drive-thru,
   quick-serve food, and a separate TRUCK STOP (diesel lanes, driver store, showers,
   lounge, truck parking). truckStop: true.
   **The Truck Stop's own phone is 360-778-1696** — confirmed, unlike everything else on this
   page. A driver asking about showers or the diesel lanes should reach the truck side, not
   the main store, so `/contact` and the Truck Stop page both use it.

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
  `cardLine`, chevron — 61px a row against 148px a card. The whole row is the link, so no
  per-row "VISIT" label. Same component, one width breakpoint (ADR 0009).
- **`cardLine` has a hard length budget**: it is one line that truncates with an ellipsis rather
  than wrapping. Measured slack past the longest current string is 74px at 375px, 59px at 360px
  and 33px at 320px — roughly five characters on the narrowest common phone. Write hours as
  `6am–9pm`, never `6:00 AM – 9:00 PM`; the street comes first, so anything over budget cuts the
  hours. If a Location genuinely needs a longer line, shorten the street form before touching
  the layout.
- The card line carries **where it is and when it is open — not what it sells**. Amenities live
  in `amenities` and render on the detail page. A list view is for choosing between places.
- Amenity badges/icons are driven by the `amenities` list — don't hand-place them.
- Only exit-260 (truckStop: true) shows the Truck Stop summary + links to `/truck-stop`.
- Keep addresses/hours in data, never in page markup, so staff edit via the CMS.
- Only regular, diesel and DEF are priced on this site. Midgrade, premium and
  ethanol-free may remain Amenities, but carry no posted price.
- The footer "Lummi Commercial Companies" link is global, not per-location.
