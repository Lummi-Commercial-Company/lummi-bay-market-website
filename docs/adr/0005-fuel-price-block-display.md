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

**One table. One header row. Never two grouped blocks.**
Every place in the block is a row of the same grid, under one header row, with **a column per
grade** — regular, diesel, DEF. A place that does not sell a grade gets an em-dash, which is
information rather than a gap. The earlier design stacked two separate tables (Locations under
regular/diesel, the Truck Stop under diesel/DEF) and it read as two unrelated cards of numbers
sitting on top of each other.

The column set is derived: **the table shows the union of the grades sold by the rows currently
on screen.** Visible, not present — that distinction is the whole rule. DEF is a Truck Stop
grade, so the DEF column exists wherever the Truck Stop is a row and nowhere else: in the
resting card at both widths, in the panel once the block condenses and the Truck Stop moves
there, and never in the condensed one-line bar, which carries a single Location. One rule, no
per-state layout to maintain.

The columns carry the grade, and the row label carries the place. Truck-lane diesel and car-lane
diesel share the DIESEL column; the Truck Stop row is what says which lane it is.

Column headers appear exactly once. **The panel is a continuation of the card's table, not a
table of its own**, so it repeats neither the headers nor a caption — a hairline separates the
rows already on the page from the rest, the way a rule separates sections of one table. The
panel supplies a header row only in the condensed state, where the card is not on screen to
carry one.

Headers earn their place: they are the comparison device. A Location priced a few cents apart is
visible at a glance in aligned columns and invisible in a run of inline text.

**One component, three states.**

1. **Resting** — a card, **capped at 400px**, with grade column headers, carrying the page's own
   Location *and* the Truck Stop. **The same card at both widths**: 400x110 desktop, 345x102
   phone. The phone once carried the Location alone; that difference is gone, and with it a
   per-width branch in the component. Truck prices are the reason a whole class of guests is on
   the site, and a phone is what they are holding.
2. **Condensed** — once the page has scrolled roughly halfway past the resting card, at
   **both** widths, it becomes a **single line carrying the page's own Location**: 400x39 from
   400x110 on desktop, 345x39 from 345x102 on a phone. The Truck Stop is not dropped when this
   happens — it moves into the panel, per rule 3. The bar keeps the card's width; sized by
   content it came out 365px, and a narrow bar under a 400px panel reads as two objects.
3. **Expanded** — the panel adds **only the places not currently on screen**. Never a repeat.
   At rest, two at both widths: Minimart and The Cove, because the Truck Stop is in the card.
   From the condensed line, three at both widths: those two *plus the Truck Stop*, because the
   one-line bar carries a single Location. This is one rule rather than a case per state, and
   getting it wrong is what dropped the Truck Stop out of the condensed view entirely.
   The panel has **no caption**. "Also at" labelled a second block, and there is no second
   block any more.

   **"The page's own" is the page's subject, not always a Location.** On `/truck-stop` the
   Truck Stop leads the resting table so diesel and DEF are the first numbers a driver hits, it
   is what the condensed bar carries, and **Exit 260** is therefore the row that moves into the
   panel on condense. Same component, same rule, different subject — the class that marks that
   row is named `oncond` ("in the card, not in the bar") rather than for whichever place it
   happens to be on a given page.

```
open at rest (desktop)                  open while condensed (desktop)
┌────────────────────────────────┐      ┌────────────────────────────────────┐
│ ⌃ Hide                         │      │ Exit 260 │ REG 3.79  DIESEL 4.29 ⌃ │
│           REGULAR DIESEL   DEF │      ├────────────────────────────────────┤
│ Exit 260     3.79    4.29    — │      │        REGULAR   DIESEL       DEF  │
│ Truck Stop      —    4.55  3.29│      │ Minimart 3.79     4.29         —  │
├────────────────────────────────┤      │ The Cove  3.85     4.29         —  │
│ Minimart    3.79    4.29    — │      │ Truck Stop   —     4.55       3.29 │
│ The Cove     3.85    4.29    — │      └────────────────────────────────────┘
└────────────────────────────────┘
                                        the bar carries one Location, so the
one card, one header row, one hairline   Truck Stop moves into the panel

phone, shut — the same card as desktop  phone, condensed and open
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│ ⌄ View all prices                │    │ Exit 260 │ REG 3.79  DIESEL 4.29 ⌃│
│          REGULAR  DIESEL     DEF │    ├──────────────────────────────────┤
│ Exit 260    3.79    4.29       — │    │          REGULAR  DIESEL     DEF │
│ Truck Stop     —    4.55    3.29 │    │ Minimart   3.79    4.29       — │
└──────────────────────────────────┘    │ The Cove    3.85    4.29       — │
                                        │ Truck Stop     —    4.55    3.29 │
truck prices are visible on arrival     └──────────────────────────────────┘
```

Carrying one place rather than two is what makes the condensed bar narrow. The Truck Stop is
dropped from it deliberately: the guest is on a page, the page has a Location, and the line is
a reminder of where they are — not a comparison. The comparison is one click away.

**Desktop is a two-column page.** The block sits in a **reserved 400px grid column** spanning
the whole page — not the top region, which gives sticky only the hero's height to work in and
loses the condensed bar a screen later. The column is `pointer-events: none` with the block
itself re-enabled, so the full-width sections beneath stay clickable through it. (`grid-row:
1 / -1` does not do this: with no explicit `grid-template-rows`, `-1` resolves to the end of
the *explicit* grid — line 1 — and the page silently loses half its height. `1 / span 2`.)
The block does not float over content — the promo is left-aligned in the content column and its right edge lands
exactly **14px** from the block, so the two cannot collide at any width. *(Superseded for the promo region by ADR
0018's revision and its 30 Sep 2026 amendment: the region runs full width under the two-column top,
starts below the block, and the sticky block rides over it on scroll, as the approved proof draws it.)* On a phone the block is
in flow, full width, above the promo.

**Condensing must not move the page — at any width.** A block that shrinks drags whatever
depends on its height: measured, a phone promo jumped **37px** mid-scroll and a desktop one
**10px**. Desktop looked immune on Home only by luck, because the hero happened to be the taller
grid item, so the row height did not depend on the block. That is a layout shift caused by
scrolling, which counts against Core Web Vitals rather than being excused by it. The block
therefore **keeps its resting height** when it condenses — the collapsed face stays in the
layout and goes `visibility: hidden`, the cue keeps its box, and the one-line bar is drawn over
the reserved space. Measured down in three passes: 37px, 19px, 9px, then **0** — and 0 on all four frames once the
rule was applied at both widths.

Two more phone-only details, both found in a browser rather than in a spec. The one-line bar
**clipped at 375px** (357px of content in 343px of room), so the affordance reads "All" there
rather than "All prices". And the rail wrapper has to be dissolved with `display: contents`: as
a box it is only the block's own height, so `position: sticky` has nothing to stick within and
the bar scrolls away immediately.

**The band is superseded.** A thin full-width horizontal band was built as the interior page's
resting layout and has been replaced by the card above. Its cell format survives as the
condensed line — the work moved rather than being discarded.

**Condensing closes the panel; it must never prevent it.** This was got wrong once and is worth
stating as a rule. Suppressing the panel with `display: none` while condensed stopped an open
panel hanging off the bar mid-scroll — and also made "All prices" do nothing in the one state
the bar exists for. `<details>` reported `open: true` with nothing on screen, so it read as
broken rather than blocked. The correct split: the observer closes the block on entering the
condensed state, and the CSS leaves the panel openable. The panel also hangs off the **bar**,
not off the block's reserved box, or it opens level with the space the collapsed card vacated.

**Open is one card, and that is a geometry rule, not a styling preference.** The card gives up
its own floor (`border-bottom-color: transparent`, bottom corners squared) and the panel butts
straight onto it with no gap, no top border and no second radius. Two details make or break it:

- **Position the panel against the block's border box, not its padding box.** An absolutely
  positioned child resolves `left: 0` against the *padding* box, so the panel landed 1px inside
  the block and the "one card" had a 1px jog down both edges. `left: -1px; right: -1px;
  width: auto` puts the panel's border box exactly on the block's. Measured after: block, bar
  and panel all at left 425, width 400.
- **Pin the condensed bar to the card's width.** Sized by `max-content` it measured 365px
  against the panel's 400px, so opening it produced a narrow bar on a wider card — visibly two
  objects. The bar is now the card's width at both ends of the transition.

**The condense trigger** is the same at both widths — roughly half the resting card's height
scrolled past it — a sentinel occupying the card's slot, **at the card's own height**, so "less
than half of it is still visible" is literally that. That height is a consequence, not a
constant, and it has moved twice: collapsing the two grouped tables into one took the desktop
card to 122px, dropping a row label took it to 110px, and giving the phone card the Truck Stop
row took that to 102px. Each time the sentinel had to move with it or the trigger would stop
meaning what it says. Measured after the last move: the block condenses at 56px of scroll on a
110px card and 52px on a 102px card — half, to within one scroll step.

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

**Every block loads collapsed, on every page.** Home and `/fuel-prices` no longer load
expanded. That removes a whole branch: this ADR used to carry two opening mechanisms and a rule
to choose between them — *a panel already open on arrival cannot overlay* — because something
could arrive open. Nothing does. **The in-flow disclosure variant is gone; every block opens the
same way**, as an HTML popover (`popover="auto"` with a `popovertarget` button) drawn over the
page. One mechanism, one set of behaviours to test.

It also unblocks Home. Condensing needs the resting height reserved, and an expanded block was
too tall to reserve without leaving a hole; a collapsed one is not. **Home condenses like every
other page**, which is simpler than the exception it replaced.

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
- **No toggle on Home**, and later **loading expanded on Home at all** — both were in earlier
  drafts, and both are gone. The first contradicted the one-component decision in the same
  breath; the second cost a second opening mechanism and blocked Home from condensing. Every
  block collapses, and every block loads collapsed.
- **A full-bleed bar.** Rejected by the owner: at desktop widths a price strip spanning
  1200px is a banner, not a detail.
- **`<details>`/`<summary>` for every block**, which was the original zero-JavaScript plan.
  Rejected for the overlay case: native `<details>` closes only from its own control, so a
  guest who taps the page behind an open panel — or presses Escape — gets nothing. Since
  every block now loads collapsed and therefore opens as an overlay, `<details>` has no
  remaining case.
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
  the top layer, **opening** never changes the block's own box. **Condensing** does, which is
  why the resting height is reserved separately — those are two different mechanisms and only
  one of them is solved by the top layer.
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

## Revision — the desktop block sits flush under the header, and the trigger is measured under it

Reviewed against `docs/proofs/home-review.html` and corrected on the owner's call. Two
defects, one report: the block looked like a floating window a short way below the header,
and it jumped upward the moment the page moved.

**The block pins flush to the underside of the header, and never moves.** Its sticky offset
is the **header's height**, not a number chosen near it. The proof sheet pins at `72px`
under a bar of roughly `64px`, which leaves an 8px gap whenever the block is stuck — small
enough to read as a rendering fault rather than a decision. The page grid's top padding made
it worse: the block began about 30px lower still, so it dropped into place and then rose to
its sticky offset on the first scroll event. Two positions for one element, and a guest sees
the difference between them as movement.

The offset now equals the header, and the top padding belongs to the **content column**
rather than the grid, so the rail column starts flush. Measured at scroll 0, 60, 140 and
full scroll: the gap is **0px at every one**.

State the rule as a relationship, not a value. The header is 60px plus a 5px waterline
today; if either changes, the offset follows automatically and there is no second number to
remember. Anything else is two constants that have to agree, and eventually will not.

**Flush means the top corners are square** — `border-radius: 0 0 6px 6px` — so the block
reads as hanging from the header bar rather than floating over the page. Rounded corners
butted against a straight edge are what make a flush element look misaligned rather than
attached. The teal bottom border and the bottom radius stay.

**The condense trigger is measured under the header, not against the viewport.** The
sentinel is observed with the scroller as root, but the sticky header covers the top of that
scroller. The sentinel therefore stayed "visible" to the observer long after the guest had
stopped seeing it, and the block condensed later than the page implied — on a page without
much scroll range, **never at all**.

The observer takes a `rootMargin` pulling the root's top edge down to the underside of the
header, so "scrolled halfway past the block" means halfway past the part of it a guest can
see. Home now condenses by 60px of scroll against 140px of range; it previously needed most
of the page. This is the same class of error the ADRs keep catching: a rule written
correctly and then measured against the wrong frame of reference.

**The phone is unchanged.** Its placement was reviewed and accepted as it stands. The
`rootMargin` applies at both widths because it is a correctness fix rather than a layout
choice; it only makes the phone condense marginally earlier.
