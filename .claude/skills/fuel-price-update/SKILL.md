---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market locations, plus the separately-priced Exit 260 truck stop — for non-technical staff via TinaCMS, or for Claude via the data file. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

## Four price sets, not three
**Owner decision (2026-08-21):** the three locations share one diesel price, and the
Exit 260 **truck stop** posts its own, different diesel price. This was found live —
exit260.com's home page posted diesel at $5.79 the same day its `/truck` page posted
$5.65 — and confirmed as intentional, not a stale page.

So `fuel-prices.json` has **four** entries. The truck stop is a price set, not a
location: it has no address of its own and appears on `/truck-stop` and the Fuel
Prices page, never as a fourth entry in the Locations nav.

## Source of prices (launch = MANUAL entry)
Single source: `src/data/fuel-prices.json`. One object per price set, one number per
grade. Nothing else stores prices — the whole site reads from here.

```json
{
  "exit-260":            { "updated": "", "regular": null, "midgrade": null, "premium": null, "diesel": null },
  "exit-260-truck-stop": { "updated": "", "diesel": null, "def": null },
  "mini-mart":           { "updated": "", "regular": null, "diesel": null },
  "fishermans-cove":     { "updated": "", "regular": null, "diesel": null, "ethanol-free": null }
}
```

Values are `null` on purpose. **Do not seed this file with example numbers** — a
plausible-looking price in the repo can reach a live page and misinform a driver.
The build must treat `null` as "not published yet" and render the price as
unavailable, never as `$0.00`. Real prices are entered by staff, or by Claude only
from a figure the owner supplied.

Grades per price set come from `location-content-model`. Slugs must match exactly.

## Post the base price only
**Owner decision (2026-08-21):** the site posts the base posted price. It does **not**
calculate, stack, or personalize discounts.

Three discount programs exist at the pump — the **Lummi Tribal Fuel Discount**,
**LBM Rewards**, and the **Silver Reef Casino tiered fuel discount**. None of them
changes the number on the page. The site may say a program exists and link to it; it
must never imply the posted price already includes one, and it must never show a
discounted price.

## Future option (documented, not built): C = hybrid automation
If a POS / fuel-management feed becomes available, add automated updates where a feed
exists and keep manual entry as the fallback. Not in the launch scope.

## For non-technical staff (TinaCMS)
1. Go to `/admin` and log in by email (TinaCMS — no GitHub account needed).
2. Open "Fuel Prices" → pick the location. **"Exit 260 — Truck Stop" is its own
   entry in that list**, separate from "Exit 260". Changing one does not change the
   other; if both signs changed, edit both.
3. Type the new price into each grade. Dollars, two decimals (e.g., 4.05).
4. The "updated" date sets itself. Click Save/Publish.
5. The site rebuilds and shows the new price in ~1–2 minutes. The live site keeps
   serving the old price until the rebuild finishes — it never goes blank.

## For Claude / developers
- Edit `fuel-prices.json` only. Never hard-code a price in a page.
- Never invent a price. If the owner did not give a number, leave it `null`.
- Validate: numbers only, two decimals, >= 0. Don't remove a grade a set offers.
- `exit-260` and `exit-260-truck-stop` are independent. Don't sync them.

## Safety checks (test before done — do not assert)
- JSON parses (no trailing comma).
- Every price set a page references has an entry, and every grade shown exists.
- A `null` price renders as unavailable — never as `$0.00` or a blank space that
  reads like a price.
- Prices render on each location page, on `/truck-stop`, and on the Fuel Prices page.
- Exit 260's diesel and the truck stop's diesel display as two distinct numbers.
