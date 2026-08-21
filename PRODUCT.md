# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Locked before this record and unchanged here: **Next.js (App Router) + React**, with
**TinaCMS** for content editing, deployed to **Vercel** (Netlify is the fallback).
Static-first — pages prerender (SSG/ISR); there is no content database.

The choice is not open: React is required because TinaCMS visual editing runs through
the `useTina` hook (ADR 0003), and TinaCMS is required because Netlify's Git Gateway is
deprecated and email-login editing without GitHub accounts is a hard staff requirement
(ADR 0002). Content lives as Markdown/JSON files in this repo, which is also what lets
Claude make content edits through chat via an ordinary commit and push.

Tina **free tier, 2 editor logins**. Team tier ($29/mo, 5 editors) only if staff grows.

## Users

**Primary: a traveler on I-5, deciding right now.** They are at or approaching Exit 260,
often at speed, frequently one-handed on a phone, and they want three facts before the
off-ramp: what fuel costs, whether it is open, and what is actually there. They did not
come to read about the brand. If the answer takes a second look, they have already
passed the exit.

Two audiences the build must still serve, secondary to that visitor:

- **Professional drivers**, who evaluate a stop before committing a rig to it — diesel
  lanes, showers, driver lounge, truck parking. Only Exit 260 serves them, and
  `/truck-stop` is where that decision is made.
- **Non-technical staff editors** (2 Tina logins), whose job is changing fuel prices and
  page copy without touching code. A field they hesitate over is a design defect.

## Product Purpose

One website for Lummi Bay Market, replacing three separate location sites
(exit260.com, lcc-lummi.com's market pages, lummibay.com). Success is measured three
ways: a traveler gets price, hours, and amenities without hunting; a driver can judge
the truck stop from the page; staff can change a fuel price unaided in under a minute.

The three original must-haves, unchanged: (1) easy content updates by non-technical
staff, (2) editable fuel prices, (3) exceptional navigation.

## Positioning

Three real locations under one tribal-owned brand, each with its own name and its own
mix of services — and one of them is a full truck stop, not a fuel stop. That
combination is factual and local: the sites are on and around the Lummi reservation,
owned through Lummi Commercial Company (wholly owned by Lummi Nation), and the flagship
sits on the Salish Village development at I-5 Exit 260. A competing chain page cannot
claim it.

## Operating Context

**Three locations, no others in scope.** Addresses, hours, and phone numbers below are
client-confirmed.

| Slug | Name (nav label) | Location | Hours | Phone |
|---|---|---|---|---|
| `exit-260` | Lummi Bay Market at Exit 260 (**Exit 260**) | 4839 Rural Ave, Bellingham WA 98226 | 24 hours | 360-778-1894 |
| `mini-mart` | Lummi Bay Market Mini Mart (**Mini Mart**) | 4884 Haxton Way, Ferndale WA 98248 | 6AM–10PM | 360-380-2049 |
| `fishermans-cove` | Lummi Bay Market at Fisherman's Cove (**Fisherman's Cove**) | 2570 Lummi View Drive, Bellingham WA 98226 | 6AM–9PM | 360-758-2448 |

- **Exit 260** — the flagship, on the Salish Village development beside I-5 Exit 260.
  24-hour convenience store, ~16 fuel lanes, tobacco & liquor drive-thru, quick-serve
  food, plus a physically separate truck stop (diesel lanes, driver store, showers,
  lounge, truck parking). `truckStop: true`. Grades: regular, midgrade, premium, diesel.
- **Mini Mart** — fuel + convenience, next to Silver Reef Casino. Grades: regular, diesel.
- **Fisherman's Cove** — fuel + convenience, the Cove Kitchen, ethanol-free fuel.
  Grades: regular, diesel, ethanol-free.

**Fuel prices are entered by hand at launch.** One file, `src/data/fuel-prices.json`,
is the only place a price exists; every surface reads from it. Staff edit prices in the
Tina "Fuel Prices" collection, the `updated` date sets itself, and the site rebuilds in
roughly 1–2 minutes — serving the previous price until the rebuild lands, never a blank.
A POS or fuel-management feed is a documented future option, not launch scope.

**Editing happens at `/admin`,** email login, no GitHub account. Because content is
files in git, git history is the audit trail — there are no granular roles, no media
library, and no document version history, and that trade was accepted deliberately.

## Capabilities and Constraints

In scope:

- Home, Locations index → three location detail pages, `/truck-stop`, `/fuel-prices`.
- `/rewards` — a promo page for the Lummi Bay Market loyalty **app**: pitch plus a
  download link. No loyalty logic, accounts, or points are built here.
- `/about` — brand story, reached from the footer, not the top nav.
- One site-wide contact form. Per-location address, hours, phone, and map live on each
  location page.
- Footer: About, contact, per-location hours/phone, Rewards, **Careers** (a single
  CMS-editable outbound link — not a built jobs section), and the Lummi Commercial
  Companies link.

Explicitly out of scope:

- Any fourth location. Exactly three exist.
- LCC corporate, Silver Reef Casino, Loomis Trail Golf, the Salish Village development
  as a destination, or billboard leasing. ADR 0001 exists specifically so no one
  re-imports this content later.
- Separate sections for the other brand-book sub-brand lockups (Café, Marina, Deli).
  The lockup system exists; this site builds no pages for it.
- Ecommerce, ordering, accounts, or inventory.

Domain vocabulary is fixed in `CONTEXT.md` and must be used as written — **Location**,
**Amenity**, **Truck Stop**, **Rewards**, **Careers**, **Sub-brand**, **Salish Village**
(a place, not a store; the store there is named Exit 260).

Data constraints future work must not break:

- Prices, addresses, and hours are read from data. Never hard-coded in a page.
- Amenity badges are driven by each location's `amenities` list, never hand-placed.
- Only `exit-260` shows the Truck Stop summary and links to `/truck-stop`; the two pages
  cross-link.
- Location slugs in `fuel-prices.json` must match the location files exactly, and a
  location's entry must carry every grade it sells.

Domains: **lummibay.com** is canonical. **exit260.com** 301-redirects to the Exit 260
location page. lcc-lummi.com stays as-is and is linked, not absorbed.

## Brand Commitments

- **The logo is locked.** Use the supplied vectors as-is — never redraw, recolor,
  distort, or re-typeset. The master mark is the "Market" lockup, used sitewide; a
  location page may set its own name in type, but the mark stays the Market lockup.
  The logo's original brand blue `#000F9F` lives inside the logo art only and is not a
  UI color.
- **Every location is a sub-brand of one company.** All three carry the Lummi Bay Market
  identity while keeping their own name.
- **The LCC boundary is absolute.** Other Lummi companies appear exactly once, as a
  footer link labeled "Lummi Commercial Companies" pointing to lcc-lummi.com. Never in
  page copy, never in nav.
- **Cultural respect is a launch gate, not a preference.** Coast Salish art is specific
  to Lummi Nation. Every motif in the build is a placeholder carrying
  `TODO: replace with approved Lummi art`; final art must be authentic or tribe-approved
  before launch. The guardrail is in the `pnw-tribal-art` skill.
- **The About story stays retail and community.** Grounded in Lummi values with a light
  community note; LCC corporate and enterprise content stays out.
- The approved 2026 design tokens, type, and motif rules are already locked in the
  `brand-system` skill — that skill is their single authority and this record does not
  restate or reopen them.

## Evidence on Hand

- **Confirmed and usable:** the logo vector files (client-confirmed to exist; not yet
  committed to this repo — they must be added before the header and hero are real).
  Location addresses, hours, phone numbers, amenities, and fuel grades, as tabled above.
- **Copy source material:** the three live source sites, to be extracted and
  de-duplicated into one voice. The `/rewards` content carries over from exit260.com.
- **Does not exist yet, and must not be invented:** photography of any kind — no
  exterior, interior, or forecourt shots of the three stores, and none of the truck
  stop's driver store, showers, lounge, or parking. Also absent: authentic Lummi art,
  and current fuel prices (the numbers in `fuel-prices.json` are 2018-dated seed values,
  not live prices). No testimonials, reviews, awards, customer counts, traffic figures,
  or gallon-volume claims exist. Ship marked placeholders and name the gap; never
  fabricate a photo, a price, a quote, or a number.

## Product Principles

1. **Answer the off-ramp question first.** Price, open/closed, and what's there beat
   brand storytelling on every surface a traveler can land on.
2. **One company, three named places.** Never flatten the locations into a generic
   chain, and never let one of them read as a separate business.
3. **Data, not markup.** Anything staff will change — a price, an hour, a phone number,
   the Careers link — lives in a labeled CMS field, and every surface reads it from
   there.
4. **A field a staff editor hesitates over is a defect.** Two non-technical people are
   the entire editing team; simplicity in the CMS outranks flexibility.
5. **The scalpel boundary holds.** The site is the three-location retail brand. Every
   pull toward the wider LCC portfolio is declined by design.
6. **Placeholder art is labeled, never passed off.** Cultural and photographic gaps are
   marked as gaps until real assets arrive.

## Accessibility & Inclusion

Product-specific requirements, beyond the brand system's own contrast rules:

- The primary visitor is on a phone, outdoors, in daylight, often in a moving vehicle
  or at a pump. High contrast and large touch targets are functional requirements here,
  not compliance decoration.
- Fuel prices and hours must be legible at a glance and readable by a screen reader as
  a price and a time, not as decorative text.
- Phone numbers and addresses must be tappable to call and to navigate.
- Body text meets WCAG AA (≥ 4.5:1). The accent colors in `brand-system` are decorative
  and are never used for body copy or small labels.
