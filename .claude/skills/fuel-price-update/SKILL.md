---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market locations — for non-technical staff via TinaCMS, or for Claude via the data file. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

## Source of prices (launch = MANUAL entry)
Single source: `src/data/fuel-prices.json`. One object per location, one number per
grade. Nothing else stores prices — the whole site reads from here.

```json
{
  "exit-260":        { "updated": "2018-05-01", "regular": 3.79, "midgrade": 3.99, "premium": 4.19, "diesel": 4.29 },
  "mini-mart":       { "updated": "2018-05-01", "regular": 3.79, "diesel": 4.29 },
  "fishermans-cove": { "updated": "2018-05-01", "regular": 3.79, "diesel": 4.29, "ethanol-free": 4.49 }
}
```

Grades per location come from `location-content-model`. Slugs must match exactly.

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
- JSON parses (no trailing comma).
- Every location a page references has an entry, and every grade shown exists.
- Prices render on each location page and on the Fuel Prices page.
