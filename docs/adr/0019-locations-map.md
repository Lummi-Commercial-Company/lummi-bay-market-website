# 0019 — One map with all three pins, and why the free embed cannot do it

Status: Accepted. Layout and mechanism both settled — **Google My Maps, embedded**.

Terms (Location, Truck Stop): `CONTEXT.md`. Lives on `/contact` (ADR 0015).

## Context
`/contact` should carry a single map showing every Location, so a guest can see the three of
them at once rather than opening three separate maps.

Checked against Google's own documentation rather than assumed, and the obvious answer does not
work:

- **The Maps Embed API is free** — *"All Maps Embed API requests are available at no charge with
  unlimited usage"* — and requires an API key.
- **No mode displays several specific pins.** There are five: place, view, directions, street
  view, search. Place shows *a* place. Search shows *results for a search across the visible
  region*, which is whatever Google finds, not a set you choose. Directions draws a route, not a
  set of destinations.

So "one map, three pins I control" is not something the free embed does, and any plan that
assumes it will fail at build time rather than at design time.

## Decision

**The layout is settled: one full-width map below the Location blocks, with a numbered pin list
under it.** The list is not decoration — it names each Location beside its pin, so the map is
usable on a phone where pin labels are small, and it still works if the map fails to load,
which on a third-party embed is a real state.

**Three pins, not four.** The Truck Stop shares Exit 260's address, so a fourth pin would land on
top of the third. Its pin note says the Truck Stop is there.

**The mechanism is Google My Maps, embedded.** Confirmed against Google's own support
documentation: a custom map is embedded from **Share → "Embed on my site"**, which returns an
iframe. **The map must be set to public or the embed renders nothing for a visitor** — that is
the step this fails on, and it fails silently rather than with an error.

"Public" there means anyone may *view* it. Editing stays with the account, so it is not a
permissions hole.

No API key and no cost. The three options were:

| | Control | Cost | Catch |
|---|---|---|---|
| **Google My Maps** — build a custom map, embed it | Exact | Free, no API key | The map lives inside somebody's Google account |
| **Maps JavaScript API** with markers | Exact, plus styling | **Billed per map load** | More to build and a running cost on a $20/mo site |
| **A static map image** with pins drawn on | Exact | Free | Not interactive — no zoom, no "directions from here" |

**My Maps carries one condition**, because its catch is the same failure this project already
has a checklist item for. A map built in a personal Google account
disappears when that person leaves, exactly like a domain registered under a former employee's
address (A6). If My Maps is used, **the map is created in a company account from the start** —
not moved there later, because ownership transfer on consumer Google products is not reliable.

## Consequences
- **An embedded Google map loads third-party code and sets cookies.** This site has no cookie
  banner and no consent mechanism anywhere in its architecture, which has been fine because
  nothing tracked anyone. A map changes that, and the question is a legal one rather than a
  design one. Not speculative: Google's own support forum carries people hitting **Lighthouse
  cookie warnings from exactly this iframe**, so it surfaces in a routine audit. A static image avoids it entirely — worth weighing, since the interactivity a
  guest actually wants is usually "open this in my own maps app", which a link does.
  **Resolved 16 Sep 2026 by ADR 0025**, which weighed exactly that and kept both: `/contact`
  renders a static map image with per-Location Directions links, and mounts this iframe only if
  a guest clicks to open the interactive map — behind a one-line notice saying the map connects
  to Google, which is what makes the click count as informed consent rather than just a click. Nothing above changes — the mechanism, the company
  account and the public setting all still apply — only *when* the iframe loads. The site sets no
  cookies before an explicit act, so there is no banner and no audit finding.
- The embed is an iframe and iframes are heavy. It loads below the Location blocks, so it should
  be lazy-loaded and must never delay the phone numbers above it.
- **The review templates cannot show it.** The preview sandbox blocks outside hosts, so the map
  is a marked placeholder at the right size and position. That is a limitation of the preview,
  not of the design.


## Addendum — the steps, so nobody rediscovers them

1. Create the map in **the company Google account**, not a personal one. Doing this first is the
   whole of A17; moving it later is the part that does not work reliably.
2. Add a pin per Location. Three, not four — the Truck Stop shares Exit 260's.
3. Name the map something a stranger would understand. The title shows in the embed.
4. **Share → set the map to public.** Skipping this is the failure mode: the embed returns an
   empty frame rather than an error, so it looks like the code is wrong when the setting is.
5. **Share → Embed on my site** → copy the iframe.
6. Hand the iframe to whoever is building `/contact`. It is content, not code, and it belongs in
   a CMS field so the map can be swapped without a deploy.

Step 6 matters more than it reads: a hard-coded iframe means every future map change is an
engineering task, which is the thing this whole project is built to avoid.
