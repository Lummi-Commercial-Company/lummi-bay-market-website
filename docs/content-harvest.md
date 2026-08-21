# Content harvest — the three source sites

Harvested 2026-08-21 by fetching the live sites. Every fact below is quoted or
transcribed from the source named next to it. Nothing here is inferred, and
nothing is invented — where the sources disagree, both readings are recorded as a
conflict rather than resolved by guesswork.

Sources: `exit260.com` (116 URLs) and `lcc-lummi.com` (14 URLs), read from each
site's own `sitemap.xml`. `lummibay.com` was **not** harvested — it is the marina
(ADR 0004), not a source.

---

## 1. The finding that changes the build

**The Lummi Bay Mini Mart is closed for renovation right now.**

From `lcc-lummi.com/minimart-reno-faq`, updated 2026-08-19 (two days ago):

> "The renovations began on August 17, 2026."
> "It is anticipated that the work will take 4-5 months to complete. Targeted
> re-opening is December 2026."
> "The pumps will be available. You can pay with cash inside the temporary store
> 7am-8pm. You will also be able to shop for cigarettes and other tobacco
> products, packaged beverages, and snacks."

The main store is closed; a temporary portable store runs 7AM–8PM; the fuel pumps
stay open. The scope is "connecting our two existing buildings," adding hot food,
an ice cream counter, and a beer cooler.

**Why this matters:** this site will almost certainly launch during the closure.
No slice, issue, or content model accounts for a location that is partially open.
The Mini Mart location page needs a temporary state — store closed, pumps open,
cash only inside a portable, reopening December 2026 — and that state has to
expire without a developer. Nothing in the plan handles it.

---

## 2. Conflicts in the live data

These are the reason the project exists. Each is a real contradiction between two
live pages, found today.

### Exit 260 hours — two answers on the same site
| Source | Hours |
| --- | --- |
| `exit260.com` home | "Open Daily 24 Hours" |
| `exit260.com` footer (every page) | "Mon-Sun 7AM - 9PM" |
| `exit260.com/services` | "open 24 hours daily" |
| `lcc-lummi.com/holiday-hours` | separates "Exit 260 Store", "Exit 260" (24 hours), and "Exit 260 Truck Stop" |

The holiday-hours page is the tell: it treats the **store**, the **fuel**, and the
**truck stop** as three things with three different hour sets. The Squarespace
footer is a single global template stamping one set of hours onto all pages,
including the pages that contradict it. So "hours" is not one field per location —
it is one field per *service* per location. The content model has this wrong.

### Diesel — two prices on the same site, same day
| Source | Regular | Diesel | DEF |
| --- | --- | --- | --- |
| `exit260.com` home | $4.65 | $5.79 | — |
| `exit260.com/truck` | — | $5.65 | $2.99 |

Two readings, and we should not pick one:
1. **Stale page.** One of the two didn't get updated. This is the failure the
   project is meant to end.
2. **Both correct.** Truck-lane diesel and auto-island diesel are commonly priced
   differently, and a 14-cent spread is plausible for that.

Either way the fuel-price model needs to answer it: if reading 2 is right, diesel
is not one price per location and the schema in `fuel-price-update` is wrong.
**Question for the owner — one to confirm before S2.**

### Mini Mart hours — four answers
| Source | Hours |
| --- | --- |
| `lcc-lummi.com/minimart` | "Open Daily: 7AM - 8PM" |
| `exit260.com/contact` | "Open Daily: 6AM - 10PM" |
| `minimart-reno-faq` | temporary store "7am to 8pm" |
| `holiday-hours` (Fri after Thanksgiving) | "6:00am - 10:00pm" |

Most likely: normal hours are 6AM–10PM, the temporary store is 7AM–8PM, and
`/minimart` has quietly overwritten its normal hours with the temporary ones. If
so, the real hours only exist on a page nobody thinks of as the source of truth,
and they will be lost when the renovation ends.

### Lummi Commercial Company — two addresses
| Source | Address |
| --- | --- |
| `lcc-lummi.com` footer | 2751 Haxton Way, Bellingham, WA 98226 |
| `exit260.com/contact` | 4870 Haxton Way, Ferndale, WA 98248 |

Not our page — LCC is a single footer link under ADR 0001 — but worth passing back
to whoever owns those sites.

---

## 3. Salish Village is not Exit 260

`CLAUDE.md` and the `location-content-model` skill both say Salish Village is an
alias for Exit 260. **The live site says otherwise.** From
`lcc-lummi.com/salishvillage`:

- Salish Village is a **160-acre mixed-use development** at I-5 Exit 260, under
  the permitting authority of the Lummi Nation. Phase One complete, Phase Two
  underway.
- It has a **commercial leasing contact**: Troy Muljat, CCIM, CPM.
- Bellingham International Airport sits immediately south.
- `exit260.com/hotfood` places **Wendy's** "at nearby Salish Village" — i.e. a
  separate tenant at the development, not inside the market.

So Exit 260 is the anchor tenant *within* Salish Village, not a synonym for it.
LCC's own nav lists "260" and "Salish Village" as separate items.

**Consequence:** the location model's three locations are correct, but calling
location one "Salish Village" is a factual error that would put a 160-acre real
estate development's name on a convenience store page — with a leasing agent
attached to it. The three locations should be named as the business already names
them (below). This needs an owner decision and a docs fix.

---

## 4. The naming pattern already exists

The live sites are consistent, and it's better than anything we'd invent:

- **Lummi Bay Market at Exit 260**
- **Lummi Bay Market Minimart** (nav: "Minimart")
- **Lummi Bay Market at Fisherman's Cove** (nav: "Cove")

One brand, three "at X" locations. The brand name in `CLAUDE.md` is already the
name on the street.

One caveat: `holiday-hours` calls the third location **"Gooseberry Point/Cove"** —
a fourth name, and the one locals likely use for the place. Names in play for one
store: The Cove, Fisherman's Cove, Gooseberry Point, Lummi Bay Market at The Cove.
Pick one label and one alias set; don't ship four.

---

## 5. Confirmed facts (use these, not placeholders)

### Exit 260 — 4839 Rural Avenue, Bellingham, WA 98226
- C-store 360-778-1894 · Truck stop 360-778-1696
- "9,800 square feet of store and so much more…"
- **16 fuel pumps**; **8 diesel and DEF lanes**
- EV fast chargers — "200 Mile Charge in 15 minutes"
- **51 free overnight parking spots**, "Check-in at Fuel Desk"; showers, laundry, Wi-Fi
- RV dump station; document scanning; truck parts
- Liquor and wine to midnight; beer cave to 2AM; "500+ choices" of liquor
- Drive-thru: cigarettes, vape, chew, pouches. **Entrance was relocated** — "drive
  past the main entrance and then taking a right directly from Rural Avenue"
- Kitchen: chicken tenders (from 11AM), hot case (from 11AM), breakfast (from 6AM),
  "our famous Sasquatch Burritos"; Piroshky Piroshky bakery
- Wendy's — at Salish Village, not in the market
- Lottery, ATM, ICEE, bagged ice
- Orientation lines: "I-5 Exit 260, 15 Minutes before Canada" and "4 Minutes to
  Silver Reef Casino Resort"
- Coordinates 48.815898, -122.5582847

### Mini Mart — 4884 Haxton Way, Ferndale, WA 98248
- 360-380-2049
- Under renovation (§1). Reopening adds hot food, ice cream counter, beer cooler.

### Fisherman's Cove — 2570 Lummi View Drive, Bellingham, WA 98226
- 360-758-2448 · Open daily 6AM–9PM
- Kitchen 6AM–6PM; breakfast 6–11AM; hot case 11AM–6PM
- Breakfast: biscuits & gravy, burritos, sandwiches, bowls
- Hot case: cheeseburger, chicken sandwich, BBQ sandwich, 3-piece chicken strip,
  corndogs, burritos, pizza pockets
- Fries $3.99 · Fries & gravy $4.99 · Poutine $5.99
- **Boat ramp access**; lottery and scratch tickets; ICEE
- Has its own lottery page (`lcc-lummi.com/cove-lottery`)

### Payment and fleet — `exit260.com/accepted`
Cash, Visa, Mastercard, Amex, Discover, Debit, Apple Pay, **EBT**.
Fleet: Comdata, Comdata Checks, EFS, FleetOne, FuelMan, MultiService, T-Chek, TCH,
Voyager, Wex. Station codes are published: Comdata WA0311, EFS 2974, FleetOne
541740, FuelMan 542190, MultiService 97975, T-Chek 44916, TCH 541740.

### Three stacking fuel discounts — not in any of our docs
From `minimart-reno-faq`: **Lummi Tribal Fuel Discount**, **LBM Rewards**, and
**Silver Reef Casino Tiered Fuel Discount**, all usable at the pump. The fuel
model assumes one posted price per grade. A tiered casino discount and a tribal
discount on top of a posted price is a different shape, and the site has to at
least explain it even if it never calculates it.

### LBM Rewards — `exit260.com/rewards`
Free. Card, app, or online. App via rovertownservices.com;
`lbmrewards.myrewardsbutler.com`; 844-770-4526 (844-770-4LBM).
1 point per gallon; 1 point per dollar in store. Excludes lottery, gift cards,
stamps. Points redeem at **1 point = 1 cent**, not on fuel, lottery, stamps, gift
cards, or propane. Accounts inactive 12+ months forfeit points; game coins expire
after 90 days. In-app games and age-verified tobacco/alcohol offers.

### Real, attributable trust signals
`exit260.com/reviews` publishes **aggregate ratings only** — no testimonials, no
names: Google 4.4/5, GasBuddy 4.7/5, Trucker Path 4.6/5. Plus one award:
**"2024 Best One-Stop Shop, Editor's Pick," Bellingham Alive**.

These are real and sourced, so they are usable — but ratings drift, so any number
we publish must be re-verified at build time and attributed to its platform.
Ratings are the one number on this site that goes stale without anyone editing it.

---

## 6. The incumbent brand voice

This was the point of the harvest: there is already a voice, and it is better than
a blank page. Verbatim samples:

- "9,800 square feet of store and so much more…"
- "We'll never point you to an 800 number. Our on-site team can answer all billing questions."
- "An invoicing schedule and terms designed to fit YOUR needs."
- "51 FREE Parking Spots! Check-in at Fuel Desk"
- "I-5 Exit 260, 15 Minutes before Canada"
- "4 Minutes to Silver Reef Casino Resort"
- "200 Mile Charge in 15 minutes"
- "ICEE, made for Summer. Get yours today."
- "Liquor store. Cigarette and Vape drive-thru."
- "our famous Sasquatch Burritos"
- "Have a Sasquatch Sighting you'd like to share?"
- "a massive Beer Cave"
- "Here's What You'll Find at 260"

**What the voice actually does:**
1. **Leads with numbers.** 9,800 sq ft · 16 pumps · 51 spots · 500+ choices · 200
   miles in 15 minutes · 8 lanes. Specificity is the whole personality.
2. **Orients by drive time, not geography.** "15 Minutes before Canada." "4
   Minutes to Silver Reef." This is exactly right for a traveler and it is the
   sharpest instinct on the site.
3. **Sentence fragments.** Almost nothing is a full sentence. It reads like signage.
4. **Competes out loud, warmly.** "We'll never point you to an 800 number" is the
   best line on either site — a real competitive claim in one human sentence.
5. **Has a running joke.** Sasquatch is a campaign, a burrito, and a photo
   submission page. It is genuinely funny and it is theirs.
6. **Shifts register by page.** `/truck` is spec-dense, `/fleet` is
   warm-competitive, `/hotfood` is playful. The site already does per-page
   registers.

**Where it's weak:** ALL-CAPS and exclamation points do work that type should do.
Promo copy ("WIN a $500 Fuel Card!") sits at the same weight as the fuel price,
which is the thing people came for. And the voice never says anything about being
a Lummi Nation enterprise — the sites' warmth is generic roadside warmth.

**Bearing on the voice decision:** a stripped-down utilitarian voice would delete
items 1, 2, 4 and 5 — the parts that are working. The live evidence argues for
keeping the numbers-and-drive-times spine and the humor, and spending the edit on
hierarchy instead of tone.

---

## 7. E-commerce: what is actually there

`exit260.com/260smokes` is a **real transactional store**, not a price list.
Verified on `260smokes/skydancer-silver-king`: "Add To Cart", a Carton/Pack size
dropdown, a quantity field, a price ($4.94), plus "Cart 0" and "Sign In My
Account" in the global header. `lcc-lummi.com` carries a **Cart** in its nav too.

Scale: roughly **110 of the 116 URLs** on exit260.com are cigarette product pages
(Marlboro, Newport, Camel, Winston, Pall Mall, American Spirit, plus the
Native-manufactured lines — Skydancer, Seneca, Native, Complete, Signal, Crowns,
Great Country). `/tfs` adds ~100 chew blends and pouches, vape, 500+ liquor SKUs.

Two things this tells us about retiring it:

1. **It looks like order-ahead, not shipping.** `/tfs` says "You must **present
   photo ID** at time of purchase" and restricts to "personal consumption only" —
   so the cart appears to serve in-store or drive-thru pickup. If so, most of the
   business value is *browsable prices*, not the transaction. A no-cart price list
   would keep that value, keep the SEO, and drop the compliance and PCI surface.
   Worth putting to the owner before the catalog is discarded wholesale.
2. **The decommission has real obligations.** Open orders, stored customer
   accounts, and any saved payment data live in Squarespace, and online tobacco
   retail is a heavily regulated category. Whoever holds that account has to check
   all of it before switching anything off. This repo cannot do it.

Retiring the cart also means ~110 URLs need a redirect decision for S10 — they are
the bulk of the site's indexed surface, and they should not all 404.

---

## 8. Pages the locked IA does not cover

Live today, beyond Home / Locations / Truck Stop / Fuel Prices:

| Page | Source | Disposition |
| --- | --- | --- |
| `/rewards` | exit260 | In the plan (app-promo page) |
| `/services` | exit260 | Folds into the Exit 260 location page |
| `/truck` | exit260 | In the plan (Truck Stop) |
| `/hotfood` | exit260 | Food — no home in the IA |
| `/tfs` | exit260 | Tobacco & Fine Spirits — no home in the IA |
| `/drivethru` | exit260 | Drive-thru + relocated entrance — no home |
| `/fleet` | exit260 | Fleet accounts — no home; strongest B2B content on the site |
| `/accepted` | exit260 | Payment + fleet station codes — no home |
| `/fuel-card-info` | exit260 | August promo, expires Sept 1 |
| `/sasquatch` | exit260 | Social/UGC campaign — no home |
| `/reviews` | exit260 | Ratings + award — no home |
| `/260smokes/*` (~110) | exit260 | Retiring (§7) |
| `/cove-lottery` | lcc | Lottery — no home |
| `/billboards` | lcc | Freeway digital billboards — LCC, not Market (ADR 0001) |
| `/salishvillage` | lcc | LCC development, not Market (§3) |
| `/holiday-hours` | lcc | Holiday hours — no home, and staff clearly maintain it |
| `/minimart-reno` + `/minimart-reno-faq` | lcc | Renovation (§1) |
| `/jobs` | both | External → secure6.saashr.com. In the plan (footer Careers) |
| `/support`, `/terms`, `/privacy`, `/sitemap` | both | Utility pages — no home in the IA |

Eight or nine content areas have no place to live in the four-item nav. That is a
question for `ux-navigation-architect`, not a reason to add nav items — most of
these are location-page sections or footer utility pages.

---

## 9. Open questions for the owner

1. **Diesel — one price or two?** Is truck-lane diesel priced separately from the
   auto island? This changes the fuel schema (§2).
2. **"Salish Village" as a location name.** The live site says it's a 160-acre
   development, not the store. Rename location one to "Exit 260"? (§3)
3. **Mini Mart during renovation.** How should the location page read between now
   and December — and who flips it back? (§1)
4. **The 260Smokes catalog.** Retire the cart but keep a browsable price list, or
   drop all ~110 pages? (§7)
5. **The three fuel discounts.** Should the site explain the tribal, Rewards, and
   Silver Reef tiered discounts, or only post the base price? (§5)
6. **"The Cove" vs "Fisherman's Cove" vs "Gooseberry Point."** One label, one
   alias set. (§4)
