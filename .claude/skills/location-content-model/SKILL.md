---
name: location-content-model
description: The content schema for the three Lummi Bay Market locations and how they differ (names, amenities, fuel grades). Load when building location pages, the CMS config, navigation, or the fuel-price model.
---

# Location Content Model

## Schema (per location)
Each location is one Markdown/MDX file in `content/locations/`, defined as a TinaCMS
"Locations" collection (content lives as files in the git repo — no database):
- `id` (slug): exit-260 | minimart | fishermans-cove
- `name`: full name (e.g., "Lummi Bay Market at Exit 260")
- `navLabel`: short nav label (Exit 260 | Minimart | Fisherman's Cove)
- `shortLabel`: the tightest display label, for the fuel price band where horizontal
  room is scarce (Exit 260 | Minimart | **The Cove**). Falls back to `navLabel` when
  the two are the same. This is a third name, not a reuse of `aka` — `aka` records what
  a place is *also called*; `shortLabel` is what we *print* in a constrained slot.
- `aka`: legacy/alternate name(s)
- `address`, `city`, `state`, `zip`, `phone`, `hours`
- `hoursOverrides`: a list, usually empty — **the temporary hours line, on a date window**
  (ADR 0027). Each entry is `hours` (the replacement line), `reason` (two or three words, detail
  page only), `startsAt` and `endsAt`. Live is computed per visitor in `America/Los_Angeles`, so
  New Year's Eve hours are typed in November and revert on their own. **`endsAt` is required** —
  an override with no end never reverts and fails silently, because a wrong opening time still
  looks like an opening time. Dates are whole days, inclusive. When two overlap the shorter
  window wins. `hours` itself is never empty and a permanent change edits `hours`, not this.
- `cardLine`: the single line under the name in a Location card — **street, then hours**,
  e.g. `4839 Rural Ave · Open 24 hours`. Derived from `address` + `hours` where those are
  clean; stored when they are not, because the card wants "4839 Rural Ave", not the full
  postal address. **It truncates, it never wraps** — see the budget in the Rules below.
- `map`: embed or lat/lng
- fuel prices are NOT stored here. All eight live in `content/fuel-prices.json`;
  the grades a place sells are the entries present in its price list (ADR 0004,
  skill `fuel-price-update`).
- `amenities`: string list (drives the **badge row** — never hand-place per page). What that
  looks like is drawn in `docs/proofs/amenity-badges.html`: one small **badge** per amenity, icon
  plus two or three words, wrapping across the detail page rather than running down it. A badge is
  one rounded outline containing an icon and a couple of words — the word is *badge*, not *chip*.
  **Treatment locked 17 Sep 2026 by the client: pill badges** (treatment A in the proof) — a
  1px navy-tinted outline on paper, 999px radius, icon at 16px. See the badge rules below — the
  list *is* the layout, so a thin list is a visible problem and not a styling one.
- `truckStop`: a **record**, present only on exit-260 — `truckStop: { phone, hours, amenities }`.
  **Settled 16 Sep 2026** by the client: the Truck Stop is *not* an amenity of the Exit 260
  fuel station, it is a **separate fuel station for truckers**, with its own small c-store and
  an additional lounge and showers for drivers taking a break. A boolean cannot carry that, and
  three fields hanging off a boolean was the schema asking for this shape. Its fields:
  `phone` **360-778-1696** (confirmed — a driver asking about showers or the diesel lanes must
  not land on the C-Store line), `hours` 24 hours, and `amenities` (diesel lanes, DEF, small
  c-store, driver lounge, showers, truck parking). Absent on the other two Locations.
  The Location's own `phone`, `hours` and `amenities` stay the **store's** — never merged with
  these.
- `hero`: image + alt (mark placeholder if art not final)

## The three locations
**All three Locations are now CONFIRMED by the client** — every address, every phone, every
opening time. Every address and every phone number originally scraped from lcc-lummi.com proved
correct. **One value did not: the Minimart's hours are 7am–8pm, not the 6am–10pm the scrape
returned** (client, 16 Sep 2026). That is the whole of the correction — but it is why "the
scrape was right" is not a safe thing to conclude from a sample of eleven.

The two naming questions that came back with them were **settled by the client on 16 Sep
2026** — see the note under the list.

1. **exit-260** — "Lummi Bay Market at Exit 260"; nav "Exit 260"; aka Salish Village.
   **CONFIRMED by the client.** 4839 Rural Ave, Bellingham WA 98226 · open daily, 24 hours ·
   **C-Store 360-778-1894** · **Truck Stop 360-778-1696**. The flagship.
   The client's own wording distinguishes the two numbers as *C-Store* and *Truck Stop*; use
   those labels rather than inventing "main" or "store". The card line keeps the short
   `Open 24 hours` form — the length budget below is measured and unchanged by this.
   Amenities: 24-hr convenience store, ~16 fuel lanes, tobacco & liquor drive-thru,
   quick-serve food. **The Truck Stop is not on this list** — it is not an amenity of the fuel
   station but a separate fuel station for truckers sharing the property, and it carries its own
   `truckStop` record (see the schema above): its own small c-store, driver lounge, showers,
   diesel lanes, DEF, truck parking, 24 hours, and its own phone **360-778-1696**.
   A driver asking about showers or the diesel lanes should reach the truck side, not the
   C-Store, so `/contact` and the Truck Stop page both use that number.

2. **minimart** — nav "Minimart". **CONFIRMED.** 4884 Haxton Way, Ferndale WA 98248 ·
   open daily 7am–8pm · 360-380-2049. Next to Silver Reef Casino.
   Amenities: fuel + convenience store. No `truckStop` record.
   Full name **"Lummi Bay Market Minimart"** — one word, no space, confirmed by the client.
   **Hours corrected by the client 16 Sep 2026: 7am–8pm, superseding the 6am–10pm this
   document previously carried as confirmed.** It is the only value in the three Locations that
   the scrape got wrong, and the only one to have changed after being confirmed — so a posted
   time is worth re-checking with staff before launch even where it is marked settled.

3. **fishermans-cove** — nav "Fisherman's Cove"; shortLabel "The Cove"; aka The Cove.
   **CONFIRMED.** 2570 Lummi View Drive, Bellingham WA 98226 · open daily 6am–9pm ·
   360-758-2448. Amenities: fuel + convenience store, the Cove Kitchen, ethanol-free fuel.
   **The Cove Kitchen is an Amenity, confirmed by the client 16 Sep 2026** — Lummi Bay Market
   runs it, so it is not a tenant and does not depend on the undecided tenant question.
   No `truckStop` record.
   Full name **"Lummi Bay Market Fisherman's Cove"** — no "at", confirmed by the client.

### The naming note — both questions answered, 16 Sep 2026
The client supplied all three names alongside the confirmed details, and confirmed the two that
differed from what this document carried. The settled forms:

| Location | Full name | navLabel |
|---|---|---|
| Exit 260 | Lummi Bay Market **at** Exit 260 | Exit 260 |
| Minimart | Lummi Bay Market **Minimart** (one word, no space) | Minimart |
| Fisherman's Cove | Lummi Bay Market **Fisherman's Cove** (no "at") | Fisherman's Cove |

"at" belongs to Exit 260 alone — that is the client's own usage, not an inconsistency to tidy
up. "Minimart" is one word everywhere: never "Mini Mart", never "Mini-Mart". `shortLabel` is
unaffected and still prints **The Cove** in the fuel price band.

## Rules
- **The location list is derived, never authored per page** (ADR 0009). Order is Truck Stop
  callout first, then Exit 260, Minimart, Fisherman's Cove. The component filters out the
  page's own Location, and the heading becomes "Our other locations" when it does.
- **The Truck Stop is a second fuel station, not a wing of Exit 260** (client, 16 Sep 2026). It
  shares the Exit 260 property physically, and that is all it shares: two fuel stations, two
  c-stores (the truck side's is small), two sets of customers (truckers at one, everything else
  at the other). It is never written as an Exit 260 amenity; the driver lounge and showers are
  *its* amenities, not the store's. Consequences that follow from this and not
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
- **Amenity badges are driven by the `amenities` list — don't hand-place them**, and the badge
  row has rules of its own (ADR 0027 is hours; these are the badges, proved in
  `docs/proofs/amenity-badges.html`):
  - **Fewer than two amenities and the row does not render** — a sentence renders instead. One
    lone badge under a "What's here" heading reads as a failed load, not as a short list. The
    Minimart is the live case: its recorded amenity list is the single string
    `fuel + convenience store`.
  - **Split compound strings.** `fuel + convenience store` is two facts typed into one field. The
    badge row is where that shows.
  - **Free text, with a fallback.** Staff type any amenity; the component matches it against an
    icon map and falls back to a neutral dot when there is no icon yet. Never a fixed picklist —
    that turns "we sell propane now" into an engineering ticket, which is the exact thing this
    build exists to avoid.
  - **Order is the order in the field**, not alphabetical. Whoever writes the list puts the
    reason-to-stop first.
  - **No badge is a link**, and the row is a detail-page block — never on the card or the
    Locations index, where street and hours are the whole job.
  - The Truck Stop's badges come from its own `truckStop.amenities`, never merged with the
    store's. Showers are the truck stop's amenity, not Exit 260's.
- Only exit-260 carries a `truckStop` record, and only it shows the Truck Stop summary +
  links to `/truck-stop`. The summary reads from that record, never from `amenities`. The record
  also carries **its own `hoursOverrides`** — the Location's never apply to it. The store closing
  early on a holiday while the diesel lanes stay open all night is the normal outcome, not an
  edge case (ADR 0027).
- Keep addresses/hours in data, never in page markup, so staff edit via the CMS. **Hours render
  in exactly four places** — the Location card's `cardLine`, the Locations index, the Location
  detail page and `/contact` — and they all read the same value, so an override swaps all four
  together. On the card the override replaces only the hours half of `cardLine` and is held to
  the same length budget; the *why* lives in `reason`, which the card never shows (ADR 0027).
- Only regular, diesel and DEF are priced on this site. Midgrade, premium and
  ethanol-free may remain Amenities, but carry no posted price.
- The footer "Lummi Commercial Companies" link is global, not per-location.
