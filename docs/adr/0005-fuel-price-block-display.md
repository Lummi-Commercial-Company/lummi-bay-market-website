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

**One component, three states.**

1. **Resting** — a card, **capped at 400px**, with grade column headers. On **desktop** it
   carries the page's own Location *and* the Truck Stop (400x148). On a **phone interior page**
   it carries the Location **alone** (345x76).
2. **Condensed** — once the page has scrolled roughly halfway past the resting card, at
   **both** widths, it becomes a **single line carrying the page's own Location**: desktop
   365x39 from 400x148, a phone one line from 345x76. Narrower as well as shorter on desktop.
3. **Expanded** — the panel adds **only the places not currently on screen**. Never a repeat.
   Two on desktop (Mini Mart, The Cove), three from a phone interior page or from the condensed
   line (those two plus the Truck Stop). Its heading is "Also at", not "All locations", because
   that is what it now contains. This is one rule rather than a case per state: it falls out of
   what is showing.

```
resting (desktop)                condensed (both)
┌──────────────────────────┐     ┌────────────────────────────────────┐
│ ⌄ View all prices        │     │ Exit 260 │ REG 3.79  DIESEL 4.29 ⌄ │
│            REGULAR DIESEL│     └────────────────────────────────────┘
│ Exit 260      3.79   4.29│
│             DIESEL   DEF │     expanded, from either
│ Truck Stop    4.55   3.29│     ┌──────────────────────────┐
└──────────────────────────┘     │ ALSO AT                  │
                                 │ Mini Mart, The Cove, …   │
resting (phone, interior)        └──────────────────────────┘
┌──────────────────────────┐
│ ⌄ View all prices        │     the panel carries the remainder,
│            REGULAR DIESEL│     so nothing is ever listed twice
│ Exit 260      3.79   4.29│
└──────────────────────────┘
```

Carrying one place rather than two is what makes the condensed bar narrow. The Truck Stop is
dropped from it deliberately: the guest is on a page, the page has a Location, and the line is
a reminder of where they are — not a comparison. The comparison is one click away.

**Home loads expanded and does not condense; interior pages condense.** One rule per page
type, not a special case per width. Home's block is expanded at rest — 400x257 on desktop,
345x230 on a phone — and condensing needs the resting height reserved so the page does not
jump; reserving *that* would leave a large blank hole with a 39px line floating in it. There is
a structural reason too: on Home the two-column region is the **top of the page only**, with
locations, the truck stop and the footer full width beneath it, so the rail has nowhere to
follow the guest to. Home shows all four prices on arrival and lets them scroll away; a
persistent price line earns its keep on the pages that do not.

**Desktop is a two-column page.** The block sits in a **reserved 400px grid column**, not
floating over content — the promo is left-aligned in the content column and its right edge lands
exactly **14px** from the block, so the two cannot collide at any width. On a phone the block is
in flow, full width, above the promo.

**Condensing must not move the page.** A block that shrinks in the flow drags everything below
it: measured on a phone, the promo jumped **37px** mid-scroll. That is a layout shift caused by
scrolling, which counts against Core Web Vitals rather than being excused by it. The block
therefore **keeps its resting height** when it condenses — the collapsed face stays in the
layout and goes `visibility: hidden`, the cue keeps its box, and the one-line bar is drawn over
the reserved space. Measured down in three passes: 37px, 19px, 9px, then **0**. Desktop was 0
throughout, because the grid column absorbs the change.

Two more phone-only details, both found in a browser rather than in a spec. The one-line bar
**clipped at 375px** (357px of content in 343px of room), so the affordance reads "All" there
rather than "All prices". And the rail wrapper has to be dissolved with `display: contents`: as
a box it is only the block's own height, so `position: sticky` has nothing to stick within and
the bar scrolls away immediately.

**The band is superseded.** A thin full-width horizontal band was built as the interior page's
resting layout and has been replaced by the card above. Its cell format survives as the
condensed line — the work moved rather than being discarded.

**The condense trigger** is the same at both widths — roughly half the resting card's height
scrolled past it — a
sentinel occupying the card's slot, at the card's own height, so "less than half of it is still
visible" is literally that. Width is `max-content` with a 340px floor and a 440px ceiling: the
line measures 358px as built, and letting content set the width is what keeps it narrow when a
Location has two grades and wider if one ever has three.

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

**No page has a Rewards element beside its prices.** Rewards is the global "Get the App" pill
in the header's right-hand utility slot (ADR 0006), so the rail is the price card and nothing
else, on every page. Every earlier arrangement here — the club card image, then the compact
cedar control — is superseded; they are kept in the history below because each was rejected for
a reason worth not rediscovering.

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
- **Whether Home's phone layout leads with the price block or the hero.** As the rules stand
  the block is first, which puts the logo lockup and "Three stops on the bay" at **391px** —
  the brand's front door opens on a price table. Measured alternative: hero first, block
  immediately under it, puts the headline at **161px**. Desktop is unaffected (193px either
  way, since the block is in the rail column). Recommended: hero first on Home's phone layout
  only; every other page keeps prices on top.
- **Desktop and phone now rest on different content**, not just a different arrangement —
  desktop shows the Location and the Truck Stop, a phone interior page shows the Location alone.
  This was asked for and is defensible, but it is the first place a breakpoint changes *what
  data is rendered*. The component and the panel both have to know which case they are in.
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
