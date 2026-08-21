---
name: location-content-model
description: The content schema for the three Lummi Bay Market locations and how they differ (names, amenities, service hours, fuel grades). Load when building location pages, the CMS config, navigation, or the fuel-price model.
---

# Location Content Model

Facts below were verified against the live sites on 2026-08-21 — see
`docs/content-harvest.md` for the transcripts and the conflicts they resolved.
Owner decisions of the same date are marked **Decided**.

## Schema (per location)
Each location is one Markdown/MDX file in `content/locations/`, defined as a TinaCMS
"Locations" collection (content lives as files in the git repo — no database):
- `id` (slug): exit-260 | mini-mart | fishermans-cove
- `name`: full name (e.g., "Lummi Bay Market at Exit 260")
- `navLabel`: short nav label (Exit 260 | Mini Mart | Fisherman's Cove)
- `aka`: legacy/alternate name(s)
- `address`, `city`, `state`, `zip`, `phone`
- `hours`: **a list of {service, hours} pairs — not one field.** See below.
- `map`: embed or lat/lng
- `fuelGrades`: which grades this location sells (drives fuel-prices.json)
- `amenities`: string list (drives badges/icons — never hand-place per page)
- `truckStop`: boolean (only exit-260 is true)
- `notice`: optional editable banner for temporary states (closures, renovations)
- `hero`: image + alt (mark placeholder if art not final)

## Hours are per service, not per location
The legacy sites got this wrong and it is the single most-contradicted fact across
them: exit260.com's home page says "Open Daily 24 Hours" while its global footer
stamps "Mon-Sun 7AM - 9PM" onto every page, and lcc-lummi.com's holiday-hours page
lists **three separate** entries for Exit 260 — store, fuel, and truck stop.

So `hours` is a list. A location may have any of: `fuel`, `store`, `truckStop`,
`kitchen`, `liquor`, `beer`, `driveThru`. Never collapse them into one string, and
never put hours in page markup — staff edit them in the CMS.

## The three locations

### 1. exit-260 — "Lummi Bay Market at Exit 260"
Nav "Exit 260". **Decided: "Salish Village" is NOT an alias.** Salish Village is a
160-acre mixed-use development at I-5 Exit 260 with its own leasing agent; the
market is its anchor tenant, not the development. Never use it as a location name.

4839 Rural Avenue, Bellingham WA 98226 · 48.815898, -122.5582847
C-store 360-778-1894 · Truck stop 360-778-1696
Hours: fuel 24 hours; store, truck stop, liquor (to midnight) and beer (to 2AM) all
differ — confirm each with the client before launch.

The flagship. 9,800 sq ft. Amenities: 16 fuel pumps; 8 diesel and DEF lanes; EV fast
chargers; tobacco/vape drive-thru (entrance relocated — approach from Rural Avenue
past the main entrance); full kitchen (chicken tenders and hot case from 11AM,
breakfast from 6AM); Piroshky Piroshky bakery; liquor and wine; beer cave; lottery;
ATM; ICEE; bagged ice. Separate **truck stop**: 51 free overnight parking spots
(check in at the fuel desk), showers, laundry, Wi-Fi, RV dump station, document
scanning, truck parts. `truckStop: true`.

`fuelGrades`: regular, midgrade, premium, diesel.
Truck-stop lanes are priced separately — see `fuel-price-update`.

Orientation lines worth keeping: "15 Minutes before Canada", "4 Minutes to Silver
Reef Casino Resort". Wendy's is at Salish Village nearby, **not** inside the market.

### 2. mini-mart — "Lummi Bay Market Minimart"
Nav "Mini Mart". 4884 Haxton Way, Ferndale WA 98248 · 360-380-2049.
Normal hours 6AM–10PM. Amenities: fuel + convenience store. `truckStop: false`.
`fuelGrades`: regular, diesel.

**Under renovation, 2026-08-17 → targeted December 2026.** Main store closed; a
temporary store runs 7AM–8PM selling tobacco, packaged beverages and snacks; pumps
remain open with cash accepted inside the temporary store. Reopening adds hot food,
an ice cream counter, and a beer cooler.

**Decided:** the page reads the way the current lcc-lummi.com page reads — the
renovation state is ordinary editable content in `notice` and `hours`. No scheduled
logic, no auto-expiry. **A human editor flips it back when the store reopens.**
Leave `TODO: Mini Mart reopening — restore normal hours (6AM–10PM), clear the
renovation notice, add hot food / ice cream / beer cooler amenities` in the content
file so whoever opens the CMS in December sees it.

### 3. fishermans-cove — "Lummi Bay Market at Fisherman's Cove"
**Decided:** nav label is **"Fisherman's Cove"**, and it may change to "The Cove"
before go-live — keep the label in data so that is a one-field edit, not a code change.
`aka`: The Cove, Gooseberry Point (the legacy holiday-hours page uses
"Gooseberry Point/Cove", and locals may too).

2570 Lummi View Drive, Bellingham WA 98226 · 360-758-2448 · open daily 6AM–9PM.
Kitchen 6AM–6PM (breakfast 6–11AM, hot case 11AM–6PM). Amenities: fuel +
convenience store, the Cove Kitchen, boat ramp access, lottery and scratch tickets,
ICEE. `truckStop: false`.
`fuelGrades`: regular, diesel, ethanol-free — **confirm ethanol-free before launch**;
it is in this model but was not found on the live site, and a boat ramp makes it
plausible rather than proven.

## Rules
- Amenity badges/icons are driven by the `amenities` list — don't hand-place them.
- Only exit-260 (truckStop: true) shows the Truck Stop summary + links to `/truck-stop`.
- Keep addresses, hours, and notices in data, never in page markup.
- Never name a location "Salish Village".
- The footer "Lummi Commercial Companies" link is global, not per-location.
