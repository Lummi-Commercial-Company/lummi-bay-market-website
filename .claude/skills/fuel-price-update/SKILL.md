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

**One shape at rest, everywhere.** A **card, never wider than 400px**, in a right-hand rail
flush to the right edge — the page's own Location and the Truck Stop, with grade column
headers. There is no per-page variant.

**Rewards is never beside the prices.** It is a global "Get the App" pill in the header
(ADR 0006), on every page. The rail is the price card alone. Do not reintroduce a Rewards
element into it — the club card image and the compact cedar control were both tried there and
both superseded.

**A promo sits between the block and the page title** on interior pages (ADR 0007). It is not
part of this component, but on a phone the two stack: header 52 + card 135 + promo 197 puts the
page title at 424px. Do not add a fourth thing above the title without measuring what it costs.

**The header is sticky** (ADR 0006). Never give the price card `position: sticky` **while its
panel is anchored to it** — tested: after ~300px of scroll the open panel is painted correctly
but clicks fall through to the collapsed card behind it, which then light-dismisses it. That is
the rule on phones, where the rail scrolls away.

**Desktop condenses on scroll.** Once the page has scrolled roughly halfway past the resting
card it becomes a single line carrying **the page's own Location alone** — narrower as well as
shorter, 360x39 from 400x151 — pinned under the header and still expandable to all four.

```
Exit 260 │ REG 3.79   DIESEL 4.29        ⌄ All prices
```

| | Resting | Condensed | Expanded |
| --- | --- | --- | --- |
| Desktop | Location + Truck Stop, 400x148 | Location only, 365x39 | adds Mini Mart, The Cove |
| Phone (interior) | **Location only**, 345x76 | Location only, one line | adds those two **and** the Truck Stop |

**The panel adds only what is not already on screen.** Its heading is "Also at", not "All
locations". Never list a place twice — that is one rule, not a case per state.

**Condensing must move the page by zero pixels.** The block keeps its resting height: the
collapsed face stays in the layout as `visibility: hidden` and the one-line bar draws over it.
Assert it; do not eyeball it. A shrink that reaches the flow moved a phone promo 37px mid-scroll,
which counts against Core Web Vitals.

The condensed bar is sticky and safe *because* its panel is viewport-positioned. Do not make one
sticky without the other. The trigger is ~10 lines of `IntersectionObserver` on a sentinel in
the card's slot, at the card's height — the CSS-only route does not work with a sticky subject
(ADR 0005 records the measurements).

**On a phone the card is in flow**, never absolutely positioned — absolute, it covered the promo
below it completely. The reserved right-hand column is desktop-only.

```
Exit 260  REG 3.79  DIESEL 4.29 | Truck Stop  DIESEL 4.55  DEF 3.29      ⌄ All prices
```

| | Resting card | Condensed bar |
| --- | --- | --- |
| Width | 400px | `max(50%, 620px)` — a flat 50% clips below ~1280px |
| Panel | anchored to the block | **positioned against the viewport** — no `position-anchor` |
| Panel layout | one table | two columns: Locations left, Truck Stop right |

The condensed bar is sticky and safe *because* its panel is viewport-positioned. Do not make
one sticky without the other. The trigger is ~10 lines of `IntersectionObserver` on a sentinel
in the block's slot, the block's own height — the CSS-only route does not work with a sticky
subject (ADR 0005 records the measurements).

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

**Known cost of the rail on phones**, accepted with eyes open: control 45px + gap 10px + price
block 135px = **191px** before any page content, on every page. The sticky header holds a
further ~47px permanently.

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
