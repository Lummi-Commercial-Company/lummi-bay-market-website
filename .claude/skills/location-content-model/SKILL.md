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
- `aka`: legacy/alternate name(s)
- `address`, `city`, `state`, `zip`, `phone`, `hours`
- `map`: embed or lat/lng
- `fuelGrades`: which grades this location sells (drives fuel-prices.json)
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
   fuelGrades: regular, midgrade, premium, diesel.

2. **mini-mart** — "Lummi Bay Market Mini Mart"; nav "Mini Mart".
   4884 Haxton Way, Ferndale WA 98248 · ~6AM–10PM · 360-380-2049. Next to Silver Reef
   Casino. Amenities: fuel + convenience store. truckStop: false.
   fuelGrades: regular, diesel.

3. **fishermans-cove** — "Lummi Bay Market at Fisherman's Cove"; nav "Fisherman's Cove";
   aka The Cove. 2570 Lummi View Drive, Bellingham WA 98226 · ~6AM–9PM · 360-758-2448.
   Amenities: fuel + convenience store, the Cove Kitchen, ethanol-free fuel.
   truckStop: false. fuelGrades: regular, diesel, ethanol-free.

## Rules
- Amenity badges/icons are driven by the `amenities` list — don't hand-place them.
- Only exit-260 (truckStop: true) shows the Truck Stop summary + links to `/truck-stop`.
- Keep addresses/hours in data, never in page markup, so staff edit via the CMS.
- The footer "Lummi Commercial Companies" link is global, not per-location.
