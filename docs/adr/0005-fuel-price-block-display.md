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

**Interior pages do not use the card at all. They use a band.** The card is Home's shape. On
every other page the block is a thin horizontal strip that reads across: one cell per place,
`Name | Grade price  Grade price`. Collapsed carries the page's own Location and the Truck
Stop; expanded adds the other two beneath them, aligned column for column.

```
Exit 260  | Reg. 3.79  Diesel 4.29     Truck Stop | Diesel 4.55  DEF 3.29   ⌄ All 4
– expanded –
Mini Mart | Reg. 3.79  Diesel 4.29     The Cove   | Reg.  3.85   Diesel 4.29
```

Each place keeps **its own grade labels** — the Truck Stop's pair is Diesel/DEF, a Location's
is Regular/Diesel. The Cove does not sell DEF. (The brief's expanded example showed Dies./Def.
against The Cove; that is the Truck Stop's pair repeated down the column, and was read as
pattern copy rather than intent.)

Width is **full width on a phone and 50% on desktop, with a 628px floor** — two cells plus the
toggle column need 620px of measured content, so below about a 1260px viewport the floor
applies. On a phone two cells cannot sit side by side at all (each needs 246px), so it is one
cell per line: two lines collapsed, four expanded.

Height is **44px on desktop and 72px on a phone, open or shut** — the expansion overlays, per
the rule below, so the page moves by nothing. That replaces a 151px desktop card and a 135px
phone card.

The toggle is a fixed-width right-hand column. It has to be fixed: the shut and open labels
differ by 36px, and a cue that changes width on toggle re-flows the row underneath it and
clipped "Truck Stop". Measured, then pinned.

**On Home the block is a card, capped at 400px** — in that resting shape. On a 375px phone that reads as full-bleed; it is the same rule, not a second layout.
The one exception is the condensed desktop bar below, which is deliberately not a card.

**The scroll-condense below is superseded on interior pages** — the band already *is* the thin
line, so there is nothing to morph into, and scrolling would only pin it. Whether it should pin
is open. What follows applies to Home, whose block is still a card.

**On desktop a card condenses to a single line once the page has scrolled through its
middle.** It is pinned under the sticky header, and at that point it stops being a 400px card
and becomes a bar carrying the same two groups on one line — `Exit 260 · Reg 3.79 · Diesel
4.29 | Truck Stop · Diesel 4.55 · DEF 3.29` — with the toggle moved to the end of the line as
"All prices". The expanded panel is unchanged in content and gets a two-column layout at bar
width: the three Locations left, the Truck Stop right.

Width is `max(50%, 620px)`, not a flat 50%. The line's intrinsic width is 614px, so half of a
1024px screen (492px) and half of a 1152px screen (556px) both clip it. Swept across seven
widths with nothing clipping: 620px at 1024 and 1280, then a true half above that — 695px at
1440, 935px at 1920. The 48–49% rather than 50% is the page's own side padding.

**The condensed bar's panel is positioned against the viewport, not against the block.** No
`position-anchor`. This is what makes a sticky block safe (ADR 0006) and it removes CSS anchor
positioning from desktop entirely — the project's one unverifiable dependency now survives on
phones only, where the block still scrolls away and a fixed panel would be left behind.

**The trigger needs JavaScript** — about ten lines of `IntersectionObserver` watching a
sentinel that occupies the block's slot and is the block's own height, so "less than half of it
is still visible" is literally "the page has scrolled through the middle of the block". The
zero-JavaScript route was tried first and does not hold: `animation-timeline: view()` works on
a plain element, but a sticky subject's own view progress stalls before completing (measured at
96%), and moving the timeline to a sentinel with `timeline-scope` did not resolve at page level
or inside a scroller. That is in Chromium, the most permissive engine available. This is the
first feature on the project that costs script.

**Placement is a right-hand rail.** The price card is flush to the **right edge** at every
width. Above it, at the top of the same rail, sits the **Rewards control**.

This resolves what looked like a collision between the price block and the Rewards utility
slot. It was not one: *right side* is an edge, *top-right* is a corner. Once the price card
moves down the right edge, the top of the rail is free, and the two read as one deliberate
column rather than two elements fighting for the same spot. Order is Rewards first, prices
beneath — Rewards is a product and stays in focus at the top of the page; prices are a
reference and sit under it.

**Interior pages have no rail.** Rewards is a "Get the App" pill in the header's right-hand
utility slot (ADR 0006), and the price band sits below the header on its own. The rail —
Rewards above prices on the right — is Home's layout only.

**Home's rail is the price card alone.** Rewards is the global header pill (ADR 0006), so no
page carries a Rewards element beside its prices. Every earlier arrangement here — the club
card image, then the compact cedar control — is superseded; they are kept in the history below
because each was rejected for a reason worth not rediscovering.

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
- **The club card image is supplied brand art and is placed, never redrawn** — the same rule
  the logo carries. That rule stands wherever the image ends up. Its blues are its own and are
  not in the locked palette, so it needs breathing room rather than sitting directly on
  `--lb-navy`, and because the word "Rewards" is inside the image, any link wrapping it needs
  a real accessible name; the picture is not the label.
- **The compact control needs a real accessible name too**, but for the opposite reason: its
  visible text is "LBM Rewards", which is the name, so the link text carries it and no
  `aria-label` should contradict it.
- **The rail must reserve a column on desktop**, not float over one. Prototyped as a float,
  page text ran underneath both cards.
- **On a phone the rail costs 191px before any page content** — control 45px, gap 10px,
  price block 135px — on every page including Home. That is down from 366px when the club
  card image sat in the Home rail. Desktop is 211px, down from 323px. The rejected header
  pill would have returned a further 55px on a phone; that is what the rejection costs.
- **The header above the rail is sticky (ADR 0006), and the rail is not.** That is not a
  style choice: a sticky price card makes the open panel painted-but-unclickable after about
  300px of scroll. The same test confirmed the panel never covers the sticky header. Both
  results and their Chromium-only caveat are in ADR 0006.
- The popover removes a bug the absolute-positioned version had: because the panel lives in
  the top layer, the block's own box never changes, so **there is no collapsed height to
  reserve**. The in-flow variant on Home does not need a reservation either, since it is
  meant to move the page.
- Prices are still read from `content/fuel-prices.json` and printed. Nothing about display
  reaches back into storage — ADR 0004 stands unchanged.

## Open, and deliberately not decided here
- **Where the club card image goes now that it is out of the rail.** Recommended: the
  `/rewards` page, shown large — the guest there has already chosen to look at Rewards. It
  was not part of the ask, so it is not decided here.
- **Panel height at large text sizes.** Four places fit today; at 200% text the panel can run
  off a phone. A `max-height` with internal scroll is the intended fix.
- **The `/fuel-prices` page duplicates the block.** The intended answer is that the block
  *is* that page — expanded, in flow, per the rule above — but it has not been confirmed.
- **A posted price the pump does not honour.** The site is static; a price change takes a
  rebuild and can lag behind a CDN cache. Whether to show the `updated` stamp and a "prices
  subject to change" line is a business decision, not a design one.
- **The `updated` stamp, stored or derived** — carried from ADR 0004 and now load-bearing if
  the stamp is displayed.
