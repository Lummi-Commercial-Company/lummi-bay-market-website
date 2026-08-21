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

**Placement is the top-right corner**, on phones and desktop alike.

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
  The owner chose corner.

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
- **The corner wants the top-right utility slot** that the site architecture reserves for
  Rewards. Both cannot have it. Unresolved — see below.
- **On a phone the corner card floats over the top of the page content, shut as well as
  open.** At 375px the card is 353px wide, so it obscures the page's own headline
  persistently rather than only while expanded. This is a real cost of corner on small
  screens and was visible in the prototype before the choice was made.
- The popover removes a bug the absolute-positioned version had: because the panel lives in
  the top layer, the block's own box never changes, so **there is no collapsed height to
  reserve**. The in-flow variant on Home does not need a reservation either, since it is
  meant to move the page.
- Prices are still read from `content/fuel-prices.json` and printed. Nothing about display
  reaches back into storage — ADR 0004 stands unchanged.

## Open, and deliberately not decided here
- **Rewards versus the corner.** One of them moves. Needs the owner.
- **Panel height at large text sizes.** Four places fit today; at 200% text the panel can run
  off a phone. A `max-height` with internal scroll is the intended fix.
- **The `/fuel-prices` page duplicates the block.** The intended answer is that the block
  *is* that page — expanded, in flow, per the rule above — but it has not been confirmed.
- **A posted price the pump does not honour.** The site is static; a price change takes a
  rebuild and can lag behind a CDN cache. Whether to show the `updated` stamp and a "prices
  subject to change" line is a business decision, not a design one.
- **The `updated` stamp, stored or derived** — carried from ADR 0004 and now load-bearing if
  the stamp is displayed.
