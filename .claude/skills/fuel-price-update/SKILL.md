---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market locations — for non-technical staff via TinaCMS, or for Claude via the data file. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

## Source of prices (launch = MANUAL entry)
Single source: `src/data/fuel-prices.json`. One object per PRICE GROUP, one number per
grade. Nothing else stores prices — the whole site reads from here.

```json
{
  "exit-260":            { "updated": "2018-05-01", "regular": 3.79, "midgrade": 3.99, "premium": 4.19, "diesel": 4.29 },
  "exit-260-truck-stop": { "updated": "2018-05-01", "diesel": 4.29, "def": 3.29 },
  "mini-mart":           { "updated": "2018-05-01", "regular": 3.79, "diesel": 4.29 },
  "fishermans-cove":     { "updated": "2018-05-01", "regular": 3.79, "diesel": 4.29, "ethanol-free": 4.49 }
}
```

**Price groups are not the same thing as locations.** There are three locations but four
price groups: the truck lanes at Exit 260 are priced independently of the car lanes at
the same site, so `exit-260-truck-stop` is its own entry. It is the only group that
carries **DEF** (client-confirmed: DEF is sold at the truck stop and nowhere else).
Adding a group means adding it to `EXPECTED` in `scripts/check-prices.mjs` and to
`priceGroupsForLocation()` in `src/lib/fuel.ts`.

Grades per location come from `location-content-model`. Slugs must match exactly.

> The committed numbers are 2018-dated SEED values, not live prices. Every price view
> prints its own "Prices updated" date, and `check:prices` warns on anything older than
> 30 days, so staleness is visible rather than silent. Real prices must be entered
> before launch.

## Future option (documented, not built): C = hybrid automation
If a POS / fuel-management feed becomes available, add automated updates where a feed
exists and keep manual entry as the fallback. Not in the launch scope.

## For non-technical staff (TinaCMS)
1. Go to `/admin` and log in by email (TinaCMS — no GitHub account needed).
2. Open "Fuel Prices" → pick the location.
3. Type the new price into each grade. Dollars, two decimals (e.g., 4.05).
4. The "updated" date sets itself. Click Save/Publish.
5. The site rebuilds and shows the new price in ~1–2 minutes. The live site keeps
   serving the old price until the rebuild finishes — it never goes blank.

## For Claude / developers
- Edit `fuel-prices.json` only. Never hard-code a price in a page.
- Validate: numbers only, two decimals, >= 0. Don't remove a grade a location offers.

## Safety checks (test before done — do not assert)
Run `npm run check:prices`. It also runs automatically before every build (`prebuild`),
so a bad price cannot reach a deploy. It checks:
- JSON parses (no trailing comma).
- Every price group exists and carries every grade it is supposed to sell.
- No group carries a grade that location does not sell, and no unknown grade names.
- Numbers only, at most two decimals, `>= 0`, and nothing over $15 (catches `379`
  typed for `3.79`).
- `updated` is `YYYY-MM-DD`, and warns when it is more than 30 days old.

Then confirm by eye: prices render on each location page, on Home, and on the Fuel
Prices page.
