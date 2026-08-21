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

**Decided: trust the page, not the legacy footer.** Where a page states its own
hours, those are the hours. The footer's "Mon-Sun 7AM - 9PM" is a global Squarespace
template stamped onto pages that contradict it, and is not evidence of anything.

So `hours` is a list. A location may have any of: `fuel`, `store`, `truckStop`,
`kitchen`, `liquor`, `beer`, `driveThru`. Never collapse them into one string, and
never put hours in page markup — staff edit them in the CMS.

**Format is fixed: `h:mm` with lowercase am/pm.** `6:00am`, `11:00am`, `2:00am`,
`12:00am`. Never "6 AM", "6am", or "midnight". "24 hours" is not a clock time and
stays as it is. Label the CMS field with the format so editors match it without
being told, and validate on save. The full voice rules live in `PRODUCT.md`.

## Legacy content keeps its location
**Decided:** old page content maps to the new page for the same place. Everything on
exit260.com — services, hot food, tobacco and spirits, the drive-thru, fleet
accounts, accepted payments, Sasquatch, ratings — becomes **Exit 260** page content.
`lcc-lummi.com/cove-lottery` becomes **Fisherman's Cove** content. These are
sections on a location page, not new nav destinations, and the four-item nav does
not grow to hold them.

Two exceptions, both from ADR 0001: `billboards` and `salishvillage` are LCC, not
Market, and do not come across at all.

## The three locations

### 1. exit-260 — "Lummi Bay Market at Exit 260"
Nav "Exit 260". **Decided: "Salish Village" is NOT an alias.** Salish Village is a
160-acre mixed-use development at I-5 Exit 260 with its own leasing agent; the
market is its anchor tenant, not the development. Never use it as a location name.

4839 Rural Avenue, Bellingham WA 98226 · 48.815898, -122.5582847
C-store 360-778-1894 · Truck stop 360-778-1696
Hours: **open 24 hours.** Service times stated in page copy still apply — liquor to
midnight, beer cave to 2AM, kitchen from 6AM, tenders and hot case from 11AM.

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
`fuelGrades`: regular, diesel, ethanol-free. **Decided:** ethanol-free is included.
It was not found on the legacy site, so it is stated in page body copy where an
editor can correct or remove it without a code change.

## Rules
- Amenity badges/icons are driven by the `amenities` list — don't hand-place them.
- Only exit-260 (truckStop: true) shows the Truck Stop summary + links to `/truck-stop`.
- Keep addresses, hours, and notices in data, never in page markup.
- Never name a location "Salish Village".
- The footer "Lummi Commercial Companies" link is global, not per-location.
