---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market Locations or the Truck Stop — for non-technical staff via TinaCMS, or for Claude via the data file. Also the rules for how prices are displayed. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

Model and rationale: **ADR 0004**. Terms (Fuel Price, Fuel Grade, DEF, Truck Stop): `CONTEXT.md`.

## Source of prices (launch = MANUAL entry)
Single source: `content/fuel-prices.json`, a TinaCMS collection with `ui.global: true` so it
appears under "Site" in the sidebar and opens straight to the form. Nothing else stores
prices — the whole site reads from here.

**Eight prices.** Regular + diesel at each of the three Locations; diesel + DEF at the
Truck Stop. Midgrade, premium and ethanol-free are NOT priced on this site.

```json
{
  "linkLocations": true,
  "locations": {
    "exit-260":        { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" },
    "mini-mart":       { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" },
    "fishermans-cove": { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" }
  },
  "truckStop":         { "diesel": 4.55, "def": 3.29, "updated": "2026-08-21" }
}
```

Rules that hold no matter who is editing:
- **One price per place per grade. There is no "all locations" price field.** `linkLocations`
  records the checkbox position for the editor's convenience. It must never decide which
  price the site reads — see ADR 0004 for why.
- **The Truck Stop is never touched by the checkbox.** Truck-lane diesel is not car-lane diesel.
- The grades a place sells are the entries present in its price list. Don't declare grades twice.

## For non-technical staff (TinaCMS)
1. Go to `/admin` and log in by email (no GitHub account needed).
2. In the sidebar under **Site**, open **Fuel Prices**. The form opens directly.
3. **"Apply one price to all three locations"**
   - **Checked** — type regular and diesel once; all three Locations get it on save.
   - **Unchecked** — the three Locations show separately; edit whichever you need.
4. **Truck Stop** is always its own section, always typed by hand. Diesel and DEF.
5. Dollars, two decimals (e.g. 4.05). The "updated" date sets itself for the places you changed.
6. Save/Publish. The site rebuilds and shows the new price in ~1–2 minutes. The live site keeps
   serving the old price until the rebuild finishes — it never goes blank.

## For Claude / developers
- Edit `content/fuel-prices.json` only. Never hard-code a price in a page.
- Validate: numbers only, two decimals, >= 0. Never remove a grade a place sells.
- A direct file edit bypasses any editor hook, so **set `updated` by hand** for every place
  you changed. (Whether this stamp should instead be derived from the commit is still open —
  ADR 0004.)
- Changing all three Locations means writing three values. There is no shortcut field.

## How prices are displayed
One component, two states. Every page shows it exactly once.

**Collapsed** — every page except Home. Shows **two** groups: the page's own Location (Exit 260
everywhere else, and on `/truck-stop`), then the Truck Stop, always:

```
                     regular   diesel
Exit 260              3.79      4.29

                     diesel     def
Truck Stop            4.55      3.29
```

The Truck Stop is always present because drivers are a distinct audience and diesel + DEF is
what they came for. Affordance reads "View all prices", not "Tap" — it is a click on desktop.

On phones, collapse each group to one line so the strip stays two lines rather than four:
`Exit 260 · Reg 3.79 · Diesel 4.29`. Wide screens use the column-header layout above.

**Expanded** — and the default state on Home. All four places, same two-group shape:

```
                     regular   diesel
Exit 260              3.79      4.29
Mini Mart             3.79      4.29
Fisherman's Cove      3.79      4.29

                     diesel     def
Truck Stop            4.55      3.29
```

- Always all four. No "only show them if they differ" — a conditional layout has no answer for
  partly-different prices, and it changes shape day to day.
- Collapsed and expanded differ by exactly two rows. If that stops earning the interaction,
  drop the toggle and always render expanded.
- Use a native `<details>`/`<summary>` for the toggle: expand, collapse and keyboard access with
  **zero JavaScript**, keeping the strip a static server-rendered component on every page.
- Prices use `--lb-navy-deep` so they stay a recognizable cue (skill `brand-system`).

## Safety checks (test before done — do not assert)
- JSON parses (no trailing comma).
- All four places present; every grade shown on a page exists in the data.
- Prices render collapsed on a Location page, on `/truck-stop`, and on a non-Location page;
  expanded on Home.
- With the checkbox checked, saving writes all three Locations — and leaves the Truck Stop alone.
- The strip reads on a 375px-wide screen without horizontal scroll.
