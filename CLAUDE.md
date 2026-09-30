# Lummi Bay Market — Website Build

## Source of truth
This file is the project's single source of truth. Read it first every session.
Detailed rules live in `.claude/skills/`; specialist personas live in `.claude/agents/`.
Do not duplicate content between files — link to the skill instead.

## The goal
Merge three existing location websites into ONE fast, easy-to-update site for the
Lummi Bay Market brand.
- Sources: exit260.com, lcc-lummi.com, lummibay.com → one site.
- Must-haves: (1) easy content updates by non-technical staff, (2) editable fuel
  prices, (3) exceptional navigation.

## The brand = one company, three locations
1. **Salish Village** (aka "Exit 260") — fuel + convenience store, plus a **separate truck
   stop** on the same property: its own fuel station for truckers with a small c-store,
   driver lounge, showers and truck parking. Not an amenity of the store — see CONTEXT.md.
   The flagship.
2. **Lummi Bay Minimart** — fuel + convenience store.
3. **The Cove** (aka "Fisherman's Cove") — fuel + convenience store.
All three share the Lummi Bay identity; each keeps its own name as a sub-brand.

## Hard rules (never break)
- **Logo is locked.** Use the existing logo art as-is. Never redraw, recolor, or
  restyle it. Colors and fonts *around* it may be enhanced; the logo may not.
  **One carve-out, approved 27 Aug 2026: the paddle alone is the icon mark** — favicon,
  app icon, avatar, any small square slot the lockup cannot fill. For that use it may be
  recoloured (it ships white on a navy disc) and its 16px weight is deliberately thickened.
  The carve-out is the icon and nothing else: the lockup is unchanged, stays the master mark
  everywhere, and a bare paddle never stands in for it in the header, the hero, or any other
  lockup slot. Method and measurements in `public/brand/README.md`.
- **Other Lummi companies** appear ONLY as a single footer link labeled
  "Lummi Commercial Companies." Nowhere else in copy or nav.
- **Cultural respect.** Coast Salish art is specific to Lummi Nation. For the build,
  use representative placeholder motifs (canoe, paddle, eagle, salmon, orca, crab,
  blue waterline). Mark every placeholder `TODO: replace with approved Lummi art`.
  Final art must be authentic or tribe-approved before launch.

## Stack (locked)
- **Next.js (App Router)** — React web framework. Chosen over Astro specifically because
  TinaCMS visual editing requires React (`useTina`); Astro support is experimental.
- **React** — component library Next.js is built on.
- **TinaCMS** — git-based CMS with **visual (click-to-edit) editing**: staff open the
  page, click text or a fuel price, edit it in a sidebar with live preview, and publish.
  Login is by email — no GitHub account needed. See ADR 0002 and ADR 0003.
  - **Free tier, 2 editor logins** (locked). Next tiers: Team $24/mo (3 users),
    Team Plus $41/mo (5 users). Verified against tina.io/pricing, Aug 2026.
  - Content is stored as Markdown/JSON **files in the git repo** — this is what lets
    Claude make content updates through chat via a normal commit and push.
- Static-first: prerender pages (SSG/ISR). No content database to run or back up.
- Domain: **lummibay.com** is canonical; **exit260.com** 301-redirects to the Exit 260
  location page. lcc-lummi.com stays as-is (the footer link — see ADR 0001).
- Deploy: **Vercel Pro, $20/mo** (best Next.js support; auto-rebuilds on git push). Pro is
  required, not chosen: Hobby is restricted to non-commercial use and this is a commercial
  site — see ADR 0013. Netlify is the fallback. Finalize with backend-engineer.
- Editors are non-technical → keep every editable field simple and labeled.

## Brand, theme, content (see skills)
- Colors, fonts, tokens → skill `brand-system`.
- Tribal motifs + the blue waterline → skill `pnw-tribal-art`.
- Location schema + amenity differences → skill `location-content-model`.
- Fuel-price editing procedure → skill `fuel-price-update`.
- **No cookie banner** — the site sets no cookies to consent to, which is a constraint on every
  future embed and on analytics, not just a decision already made — ADR 0025.

## Site architecture (locked — owned by ux-navigation-architect)
Primary nav (3): **Home · Locations · Truck Stop** — Fuel Prices removed, see ADR 0008. On a
**phone the three sit behind a ☰ menu** at the right of the header, after the pill: the header
cannot hold the lockup, three links and the pill below ~430px, which is every common phone
(ADR 0029). Still three items.
- Locations: index → 3 detail pages (nav labels: Exit 260 · Minimart · Fisherman's Cove).
- Truck Stop: dedicated page; the Exit 260 page carries a short summary that links to it.
- `/fuel-prices` still exists as a page — reached from the price block's "All prices" panel
  only, not from the nav and not from the footer (ADR 0008, amended 18 Sep 2026).
- **Rewards**: a "Get the App" pill in the header's right-hand utility slot on **every** page,
  plus the `/rewards` app-promo page and the footer. Nowhere else — see ADR 0006.
- **Promos**: a full-width graphic promo region below the page title on interior pages, linking
  to a product info page (ADR 0007). Product info pages are the `infoPages` collection — ADR 0015.
- **Hours**: each Location's `hours` is one line, plus `hoursOverrides` — a temporary second line
  on a date window, live per visitor in Pacific time, so New Year's Eve hours are typed in November
  and revert on their own (ADR 0027). `endsAt` is required. It is not the alert bar: the alert is
  sitewide and says something the hours cannot; the override is per-Location and fixes the hours
  themselves wherever they render.
- **Emergency notice**: a list of notices (`alerts` in Site settings) rides inside the sticky
  header on every page, published by on-demand revalidation in under a second rather than a
  rebuild — ADR 0017. Since 30 Sep 2026 each notice may carry its own start and end (MM/DD/YYYY,
  optional time), evaluated per visitor in Pacific time; with no dates it is one switch, as
  before. The bar shows one notice: the first live one in list order. Rules in `lib/notices.ts`,
  with tests. It is
  one of **four** reasons the build must never be `output: 'export'`; the others are fuel prices,
  which render per request against the content API so a pushed price is live immediately (ADR 0024),
  the hours override, which is evaluated per request against the visitor's date (ADR 0027), and
  promos, whose date window is too (ADR 0018) — as the notices' windows now are. Static export would silently delete all four rather
  than fail.
- **Header motifs** are managed by staff (30 Sep 2026, ADR 0021 amended): motif files uploaded to
  their own folder through a box that checks each SVG before storing it, arranged in motif groups
  with strength, scale, spacing and ink — all in Site Settings → Header motifs, below the
  background watermark. The site checks every
  file again before drawing it. Uploading art does not approve it — the cultural rule still holds.
- **Dates are MM/DD/YYYY** everywhere staff type or read them (owner's direction, 30 Sep 2026) —
  promotions, temporary hours, fuel price stamps — with an optional time such as `12:00 PM`, typed or
  picked from the Calendar button beside every date box (`tina/fields/date-field.tsx`). One
  parser, `parseWhen` in `lib/pacific-time.ts`; older YYYY-MM-DD values still read.
- Header is **sticky** on every page. The fuel-price rail is sticky **wherever the page has two
  columns** — from 720px, the title column beside the block, stacking only below that (30 Sep
  2026, ADR 0006 amended) — and only because the condensed block's panel is positioned against the viewport there rather than
  anchored to the block — a sticky anchor plus an anchor-positioned panel is broken, measured
  (ADR 0006). Below 720px the rail sits at the top of the page and scrolls away. **The rule is
  conditional on that mechanism:** if the panel is ever anchored to the block again, the rail
  must stop being sticky. Logo (Market lockup) top-left → Home. The top-right utility slot
  carries the Rewards "Get the App" pill on every page.
Footer: **four headed columns**, as the approved templates draw them (ADR 0029) — **About**
(Our story → `/about`, a brand story grounded in the Lummi values + light community note, LCC
corporate/enterprise content stays out; Contact), **Visit** (the three Locations and the Truck
Stop; filled from the Location data whenever its rows are left empty), **Rewards** (Get the app → `/rewards`) and **Work with
us** (Careers, an editable link). **No "Salish Village" link**, though the template draws one: it
is an LCC development, so it falls under the hard rule on other Lummi companies. **Every
footer link is editable** in Site settings → Footer links (30 Sep 2026, ADR 0029): one ordered list
for the four columns, plus the Privacy Policy link (editable, never removable) and the Lummi
Commercial Companies address (its text is fixed). The site refuses a link whose text names
another Lummi business, or whose address could run code, so the hard rule holds even if one is
saved. Below those
columns and above the base row sits a **social row** — one icon-and-link per account, from a settings list,
rendering nothing while the list is empty. **Links only, never embeds**: a feed, a follow button or
an official share widget loads third-party code and sets cookies before anyone clicks (ADR 0028).
The base row carries **© Lummi Bay Market**, a **Privacy Policy** link → `/privacy`, and the single
**Lummi Commercial Companies** link → lcc-lummi.com — nothing else. **The
"No cookies. Visits counted anonymously." line is no longer in the footer** — removed at the
owner's direction 29 Sep 2026; the same claim is made in full in the "This website" section of
`/privacy`, which is where it belongs (ADR 0025, amended). The *constraint* is unchanged and is
still the reason embeds and analytics are limited: the site sets no cookies, and anything added
later that sets one now falsifies a published policy page rather than a footer line. `/privacy`
exists because neither app store will publish the **Rewards app** without a public policy URL
(ADR 0026); it is a `pages` document, is never renamed or deleted once it is in a store listing,
and is not in the nav.
The contact form and the per-location hours/phone block are **not** in the footer. There is
no form anywhere on the site; hours, addresses, phone and a per-Location synopsis live on
`/contact`, derived from the Location data — ADR 0015. `/contact` also carries one map with a
pin per Location and no promos; the mechanism is settled — an embedded Google My Maps behind a
click-to-load still image, ADR 0019 with ADR 0025. What is outstanding is that nobody has built
the map yet, so both settings fields are empty and `/contact` renders one section fewer.
Note: `/about` still exists as a page — it is reached from the footer, not the top nav.

## Page types (ADR 0015, ADR 0016)
Pages are **documents in TinaCMS collections**, not hand-written routes — staff add a page
without an engineer, and the header, footer, waterline, fuel block and back-to-top come from
the layout and cannot be lost or moved by a page.
- `pages` — general pages, including `/contact` (no form).
- `mainPages` — more than one main page may exist; a settings singleton points at the live one,
  so a replacement is built in full and switched over by changing one field.
- `infoPages` — what a promo links to. When its promo is not live the page keeps its URL, drops
  out of the sitemap, goes `noindex` and says the offer has ended — never deleted, or shared
  links break and it could not be reactivated (ADR 0018).
- `promos` — documents with a date window and a `placement`. **Any number, on any page.** The
  region is a list of rows and each row picks how many it holds (1–4 across); a row re-divides
  evenly when a promo in it expires, and rows are capped at six per page. Live is computed per visitor, so expiry is exact without a
  scheduler. `mainPages` is demoted to a redesign escape hatch and is never scheduled (ADR 0018).
  **Built 30 Sep 2026:** rows come from Site settings unless a page sets its own; the region runs
  full page width under the title and price block; an offer page lives at `/info/{file name}`.
  Rules in `lib/promos.ts`, with tests — ADR 0018, Amendment.
- `tenants` — independent businesses renting space on a Lummi Bay property. Known at Exit 260:
  Piroshky Piroshky (inside the store), Wendy's and Black Bear Diner (freestanding buildings;
  Black Bear not yet built), and Hi-Tide Coffee (a coffee truck). All rent from LCC; the site never says so. **Settled 17 Sep 2026: yes, they are advertised** — there
  is a tenants page and each tenant gets a card on it. A card links either to a tenant page here or
  straight out to the tenant's own website, chosen per tenant via `linkMode` and revisable; an
  external card is visibly marked as leaving the site. Nothing renders until a tenant document is
  published (ADR 0016). **A tenant is never a Location** (it would land in the Locations index and the
  fuel price table) and never an Amenity. **Settled 16 Sep 2026: the Cove Kitchen is an
  Amenity, not a tenant** — Lummi Bay Market runs it, so it stays in Fisherman's Cove's
  `amenities` and is unaffected by whether tenants are advertised at all.
  The index is its own page, "Also at Exit 260" — never "Salish Village" (ADR 0001 collision) — grouped by where each business is rather than alphabetically. Not in the nav.
A new page never appears in the nav on its own — the nav stays three items (ADR 0008).

## Specialist agents (delegate to keep context lean)
- `design-director` — visual system, art direction; applies brand + tribal-art skills.
- `frontend-engineer` — Next.js/React components, responsive, performance, accessibility.
- `backend-engineer` — data layer, TinaCMS config, fuel-price wiring, deploy, technical SEO.
- `ux-navigation-architect` — IA, navigation, user flows, wayfinding.
- `copy-editor` — merge/rewrite content from the 3 sites into one brand voice.

## How we work (token efficiency)
- Delegate isolated tasks to the matching agent so the main thread stays lean.
- Load a skill only when the task needs it; never paste skill text into other files.
- Reuse components; never hand-code the same block twice.
- Read prices/addresses/hours from data, never hard-code them in pages.
- Ask before adding dependencies, pages, or nav items.

## First tasks
1. copy-editor: fetch the 3 URLs, extract + de-duplicate content, map to the IA.
2. ux-navigation-architect: confirm sitemap + nav.
3. design-director + frontend-engineer: build the layout shell (header, footer,
   waterline, tokens).
4. backend-engineer: wire location data + fuel prices + TinaCMS (see ADR 0002, 0004).

## Engineering skills (Matt Pocock)
General engineering + productivity skills are vendored in `.claude/skills/` alongside
this project's own skills — committed to the repo, on the default branch, so every
session has them without an install step. Never install them at the user level: a web
session's home directory is rebuilt from scratch each time and they would disappear.
How they operate is configured in `docs/agents/`:
- **Skills** — where they live, and why the `/`-only ones are absent from Claude's
  skill list by design. See `docs/agents/skills.md`.
- **Issue tracker** — GitHub Issues via the GitHub MCP tools (`gh` only where it
  exists — remote sessions have no `gh`). See `docs/agents/issue-tracker.md`.
- **Triage labels** — five canonical roles, already created on the repo.
  See `docs/agents/triage-labels.md`.
- **Domain docs** — skills read `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
Typical flow: `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`.
Not sure which skill fits? `/ask-matt` routes you.
