# Build Plan — vertical slices

How this site gets built. Slices, not phases.

## Why slices

A **phase** plan builds one layer at a time: all the design, then all the components,
then all the content, then wire up the CMS, then deploy. Nothing works until the last
phase lands, the CMS is always the thing that gets cut, and the first time a staff
member touches the editor is the week before launch.

A **slice** plan builds one capability at a time, through every layer. Slice 1 is fuel
prices: the data file, the CMS field, the component, the page, the deploy, and a staff
member actually changing a price. When Slice 1 is done, the highest-value feature on
this site is live and editable — even if nothing else exists yet.

This matters here because the three must-haves are all *editability* requirements
(easy staff updates, editable fuel prices, great navigation). Editability is exactly
what a phase plan defers and a slice plan proves on day one.

## The slice contract

A slice is not done until every line is true:

1. **Data** — content lives in a file in the repo (`content/**` or `src/data/**`).
   Nothing hard-coded in markup.
2. **CMS** — a TinaCMS collection/field exists for it, labeled in plain language a
   non-technical editor understands.
3. **UI** — a real component, styled to the `brand-system` tokens, responsive,
   keyboard-accessible, AA contrast verified (not assumed).
4. **Page** — reachable from navigation. No orphans.
5. **Deployed** — merged to `main`, built on Vercel, visible on a URL.
6. **Editor-provable** — the acceptance test is written as a thing a *staff member*
   does, and someone runs it. "Change the Mini Mart diesel price to 4.05 and see it
   on the homepage in two minutes."
7. **Checked, not asserted** — the slice's own safety checks run (JSON parses, prices
   render, links resolve, Lighthouse a11y not regressed).

Rules that keep slices honest:

- **One slice, one PR, one merge, one deploy.** If a slice needs three PRs, it was two
  slices.
- **A slice too big to demo in five minutes is too big.** Split it.
- **No layer-only slices.** "Build all the components" is a phase wearing a slice's hat.
- **Design is inside each slice**, not a slice of its own. Every slice ships to brand.
  The one design *review* slice (S9) exists to catch drift across pages, not to apply
  styling for the first time.
- **Content arrives with its slice.** copy-editor writes the copy that slice needs,
  from the harvest file — we don't rewrite all three sites up front and let it rot.
- **Reuse or extend, never re-implement.** A slice that duplicates an earlier slice's
  component is a bug in the slice.

## Enabling work (blocks slices — start chasing now)

These are not slices; they are dependencies. Each one has a slice it blocks, so the
asks go out early and the slice keeps moving in the meantime.

| # | Item | Blocks | Fallback if it's late |
|---|------|--------|----------------------|
| E1 | Logo vector files (Market lockup, SVG) | S0 header/hero | Text lockup placeholder, marked TODO |
| E2 | Vercel account + repo connected | S0 deploy | Build locally; `vercel` CLI preview |
| E3 | Tina Cloud account, 2 editor seats, editor emails | S0 CMS login | Tina **local mode** — full editing on a dev machine, flip to Cloud later |
| E4 | Content harvest: fetch exit260.com, lcc-lummi.com, lummibay.com → raw inventory in `docs/content/harvest.md` | S1 onward (copy source) | Write from `CONTEXT.md` + `location-content-model`, flag for client confirmation |
| E5 | DNS control for lummibay.com + exit260.com | S10 redirects | Ship on the Vercel domain, cut over at launch |
| E6 | Confirmed addresses, hours, phones (data in skills is scraped, unverified) | S2/S3 accuracy | Ship scraped values with a `TODO: client confirm` marker |
| E7 | Authentic / tribe-approved Lummi art | S9 final art | Placeholder motifs, every one marked `TODO: replace with approved Lummi art` |
| E8 | Rewards app store links + app screenshots | S6 | Placeholder download buttons, disabled |
| E9 | Careers destination URL | S7 | Editable field, points at lcc-lummi.com |
| E10 | Contact form destination email + spam tolerance | S8 | Route to owner's address, Vercel/Formspree free tier |

E1–E4 are the only ones that block the first two slices. Everything else can be chased
while slices ship.

## Slice ledger

| Slice | Capability shipped | Depends on | Lead agent(s) |
|-------|--------------------|------------|---------------|
| S0 | Walking skeleton — one editable line, live | E1 E2 E3 | frontend + backend |
| S1 | Fuel prices, editable, everywhere | S0, E4 | backend + frontend |
| S2 | Exit 260 location page (the template) | S1, E6 | frontend + copy |
| S3 | Mini Mart + Fisherman's Cove + `/locations` | S2 | copy + frontend |
| S4 | Truck Stop page + Exit 260 cross-link | S2 | copy + frontend |
| S5 | Navigation to spec (the third must-have) | S3 S4 | ux-navigation-architect |
| S6 | Rewards (hero callout + `/rewards` + footer) | S0, E8 | copy + frontend |
| S7 | About + complete footer | S3, E9 | copy + frontend |
| S8 | Contact form that actually delivers | S0, E10 | backend |
| S9 | Design coherence + motif/art pass | S3–S7 | design-director |
| S10 | Launch: redirects, SEO, perf/a11y, editor handoff | all | backend + ux |

S6 and S8 depend only on S0 — they are the parallel lane if a location slice is blocked
waiting on client data.

---

## S0 — Walking skeleton: one editable line, live

**Goal:** prove the entire stack end to end before building anything on top of it —
Next.js → Tina → git → Vercel → live URL, with a human editing text in a browser.

**Ships:** a homepage with the logo, the waterline, and one editable headline. That's it.

- Next.js App Router + TypeScript scaffold; `src/app/layout.tsx`, `page.tsx`
- `globals.css` with the locked `brand-system` tokens, Space Grotesk + Inter loaded
- Shell components: `<SiteHeader>` (logo → Home, nav slots stubbed), `<SiteFooter>`
  (Lummi Commercial Companies link present from day one), `<Waterline>`
- `content/pages/home.md` with one `headline` field
- TinaCMS: `tina/config.ts`, `/admin` route, `useTina` visual editing on that headline
- Vercel project, auto-deploy on push to `main`

**Acceptance (an editor does this):** log in at `/admin` with an email — no GitHub
account — click the homepage headline, type a new one, hit publish, see it live within
two minutes. Then confirm the *old* headline stayed up the whole time the build ran.

**Checks:** Lighthouse a11y ≥ 95 on the one page; token contrast verified; build
green; `/admin` reachable in production.

**Risks:** Tina visual editing needs `"use client"` + `useTina` on any component
carrying editable content — establish that pattern *here*, in one component, before
it's twenty. If Tina Cloud credentials (E3) are late, ship in local mode and treat the
Cloud flip as a one-line config change.

**Resolve here:** the token-name mismatch between `brand-system` (`--lb-teal`) and
`pnw-tribal-art` (`--lb-waterline`, `--lb-blue-900`). Pick one set, define it once in
`globals.css`, and correct whichever skill is wrong. Do not carry two vocabularies
into S1.

## S1 — Fuel prices, editable, everywhere

**Goal:** the site's highest-value, highest-risk feature, first. Follows
`fuel-price-update` exactly.

- `src/data/fuel-prices.json` — one object per location, grades per
  `location-content-model`
- Tina "Fuel Prices" collection: number fields, per-location grades, plain-language
  labels, auto-stamped `updated` date
- `<FuelPriceCard>` / `<FuelPriceTable>` — deep-navy prices, `updated` date visible so
  a stale price is obvious
- `/fuel-prices` page: all three locations in one view
- The same component on the homepage. Written once, used twice — this is the reuse
  contract in action.
- Validation script (`npm run check:prices`) in CI: parses, numbers only, ≥ 0, two
  decimals, no location missing a grade it sells

**Acceptance:** a staff member changes Mini Mart diesel to 4.05 at `/admin` in under a
minute without asking anyone how, and it appears on `/fuel-prices` *and* the homepage.
Then: Claude changes a price via chat (commit + push) and it lands the same way.

**Checks:** the four safety checks in `fuel-price-update`, run — not asserted.

**Risks:** a typo'd price is publicly wrong and costs money. The validation script is
part of this slice, not a follow-up. Prices in the skill are 2018 samples — get real
launch numbers from the client (part of E6).

## S2 — Exit 260: the location template

**Goal:** one location page, complete, so the *pattern* is proven on the hardest case
(the flagship carries the most amenities and the only truck stop).

- `content/locations/exit-260.md` — full schema from `location-content-model`
- Tina "Locations" collection: every field labeled for a non-technical editor
- `<LocationPage>` template: hero, address, hours, phone, map, data-driven
  `<AmenityBadges>` (never hand-placed), fuel block **reused from S1**
- Truck Stop summary block, rendered only when `truckStop: true` — link target lands
  in S4
- Nav gains a Locations entry pointing here for now

**Acceptance:** an editor changes the Exit 260 hours and adds an amenity in `/admin`;
both appear correctly, badge included, with no code change.

**Checks:** address/hours/phone appear nowhere in markup; amenity list drives the
badges; map renders; page passes a11y.

**Risks:** this template has to generalize to two more locations without a rewrite.
Design it against all three schemas (S3 is the proof), not just Exit 260's.

## S3 — The other two locations + `/locations`

**Goal:** prove the template generalizes — the ideal outcome is **zero new component
code**.

- `content/locations/mini-mart.md`, `content/locations/fishermans-cove.md`
- `/locations` index: three cards, hours, at-a-glance fuel, clear "which one do I want"
  wayfinding
- Fisherman's Cove ethanol-free and the Cove Kitchen exercise the amenity/grade model

**Acceptance:** an editor could add a fourth location by filling in a form — no
developer. And: every one of the three legacy sites' location content now has a home
on the new site (checked against the E4 harvest, line by line).

**Checks:** whatever component code S3 *did* need is a bug report against S2's design —
log it, don't hide it.

## S4 — Truck Stop

**Goal:** the flagship's driver-facing facility gets its dedicated page, and the
Exit 260 ↔ Truck Stop cross-link closes.

- `content/pages/truck-stop.md` — diesel lanes, driver store, showers, lounge, parking
- `/truck-stop` page; amenity detail editable, not hard-coded
- Exit 260's summary block now links here; the truck stop page links back

**Acceptance:** a driver landing on `/truck-stop` cold learns what's there, where it
is, and how to get there. An editor updates shower hours without touching code.

## S5 — Navigation to spec

**Goal:** the third must-have — "exceptional navigation" — as a deliberate slice, now
that all four destinations exist and the nav can be judged on the real thing.

- Primary nav finalized: Home · Locations · Truck Stop · Fuel Prices
- Locations dropdown/submenu with the three nav labels
- Mobile navigation: real menu, thumb-reachable, closes properly, focus-trapped
- Active-state wayfinding on every page; skip-to-content link; visible focus rings
- Optional header utility slot for Rewards (decided here, built in S6)
- Footer nav complete and consistent with the header

**Acceptance:** on a phone, from any page, a stranger reaches any fuel price in two
taps. Keyboard-only, every nav item is reachable and the current page is obvious.
ux-navigation-architect signs off against the locked IA in `CLAUDE.md`.

**Checks:** a11y audit of the nav specifically (roles, `aria-current`, focus order).

## S6 — Rewards

- `content/pages/rewards.md`; `/rewards` promo page — what the app does, download links
- Homepage hero callout; footer link; header utility slot if S5 approved one
- Download URLs are **editable fields**, so store links change without a deploy

**Acceptance:** editor swaps an app store URL in `/admin`; the button follows.
No loyalty logic anywhere in this codebase.

**Runs in parallel** with S2–S4 — it only needs S0.

## S7 — About + complete footer

- `/about`: brand story grounded in Lummi values, light community note. LCC corporate
  and enterprise content stays out (ADR 0001) — copy-editor enforces the boundary.
- Footer completed: per-location hours + phone **read from location data** (not
  retyped), Rewards, Careers as an editable link (E9), and the single
  "Lummi Commercial Companies" link to lcc-lummi.com
- Reachable from the footer, not the top nav — per the locked IA

**Acceptance:** changing Mini Mart's hours in `/admin` updates the footer too, because
the footer reads the same data the location page does.

## S8 — Contact form

- One site-wide form; delivery to a real inbox, confirmed by a live test send
- Spam protection (honeypot + rate limit at minimum); no secrets in the client bundle
- Accessible: real labels, inline errors, a success state a screen reader announces
- Destination address editable without a code change

**Acceptance:** a stranger submits the form; the client receives the email; the
submitter sees clear confirmation. Test it, don't assume the provider works.

**Runs in parallel** — only needs S0.

## S9 — Design coherence + motif pass

Not the first design work — every slice above shipped to the brand system. This slice
is the cross-page consistency review and the art pass.

- design-director reviews every page against `brand-system`: type scale, spacing,
  navy-dominant hierarchy, teal/cedar as accents only
- Waterline used as the connective signature on every page, consistently
- Placeholder motifs (canoe, paddle, eagle, salmon, orca, crab) placed per
  `pnw-tribal-art`: flat, 1–2 colors, decorative only, one hero motif per page max
- **Every placeholder marked** `TODO: replace with authentic/approved Lummi art`, and
  those markers inventoried into a single pre-launch checklist
- Decorative SVGs `aria-hidden`; meaningful images get real alt text
- Contrast re-verified after any color change

**Acceptance:** the pages read as one site. A grep for the TODO marker returns the
complete art checklist, and no placeholder is presented as final.

## S10 — Launch readiness

- exit260.com → 301 to the Exit 260 location page; lummibay.com canonical; www handling
- lcc-lummi.com untouched (ADR 0001)
- `sitemap.xml`, `robots.txt`, per-page metadata + OG images
- `LocalBusiness` JSON-LD per location (address, hours, phone from the same data)
- Redirect map for every old URL worth keeping, from the E4 harvest — no dead inbound
  links from the three legacy sites
- Analytics; Lighthouse budgets (perf + a11y) enforced in CI
- **Editor handoff:** a one-page guide, and a live session where staff update a fuel
  price and a page of copy unaided. If they need help, the CMS labeling isn't done.
- Pre-launch checklist cleared: all art TODOs resolved (E7), all `client confirm`
  markers on hours/addresses resolved (E6)

**Acceptance:** an old exit260.com link lands on the right page; the client's staff
publish a change with nobody watching.

---

## Tracking

One GitHub issue per slice, titled `S<n> — <capability>`, body = that slice's section
above (contract checklist included), labeled `ready-for-agent` once its enabling items
are unblocked and `needs-info` while they aren't. Enabling items E1–E10 get their own
issues so the client-side asks are visible and chaseable.

## Open questions for the client

1. Real launch fuel prices, and who on staff owns updating them (E6, blocks S1's
   accuracy).
2. Confirm addresses, hours, and phone numbers — the values in
   `location-content-model` are scraped from lcc-lummi.com, unverified (E6).
3. Which two email addresses get the Tina editor seats (E3).
4. Rewards app store links and whether the app is live now (E8).
5. Careers destination — LCC's page, or somewhere else? (E9)
6. Who commissions or approves the Lummi art, and by when? This is the only item that
   can block launch after the build is finished (E7).
7. Any old exit260.com URLs with meaningful inbound traffic worth a targeted redirect
   beyond the homepage (S10).
