# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Locked before this record was written, by the owner, in `CLAUDE.md` and ADR 0003:
**Next.js (App Router) + React + TypeScript**, content in **TinaCMS** (git-based,
visual editing), static-first (SSG/ISR), deployed on **Vercel** (Netlify is the
fallback). Not delegated and not open — the choice was made to buy TinaCMS visual
editing, which requires React. See `docs/adr/0003-nextjs-for-visual-editing.md`
and `docs/adr/0002-tinacms.md`. No code exists yet.

## Users

**Primary — I-5 travelers passing through.** On a phone, in a moving vehicle,
deciding within a short window whether to take Exit 260. Mostly one-time or
occasional visitors. They need the price, the exit, and "is it open" in seconds,
with no prior knowledge of the brand or which of the three stores they are near.

**Second — long-haul truckers and drivers.** Planning a stop hours ahead, possibly
from a cab at rest or a desktop. They need amenity specifics: diesel lanes, showers,
driver lounge, overnight parking, the driver store. Exit 260 is the flagship for
exactly this audience.

These two are the tie-breakers, in that order, when a design decision cannot serve
everyone.

**Confirmed but not prioritized:** local regulars (Lummi Nation, Ferndale,
Bellingham) who already know the locations and come for price and Rewards; and
Silver Reef Casino guests adjacent to the Mini Mart. Real audiences — they do not
win hierarchy conflicts.

**Second user class — content editors.** Two non-technical staff, logging in at
`/admin` by email with no GitHub account, changing fuel prices and page copy
unaided. Claude is a third editor, making the same changes through chat as a normal
commit and push. Both paths write to the same files in this repo.

## Product Purpose

Replace three separate location websites (exit260.com, lcc-lummi.com's market
content, lummibay.com) with one fast site for the Lummi Bay Market brand and its
three locations.

**Success, in the visitor's terms:** they checked a current fuel price. Second:
they understood what the truck stop offers. Both were confirmed by the owner as
the ranked definition of the site working.

The owner's three must-haves: easy content updates by non-technical staff, editable
fuel prices, and exceptional navigation. All three are editability or findability
requirements — none is a visual requirement.

## Positioning

One company, three locations, under a single Lummi Bay Market identity, with each
store keeping its own name as a sub-brand. Wholly owned by Lummi Nation through
Lummi Commercial Company.

What a neighboring fuel stop cannot truthfully copy: the tribal-enterprise
ownership, and the full truck stop at I-5 Exit 260 on the Salish Village
development — diesel lanes, driver store, showers, lounge, and truck parking as a
facility separate from the 24-hour convenience store on the same site.

## Operating Context

- **The primary decision happens at speed, outdoors, on a phone** — bright sun,
  one-handed, possibly poor signal, possibly gloved. The window is short and the
  visitor is not browsing.
- **The trucker's decision happens earlier and needs more detail** than the
  traveler's, which is why one page cannot serve both with the same density.
- **Fuel prices change often.** A wrong public price is a visible failure that
  costs real money, so a price must always carry the date it was set.
- **The editing ritual:** a staff member opens `/admin`, clicks the price or the
  text on the page itself, edits it in a sidebar with live preview, publishes;
  Vercel rebuilds. Target is under a minute, without asking anyone how.
- **The site must never go blank while a build runs** — the previous version stays
  up. This is an explicit acceptance criterion, not an aspiration.
- Content lives as Markdown/JSON files in git, so staff edits and Claude edits are
  the same mechanism and git history is the audit trail.

## Capabilities and Constraints

**Scope.** Exactly three locations exist and no others are in scope: Exit 260
(flagship, 24-hour store plus the separate truck stop), Mini Mart, Fisherman's Cove
(includes the Cove Kitchen and ethanol-free fuel). Full names and nav labels are
fixed in `CONTEXT.md`.

**Surfaces.** Home; Locations index plus three detail pages; Truck Stop; Fuel
Prices (all locations in one view, also surfaced on Home and each location page);
Rewards; About; one site-wide contact form. Navigation is locked at four primary
items — Home · Locations · Truck Stop · Fuel Prices — with About, Rewards, Careers,
and the Lummi Commercial Companies link in the footer.

**The legacy surface is wider than this IA, deliberately.** As of 2026-08-21,
exit260.com alone runs Services, TruckStop, Sasquatch, Jobs, Contact, Rewards, Hot
Food Menu, Fleet Information, Travel Center, Store Selection, Accepted Payment Types,
Terms, Sitemap, Support — and a working cart. The locked four-item IA absorbs none of
that by default. Every one of those URLs must end as a redirect target, content folded
into a location or truck-stop page, or a deliberate retirement. Resolving the list is
the content harvest (E4, issue #20) plus the redirect map (S10); the count is recorded
here so the scope gap is visible now rather than discovered at launch.

**E-commerce is retired, not migrated.** Owner decision (2026-08-21): the Exit 260
cart and online-ordering surface do not carry over. The new site sells nothing and
processes no payments — which also keeps PCI scope, checkout flows, order state, and
payment secrets entirely out of this codebase. Consequences to handle rather than
assume: cart, checkout, and product URLs need 301s to the nearest useful page (the
relevant location or the hot-food content) instead of 404s; and decommissioning the
live store is an action inside the client's Squarespace account, not something this
repo can perform — someone with that access must check for open orders, stored
customer or payment data, and any active subscription before switching it off.

**Deliberately not built here.** No loyalty logic (Rewards is a promo page linking
to a mobile app). No jobs section (Careers is one editable link). No sub-brand
sections for Café / Marina / Deli — those lockups exist in the brand book but get
no pages. A café or deli at a location is an amenity, not a section. **No commerce
of any kind:** no cart, no checkout, no online ordering, no payment handling.

**Technical constraints.** TinaCMS free tier, two editor seats (Team tier at
$29/mo covers five if staff grows). No granular roles, no built-in media library,
no document version history — accepted, with git history as the audit trail.
Static-first, so no content database to run or back up. lummibay.com is named canonical;
exit260.com 301-redirects to the Exit 260 location page; lcc-lummi.com is left
untouched (ADR 0001).

**Domain split (ADR 0004).** lummibay.com was found to be serving **Lummi Bay
Marina** — a live boat and dry-dock storage business on third-party storage software,
with paying customers and its own rent/support/map pages — not Market content awaiting
a merge. Owner decision (2026-08-21): the marina moves to **marina.lummibay.com** and
the Market takes the **lummibay.com** apex as originally specified. Marina stays out of
scope as a section of this site; only its address changes. Two obligations follow, and
both are recorded in ADR 0004: the marina's storage-software vendor must support a
custom domain with TLS, and the subdomain must be verified live *before* the apex
flips, or paying customers lose their rental and payment pages. The marina's old apex
paths need path-preserving 301s into the S10 redirect map.

**Terminology** is fixed in `CONTEXT.md` and is binding on copy: Location, Amenity,
Truck Stop, Rewards, Sub-brand, Salish Village, LCC. Notably, "Salish Village" is a
development, not a store; the store there is "Exit 260".

**Explicitly undecided — do not invent (tracked as issues E1–E10):** real launch
fuel prices; verified addresses, hours, and phone numbers; Rewards app store links
and whether the app is live; the Careers destination URL; the contact form
destination and spam tolerance; logo vector files; Vercel and Tina Cloud accounts;
DNS control; which old URLs deserve targeted redirects. Two items previously listed here are now
decided: the domain split (ADR 0004) and the retirement of Exit 260 e-commerce.

**The brand voice is not yet defined.** `CLAUDE.md` requires one consistent voice
across content merged from three sites, and assigns it to the copy-editor agent,
but no voice has been agreed. Open decision.

## Brand Commitments

Recorded here as binding; the values themselves live in the skills and are not
duplicated, per `CLAUDE.md`.

- **The logo is locked.** Use the supplied vector art as-is. Never redraw, recolor,
  distort, or re-typeset it. The Market lockup is the master mark sitewide. Its
  internal brand blue (#000F9F) lives inside the logo only and is never a UI color.
  Full rules in skill `brand-system`. The vectors have not been delivered yet (E1);
  until they are, a text lockup placeholder marked TODO is the only permitted stand-in.
- **Palette and typography are approved and locked** in skill `brand-system` —
  navy-dominant, teal and cedar as accents only, Space Grotesk plus Inter. Do not
  invent alternatives.
- **The waterline is the brand's recurring connective signature**, used on every
  page. Owner decision (2026-08-21): it gradients `--lb-teal` → `--lb-navy`, both
  approved `brand-system` tokens. `pnw-tribal-art` previously named two tokens absent
  from the palette; it has been corrected, and `brand-system` is now the project's
  single color vocabulary. Taken as a working decision, revisitable if the shoot or
  the final art argues otherwise — but never by reintroducing a second token name.
- **Cultural guardrail.** Coast Salish formline is specific to Lummi Nation, and AI
  or stock imitations risk being inaccurate or appropriative. Build-time motifs are
  representative placeholders only, each marked
  `TODO: replace with authentic/approved Lummi art`. Final art must be authentic,
  commissioned, or tribe-approved before launch, and placeholder art is never
  presented as final. Rules in skill `pnw-tribal-art`.
- **The LCC boundary (ADR 0001).** Other Lummi Commercial Company businesses appear
  in exactly one place: a footer link labeled "Lummi Commercial Companies" pointing
  to lcc-lummi.com. Never in page copy, never in navigation. LCC corporate and
  enterprise content stays off this site, including on `/about`.

## Evidence on Hand

**Exists in the repo:** `CONTEXT.md` (confirmed glossary); four ADRs in
`docs/adr/`; the slice-based build plan (`docs/build-plan.md`, currently unmerged in
PR #5); skills `brand-system`, `pnw-tribal-art`, `location-content-model`,
`fuel-price-update`; a 21-issue backlog covering slices S0–S10 and enabling items
E1–E10.

**Present but untrustworthy — must carry a confirmation marker:**
- Addresses, hours, and phone numbers in `location-content-model` are **scraped from
  lcc-lummi.com and unverified** (E6). Ship only with `TODO: client confirm`. Owner
  confirms the intended home: each location's own page content
  (`content/locations/<location>.md`), edited through the CMS, with the footer and
  any JSON-LD reading those same fields rather than retyping them.
- Fuel prices in `fuel-price-update` are **illustrative placeholders**, not real
  prices: the skill's example JSON is stamped `"updated": "2018-05-01"` with values
  like regular 3.79 and diesel 4.29. They exist to show the file's shape and must
  never reach production as current. For scale, `exit260.com` currently posts regular
  at 4.65 and diesel at 5.79 — as sign images, not machine-readable text, so those
  are a sanity check on magnitude, not a source to copy. Real launch numbers come
  from the client (E6).

**Not on hand, and must not be fabricated:**
- **Photography.** The owner confirms the legacy sites' imagery is theirs to reuse,
  and it is the working image source — especially for templating, so layouts are
  built against real photos rather than grey boxes. `exit260.com` is the substantive
  library: it runs on Squarespace and serves its images from
  `images.squarespace-cdn.com/content/v1/5e86582913617e5d37eb1527/`, covering the
  truck stop, fuel-price signage, hot food, DEF, and driver-service icons, with more
  on `/services`, `/truck`, `/hotfood`, and `/tfs`. A dedicated shoot is still planned
  before launch, so treat legacy photos as the template layer and keep image slots
  specified so better frames drop in without a redesign. Two limits: the legacy
  library is Exit 260-weighted, so Mini Mart and Fisherman's Cove coverage must be
  confirmed rather than assumed; and reuse permission is not the same as a model or
  property release, so any recognizable person needs checking before publication.
- Logo vector files (E1).
- Authentic or approved Lummi art (E7).
- Rewards app screenshots and store links (E8).
- Content from the source sites — not yet harvested (E4, issue #20). The real sources
  are exit260.com and lcc-lummi.com's market/location pages (the Cove lives at
  lcc-lummi.com/cove). lummibay.com is not a content source; it is the marina.
- Testimonials, reviews, customer or traffic numbers, awards, press, partner logos,
  fuel-price comparisons against competitors, and staff names or quotes. None of
  these exist. Do not write them.

## Product Principles

1. **A current fuel price is the core promise.** It is reachable in seconds from
   anywhere on the site and always shows when it was set, so a stale price is
   obvious rather than quietly wrong.
2. **Design for a phone at highway speed before a desktop at a desk.** The primary
   visitor is deciding in a short window with one hand, and clarity at a glance
   outranks everything expressive.
3. **The traveler needs an answer; the driver needs detail.** Serve the fast
   decision first and let the truck stop carry the depth, rather than averaging the
   two into a page that serves neither.
4. **If a non-technical editor cannot change it unaided, it is not done.** Every
   fact lives in a file with a plainly labeled CMS field — never hard-coded in
   markup — and the editor is the acceptance test.
5. **Never present a placeholder as confirmed.** Sample prices, scraped hours, and
   stand-in art stay visibly marked. An absent fact is shown as absent, not invented.

## Accessibility & Inclusion

- **WCAG AA for all body text.** Teal and cedar are decorative, large-graphic
  colors that fail AA as small text on light backgrounds; they are never used for
  body copy or small labels. Contrast is verified, never assumed.
- **Lighthouse accessibility ≥ 95** per page, enforced in CI at launch (S10).
- **Keyboard-complete:** visible focus rings, a skip-to-content link, `aria-current`
  wayfinding, correct focus order, and a focus-trapped mobile menu that closes
  properly.
- **Decorative SVGs are `aria-hidden`;** meaningful images carry real alt text.
- **The usage scene makes this functional, not cosmetic.** The primary visitor is
  outdoors in bright sun, one-handed, possibly gloved, possibly on poor signal. High
  contrast, large touch targets, and a page that is useful before it is fully loaded
  are accessibility requirements here, not preferences.
