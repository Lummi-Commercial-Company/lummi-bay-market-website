# Lummi Bay Market — Website Build

## Source of truth
This file is the project's single source of truth. Read it first every session.
Detailed rules live in `.claude/skills/`; specialist personas live in `.claude/agents/`.
Do not duplicate content between files — link to the skill instead.

## The goal
Merge the existing location websites into ONE fast, easy-to-update site for the
Lummi Bay Market brand — three locations, one site.
- Sources: exit260.com and lcc-lummi.com's market content → one site. lummibay.com is
  a *destination*, not a source — it currently serves Lummi Bay Marina, which moves to
  marina.lummibay.com (ADR 0004). Exit 260's e-commerce/cart is retired, not migrated.
- Must-haves: (1) easy content updates by non-technical staff, (2) editable fuel
  prices, (3) exceptional navigation.

## The brand = one company, three locations
1. **Exit 260** (full name "Lummi Bay Market at Exit 260") — fuel + convenience store + full truck stop
   (showers, driver lounge, secondary store, truck parking). The flagship.
2. **Mini Mart** (full name "Lummi Bay Market Minimart") — fuel + convenience store.
   Closed for renovation 2026-08-17 → targeted December 2026; pumps stay open.
3. **Fisherman's Cove** (aka "The Cove", "Gooseberry Point") — fuel + convenience
   store, plus the Cove Kitchen and boat ramp access. Nav label may change to
   "The Cove" before go-live; it lives in data, so that is a one-field edit.
All three share the Lummi Bay identity; each keeps its own name as a sub-brand.

## Hard rules (never break)
- **Logo is locked.** Use the existing logo art as-is. Never redraw, recolor, or
  restyle it. Colors and fonts *around* it may be enhanced; the logo may not.
- **"Salish Village" is not a location name.** It is a 160-acre mixed-use
  development at Exit 260 with its own commercial leasing agent; the market is its
  anchor tenant, not the development. Never use it to name a store (ADR 0005).
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
  - **Free tier, 2 editor logins** (locked). Team tier ($29/mo, 5 users) only if staff grows.
  - Content is stored as Markdown/JSON **files in the git repo** — this is what lets
    Claude make content updates through chat via a normal commit and push.
- Static-first: prerender pages (SSG/ISR). No content database to run or back up.
- Domain: **lummibay.com** is canonical; **exit260.com** 301-redirects to the Exit 260
  location page. lcc-lummi.com stays as-is (the footer link — see ADR 0001).
  **marina.lummibay.com** carries Lummi Bay Marina off the apex — sequence and
  redirect obligations in ADR 0004.
- Deploy: **Vercel** (best Next.js support; auto-rebuilds on git push). Netlify is the
  fallback. Finalize with backend-engineer.
- Editors are non-technical → keep every editable field simple and labeled.

## Brand, theme, content (see skills)
- Colors, fonts, tokens → skill `brand-system`.
- Tribal motifs + the blue waterline → skill `pnw-tribal-art`.
- Location schema + amenity differences → skill `location-content-model`.
- Fuel-price editing procedure → skill `fuel-price-update`.

## Site architecture (locked — owned by ux-navigation-architect)
Primary nav (4): **Home · Locations · Truck Stop · Fuel Prices**.
- Locations: index → 3 detail pages (nav labels: Exit 260 · Mini Mart · Fisherman's Cove).
- Truck Stop: dedicated page; the Exit 260 page carries a short summary that links to it.
- Fuel Prices: all locations in one view (also on Home and each location page).
- **Rewards**: Home hero callout + `/rewards` app-promo page (download link) + footer.
- Logo (Market lockup) top-left → Home. Optional top-right utility slot for Rewards.
Footer: **About** (brand story grounded in the Lummi values + light community note; LCC
corporate/enterprise content stays out), contact form, per-location hours/phone,
**Rewards**, **Careers** (editable link), and the single **Lummi Commercial Companies**
link → lcc-lummi.com.
Note: `/about` still exists as a page — it is reached from the footer, not the top nav.

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
4. backend-engineer: wire location data + fuel prices + Decap CMS.

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
