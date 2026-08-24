---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market Locations or the Truck Stop — for non-technical staff via TinaCMS, or for Claude via the data file. Also the rules for how prices are displayed. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

Storage and rationale: **ADR 0004**. Display and interaction: **ADR 0005**.
Terms (Fuel Price, Fuel Grade, DEF, Truck Stop): `CONTEXT.md`.

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
One component everywhere. Full contract and the reasoning: **ADR 0005**.

**Shape** — a card, **never wider than 400px**, in every placement and at every width. On a
375px phone that reads as full-bleed; it is the same rule, not a second layout.

**Placement** — a **right-hand rail**, flush to the right edge at every width. The **Rewards
slot sits above it** at the top of the same rail; the price card is beneath. Rewards is a
product and holds the top, prices are a reference and sit under it. The rail reserves a column
on desktop — it must not float over page text.

**The Rewards slot by page** — the rail is the same everywhere; only the slot's height changes.

| Page | Rewards slot | Phone rail |
| --- | --- | --- |
| Home | the **club card image** (supplied art, placed, never redrawn) | 366px |
| every other page | a **compact control**: mark, name, one-line reason, call to action | 191px |

The compact control is **cedar** with a navy call-to-action pill. Not navy — the site header
directly above it is navy and the two fuse into one bar. Not paper with a teal underline — that
makes it a second price card. Do not demote it to a pill in the header's utility slot; that
reads as wayfinding, not as a product (ADR 0005 records why).

**Collapsed** — two groups with grade column headers: the page's own Location (Exit 260 on
every non-Location page), then the Truck Stop, always.

```
                     regular   diesel
Exit 260              3.79      4.29

                     diesel     def
Truck Stop            4.55      3.29
```

On `/truck-stop` the order reverses — Truck Stop first, so diesel and DEF lead for drivers.

**Expanded** — all four places, same two-group shape, same column headers:

```
                     regular   diesel
Exit 260              3.79      4.29
Mini Mart             3.79      4.29
Fisherman's Cove      3.85      4.29

                     diesel     def
Truck Stop            4.55      3.29
```

- Always all four. No "only show them if they differ" — a conditional layout has no answer for
  partly-different prices and changes shape day to day.
- Keep the column headers in **both** states. They are what makes a Location priced a few cents
  apart visible at a glance; dropping them collapsed would make the two states two layouts.
- Prices use `--lb-navy-deep`, labels `--lb-navy` (skill `brand-system`).
- Place labels get `text-overflow: ellipsis`, never wrapping. A wrapped "Fisherman's Cove"
  breaks row alignment and the columns with it.

**Every block collapses and expands.** There is no "always expanded" variant.

**Opening — two mechanisms, one rule.** *A panel already open on arrival cannot overlay.*

| the block… | opens as | why |
|---|---|---|
| loads collapsed (every page but Home) | HTML **popover** (`popover="auto"`), anchored over the block | overlays the page; outside-click and Escape dismiss it with **zero JavaScript** |
| loads expanded (Home, `/fuel-prices`) | plain in-flow disclosure | an overlay drawn on arrival would cover the hero before anyone touched it |

The popover covers the block rather than opening below it, so the two collapsed rows are not
repeated inside the panel. It lives in the browser's top layer, so the block's own box never
changes and there is no collapsed height to reserve.

**Stacking order** (ADR 0005, deliberately not in the locked `brand-system`):
waterline `1` · block `40` · panel `50` · header and nav `60`. Nav outranks the panel — one is
navigation, the other is information.

**Accessibility** — wrap the block in `<aside aria-label="Fuel prices">` so it is one skippable
landmark, and keep the control a real `<button>`. It sits above the page's own heading on every
page; a screen-reader user meets it on every navigation.

**Known cost of the rail on phones**, accepted with eyes open: on Home, card 221px + gap 10px +
price block 135px = **366px**, about 45% of a 375x812 viewport before any page content. That is
Home only — the compact control brings every other page to **191px**.

## Safety checks (test before done — do not assert)
- JSON parses (no trailing comma).
- All four places present; every grade shown on a page exists in the data.
- Prices render collapsed on a Location page, on `/truck-stop`, and on a non-Location page;
  expanded on Home. `/truck-stop` shows the Truck Stop first.
- The popover dismisses on outside-click **and** on Escape. Check in Safari and Firefox, not
  only Chromium — CSS anchor positioning is the project's one dependency on a newer feature,
  and the corner placement is what requires it (ADR 0005).
- Opening the popover moves page content by **zero pixels**. Assert it, do not eyeball it.
- At 200% text the expanded panel still fits the screen, or scrolls inside itself.
- With the checkbox checked, saving writes all three Locations — and leaves the Truck Stop alone.
- The strip reads on a 375px-wide screen without horizontal scroll.
