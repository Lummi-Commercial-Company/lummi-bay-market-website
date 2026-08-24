# 0005 — The fuel price block is one component, shown as a corner card, opened as a popover

Status: Accepted

Companion to ADR 0004, which decides where prices are *stored*. This decides how they are
*shown*. Terms (Fuel Price, Fuel Grade, DEF, Truck Stop, Location): `CONTEXT.md`.

## Context
Prices appear on every page. The owner asked for them subtly sitewide, prominently on Home,
and set out the collapsed and expanded layouts directly. Three requirements shaped the rest:
the block must **overlay page content when it opens rather than push it down**, it must be a
**card no wider than 400px**, and **every instance must collapse and expand** — there is no
"always expanded" variant.

Working prototypes settled several questions that argument could not. They are recorded here
because each one cost a wrong turn first.

## Decision

**One component, two layouts.**
- *Collapsed* — two groups with grade column headers: the page's own Location, then the
  Truck Stop, always. On `/truck-stop` the order reverses so diesel and DEF lead.
- *Expanded* — all four places in the same two-group shape: the three Locations under
  regular/diesel, the Truck Stop under diesel/DEF.

Column headers are kept in both states. They are a comparison device, and expanded is where
the comparison happens: a Location priced a few cents apart is visible at a glance in aligned
columns and invisible in a run of inline text.

**The block is a card, capped at 400px**, in every placement and at every width. On a 375px
phone that reads as full-bleed; it is the same rule, not a second layout.

**Placement is a right-hand rail.** The price card is flush to the **right edge** at every
width. Above it, at the top of the same rail, sits the **Rewards club card**.

This resolves what looked like a collision between the price block and the Rewards utility
slot. It was not one: *right side* is an edge, *top-right* is a corner. Once the price card
moves down the right edge, the top of the rail is free, and the two read as one deliberate
column rather than two elements fighting for the same spot. Order is Rewards first, prices
beneath — Rewards is a product and stays in focus at the top of the page; prices are a
reference and sit under it.

**The Rewards slot changes size by page, not by structure.** On Home it holds the **club card
image**. On every other page it holds a **compact control** — one line: mark, name, one-line
reason, and a call to action. The rail is the same on both; only the slot's height differs, so
Rewards is at the top of every page and the pattern is learned once.

The control is **cedar**, not navy. Drawn in navy it read as a second nav bar, because the site
header directly above it is the same navy and the two fused into one mass. Drawn in paper with
a teal underline it read as a second price card and Rewards disappeared into the rail. Cedar is
the brand accent, it separates from both, and the call-to-action pill goes navy on it.

Rejected: demoting Rewards to a pill in the header's top-right utility slot. It costs no page
height, and it is what the locked architecture anticipated for that slot, but a nav-sized pill
reads as wayfinding at the same weight as Locations and Truck Stop — not as a key product.
Worth revisiting only if the header is made sticky, since then Rewards would never scroll away.

**Opening is an overlay, by two different mechanisms.**
- A block that **loads collapsed** — every page but Home — opens as an **HTML popover**
  (`popover="auto"` with a `popovertarget` button), anchored over the block so the panel
  covers it rather than repeating its rows.
- A block that **loads expanded** — Home, and the `/fuel-prices` page — cannot overlay
  anything, because an overlay drawn on arrival would cover the hero before anyone touched
  it. There the panel sits **in the layout** as a plain disclosure and collapsing it lets the
  page rise.

That branch is one rule, not a special case: *a panel already open on arrival cannot overlay.*

**Stacking order** is fixed as four named layers, recorded here rather than in skill
`brand-system`:

| layer | value | what sits there |
|---|---|---|
| waterline | 1 | decorative bands |
| block | 40 | the collapsed price card |
| panel | 50 | the expanded panel, when not a popover |
| nav | 60 | site header and mobile menu |

The nav outranks the panel deliberately: one is navigation, the other is information. A
popover renders in the browser's top layer and outranks all of it regardless.

## Considered options

- **Column headers dropped when collapsed**, one line per place. Rejected after seeing both:
  headers cost two lines and buy nothing collapsed, but keeping them in *both* states makes
  the two layouts one layout at two lengths. Consistency won over the two lines.
- **No toggle on Home** — "always expanded" was in an earlier draft of the display rules. It
  contradicted the one-component decision in the same breath and is now gone. Every block
  collapses.
- **A full-bleed bar.** Rejected by the owner: at desktop widths a price strip spanning
  1200px is a banner, not a detail.
- **`<details>`/`<summary>` for every block**, which was the original zero-JavaScript plan.
  Rejected for the overlay case: native `<details>` closes only from its own control, so a
  guest who taps the page behind an open panel — or presses Escape — gets nothing. It
  survives for the in-flow case, where there is no overlay to dismiss.
- **Ten lines of script for outside-click and Escape.** Held as the fallback if the popover's
  anchor positioning proves unsafe.
- **Docked, sticky, and bottom-sheet placements.** All three prototyped. Sticky costs 134px
  of every phone screen permanently; docked is gone the moment a guest scrolls; the bottom
  sheet had the best thumb reach and was the only placement needing no anchor positioning.
  The owner chose the right edge.
- **Rewards moved instead of the price block.** Considered when the two appeared to want the
  same corner. Rejected once it was clear they want different things — an edge and a corner —
  and both fit.

## Consequences

- **The zero-JavaScript promise holds**, and by a better route than expected. `popover="auto"`
  gives outside-click *and* Escape dismissal with no script, and the page does not reflow.
  Verified in Chromium 141 — outside-click closed, Escape closed, hero moved 0.0px, and the
  panel stayed glued to its anchor through a scroll.
- **This is now the project's only dependency on CSS anchor positioning**, and corner is the
  one placement that could not avoid it. A bottom sheet is pinned to the viewport and needs
  no anchor; a corner card must be told where its corner is. **Only Chromium was testable
  here — Safari and Firefox are unverified.** Popover itself is broadly supported; anchor
  positioning is the risky half. If it does not hold, the fallback is the ten-line script,
  and the component's shape does not change.
- **The Rewards club card is supplied brand art and is placed, never redrawn** — the same
  rule the logo carries. Its blues are its own and are not in the locked palette, so it needs
  breathing room rather than sitting directly on `--lb-navy`. Because the word "Rewards" is
  inside the image, the link needs a real accessible name; the picture is not the label.
- **The card is sized to the rail on phones, not on desktop.** At the rail's full 400px it is
  250px tall and pushes prices well down the page, so on desktop it is set to 260px and
  right-aligned to share the price card's right edge.
- **The rail must reserve a column on desktop**, not float over one. Prototyped as a float,
  page text ran underneath both cards.
- **On a phone the rail costs real estate before any page content.** Measured on Home:
  card 221px + 10px gap + price block 135px = **366px**, about 45% of a 375x812 viewport.
  The compact control brings the interior-page rail to **191px** — 175px back — and on
  desktop from 323px to **211px**. The header pill would have returned a further 55px on a
  phone; that is what the rejection above costs.
- The popover removes a bug the absolute-positioned version had: because the panel lives in
  the top layer, the block's own box never changes, so **there is no collapsed height to
  reserve**. The in-flow variant on Home does not need a reservation either, since it is
  meant to move the page.
- Prices are still read from `content/fuel-prices.json` and printed. Nothing about display
  reaches back into storage — ADR 0004 stands unchanged.

## Open, and deliberately not decided here
- **Panel height at large text sizes.** Four places fit today; at 200% text the panel can run
  off a phone. A `max-height` with internal scroll is the intended fix.
- **The `/fuel-prices` page duplicates the block.** The intended answer is that the block
  *is* that page — expanded, in flow, per the rule above — but it has not been confirmed.
- **A posted price the pump does not honour.** The site is static; a price change takes a
  rebuild and can lag behind a CDN cache. Whether to show the `updated` stamp and a "prices
  subject to change" line is a business decision, not a design one.
- **The `updated` stamp, stored or derived** — carried from ADR 0004 and now load-bearing if
  the stamp is displayed.
