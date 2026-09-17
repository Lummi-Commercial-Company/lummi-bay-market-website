---
name: fuel-price-update
description: The safe, exact procedure for changing fuel prices at any of the three Lummi Bay Market Locations or the Truck Stop — for non-technical staff via TinaCMS, or for Claude via the data file. Also the rules for how prices are displayed. Load whenever fuel prices need editing or the fuel-price data model is involved.
---

# Fuel Price Update

Storage and rationale: **ADR 0004**. Display and interaction: **ADR 0005**.
Terms (Fuel Price, Fuel Grade, DEF, Truck Stop): `CONTEXT.md`.

## Source of prices (launch = MANUAL entry)
Single source: `content/fuel-prices.json`, a TinaCMS collection with `ui.global: true` so it
appears under "Site" in the sidebar and opens straight to the form. Nothing else stores
prices — the whole site reads from here.

**Eight prices.** Regular + diesel at each of the three Locations; diesel + DEF at the
Truck Stop. Midgrade, premium and ethanol-free are NOT priced on this site.

```json
{
  "linkLocations": true,
  "locations": {
    "exit-260":        { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" },
    "minimart":       { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" },
    "fishermans-cove": { "regular": 3.79, "diesel": 4.29, "updated": "2026-08-21" }
  },
  "truckStop":         { "diesel": 4.55, "def": 3.29, "updated": "2026-08-21" }
}
```

Rules that hold no matter who is editing:
- **One price per place per grade. There is no "all locations" price field.** `linkLocations`
  records the checkbox position for the editor's convenience. It must never decide which
  price the site reads — see ADR 0004 for why.
- **The Truck Stop is never touched by the checkbox.** Truck-lane diesel is not car-lane diesel.
- The grades a place sells are the entries present in its price list. Don't declare grades twice.

## How a price change actually happens (client, 17 Sep 2026)
Described by the client when asked how prices get changed today:

> *"Price changes today are immediate and manual. 3-4 people have to get together and say
> 'change prices....now' and then do their related tasks to change the price as close to the same
> time as possible."*

Four things follow from that, and they are the reason this section exists rather than the
procedure below being the whole story.

**1. The website is one of the tasks in that huddle, and it has to be named as one.** Nobody is
going to remember an unassigned step. Whoever owns it needs a CMS login (checklist A7) and needs
it on whatever they are holding at that moment — which is a phone, standing at the counter, not a
desk. **The fuel price form must be usable one-handed on a phone**, and that is a design
constraint on the form, not a nice-to-have. It is also what Phase 2 training should rehearse:
the price change, on a phone, timed.

**2. The website goes last, after the pump signs.** If the site leads, a guest two miles out reads
a price their phone says is live and arrives at a pump that has not changed yet — and the argument
happens at the counter. If the site follows, the worst case is that it is thirty seconds stale and
nobody can tell. **The asymmetry is the whole reason for the rule:** being early is a complaint,
being late is invisible.

**3. This is what ADR 0024 was for.** A build-and-deploy wait would have put the site visibly out
of step with the pumps during the exact window in which four people are watching. Because the
price block renders per request against the content API, Save is the last step and it is done —
there is nothing to wait out and nothing to explain to the person holding the phone.

**4. The failure mode is one person not doing their task, and the site is where it shows.** Four
simultaneous manual changes have no confirmation step. The `updated` stamp is the only visible
check there is, which is why a hand-edit must set it (see below). **Add thirty seconds to the
huddle: one person loads the public site and reads the numbers back aloud.** That catches both the
missed save and the fat-fingered digit, and it is cheaper than the phone call that finds them.

The "apply one price to all three locations" checkbox exists for exactly this huddle — one number
typed once when all three move together, which is what "change prices now" implies. It remains a
convenience for the editor and never decides which price the site reads (ADR 0004).

**Still not done:** nobody has *watched* this happen (`loose-ends.md` §2). Knowing the shape of
the process is not the same as seeing which screen the price comes off and who reads it out. Half
an hour of watching, before Phase 2 training, still beats any amount of reasoning about it.

## For non-technical staff (TinaCMS)
1. Go to `/admin` and log in by email (no GitHub account needed).
2. In the sidebar under **Site**, open **Fuel Prices**. The form opens directly.
3. **"Apply one price to all three locations"**
   - **Checked** — type regular and diesel once; all three Locations get it on save.
   - **Unchecked** — the three Locations show separately; edit whichever you need.
4. **Truck Stop** is always its own section, always typed by hand. Diesel and DEF.
5. Dollars, two decimals (e.g. 4.05). The "updated" date sets itself for the places you changed.
6. Save/Publish. **The new price is live immediately** — refresh the site and it is there. There
   is no rebuild to wait for: the price block renders per request and reads the content API, so
   nothing about a price was ever baked into the page (ADR 0024, settling the client's "once a
   price is pushed it must go live immediately"). If the site still shows the old number after a
   hard refresh, that is a bug to report, not a delay to wait out.

## For Claude / developers
- Edit `content/fuel-prices.json` only. Never hard-code a price in a page.
- Validate: numbers only, two decimals, >= 0. Never remove a grade a place sells.
- A direct file edit bypasses any editor hook, so **set `updated` by hand** for every place
  you changed. The stamp is **stored on save**, not derived from the commit — settled by ADR 0024,
  because a derived stamp would need git history read at request time. It also carries more weight
  than it used to: with publish latency at zero it is the only thing telling a guest how fresh the
  number is, so a wrong stamp is now the only staleness a guest can see.
- **The block reads the TinaCloud content API at request time, never the built
  `content/fuel-prices.json`.** Rendering the built file per request is exactly as stale as a
  static page and costs server work for nothing — it is the one way to ship this looking finished
  and have it not work. The built value is the **fallback** when the API is slow or unreachable;
  a guest never sees a blank where a price goes (ADR 0024).
- `output: 'export'` is prohibited. It would silently delete this and the emergency notice
  (ADR 0017) rather than fail the build.
- Changing all three Locations means writing three values. There is no shortcut field.

## How prices are displayed
One component everywhere. Full contract and the reasoning: **ADR 0005**.

**Every block loads collapsed, on every page** — Home and `/fuel-prices` included. Nothing
arrives open, so there is one opening mechanism (a popover over the page) and one condensing
behaviour. Do not reintroduce a "loads expanded" variant; it cost a second mechanism and
blocked Home from condensing.

**One shape at rest, everywhere.** A **card, never wider than 400px**, in a right-hand rail
flush to the right edge — the page's own Location and the Truck Stop, with grade column
headers. There is no per-page variant.

**Rewards is never beside the prices.** It is a global "Get the App" pill in the header
(ADR 0006), on every page. The rail is the price card alone. Do not reintroduce a Rewards
element into it — the club card image and the compact cedar control were both tried there and
both superseded.

**A promo sits between the block and the page title** on interior pages (ADR 0007). It is not
part of this component, but on a phone the two stack: header 52 + card 135 + promo 197 puts the
page title at 424px. Do not add a fourth thing above the title without measuring what it costs.

**The header is sticky** (ADR 0006). Never give the price card `position: sticky` **while its
panel is anchored to it** — tested: after ~300px of scroll the open panel is painted correctly
but clicks fall through to the collapsed card behind it, which then light-dismisses it. That is
the rule on phones, where the rail scrolls away.

**Condensing closes the panel; it must never prevent it.** Do not put `display: none` on the
panel in the condensed state — that kills "All prices" in the one state the bar exists for, and
`<details>` will still report `open: true`, so it reads as broken rather than blocked. Close the
block in the observer instead, and hang the panel off the **bar**, not the block's reserved box.

**On desktop the block pins flush to the underside of the header** — sticky offset equals the
header's height, never a fixed number near it, and the page's top padding goes on the content
column so the rail starts flush too. Top corners square (`0 0 6px 6px`) so it hangs off the bar
instead of floating. A gap here reads as a rendering fault; see the revision on ADR 0005.

**Every page condenses on scroll**, at both widths. Once the page has scrolled roughly halfway past the resting
card it becomes a single line carrying **the page's own Location alone** — narrower as well as
shorter, 360x39 from 400x151 — pinned under the header and still expandable to all four.

```
Exit 260 │ REG 3.79   DIESEL 4.29        ⌄ All prices
```

**The resting card is the same at both widths**: the page's own Location *and* the Truck Stop.
No phone-only variant — truck prices are the reason a whole class of guests is on the site, and
a phone is what they are holding.

| | Resting | Condensed | Expanded adds |
| --- | --- | --- | --- |
| Desktop | Location + Truck Stop, 400x110 | Location only, 400x39 | Minimart, The Cove |
| Phone | Location + Truck Stop, 345x102 | Location only, one line | Minimart, The Cove |
| Either, once condensed | — | — | those two **and the Truck Stop** |

**The panel adds only what is not already on screen.** Never list a place twice — that is one
rule, not a case per state. Apply it to the Truck Stop as well: the condensed bar carries one
Location, so on desktop the Truck Stop moves *into* the panel the moment the block condenses.
Missing that is what dropped truck prices out of the desktop condensed view entirely.

**The panel has no caption.** It is a continuation of the card's table, not a table of its own,
so it repeats neither a heading nor the column headers — a hairline separates the rows already
on the page from the rest. It supplies a header row only in the condensed state, where the card
is not on screen to carry one.

**Condensing must move the page by zero pixels, at every width.** The block keeps its resting
height: the collapsed face and the cue stay in the layout as `visibility: hidden` and the
one-line bar draws over the space they reserve. Assert it; do not eyeball it. Measured without
it: a phone promo moved 37px mid-scroll, a desktop one 10px. Desktop looked immune on Home only
because the hero happened to be the taller grid item.

**The desktop rail column spans the whole page**, not the top region — given only the hero's
height, `position: sticky` loses the condensed bar a screen later. It is `pointer-events: none`
with the block re-enabled, so full-width sections stay clickable through it. Use
`grid-row: 1 / span 2`, never `1 / -1`: with no explicit `grid-template-rows`, `-1` resolves to
line 1 and the page silently loses half its height.

The condensed bar is sticky and safe *because* its panel is viewport-positioned. Do not make one
sticky without the other. The trigger is ~10 lines of `IntersectionObserver` on a sentinel in
the card's slot, at the card's height — the CSS-only route does not work with a sticky subject
(ADR 0005 records the measurements).

**On a phone the card is in flow**, never absolutely positioned — absolute, it covered the promo
below it completely. The reserved right-hand column is desktop-only.

```
Exit 260 │ REG 3.79   DIESEL 4.29                              ⌃ All prices
```

| | Resting card | Condensed bar |
| --- | --- | --- |
| Width | 400px | **400px — the same.** `max-content` gave 365px, and a narrow bar on a 400px panel reads as two objects, not one card |
| Panel | butts onto the card | butts onto the bar |
| Panel position | against the block's **border box** (`left:-1px; right:-1px`), never `left:0` | same |

The condensed bar is sticky and safe *because* its panel is viewport-positioned. Do not make
one sticky without the other. The trigger is ~10 lines of `IntersectionObserver` on a sentinel
in the block's slot, the block's own height — the CSS-only route does not work with a sticky
subject (ADR 0005 records the measurements).

**ONE TABLE. One header row. A column per grade.** Never two grouped tables with their own
headers — that is what this replaced, and it read as two unrelated cards of numbers. A place
that does not sell a grade gets an em-dash.

The column set is derived: **the table shows the union of the grades sold by the rows currently
on screen** — visible, not present. DEF is a Truck Stop grade, so the DEF column exists wherever
the Truck Stop is a row: the resting card at both widths, and the panel once the block condenses
and the Truck Stop moves into it. Never print a grade column that no visible row sells.

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

phone, shut — the same card as desktop
┌──────────────────────────────────┐
│ ⌄ View all prices                │
│          REGULAR  DIESEL     DEF │
│ Exit 260    3.79    4.29       — │
│ Truck Stop     —    4.55    3.29 │
└──────────────────────────────────┘
```

On `/truck-stop` the Truck Stop row leads, so diesel and DEF are the first numbers a driver
hits. It is also what the condensed bar carries there — **"the page's own" means the page's
subject, not always a Location** — so on that page **Exit 260** is the row that moves into the
panel on condense. Mark that row `oncond` ("in the card, not in the bar"), never with the name
of a place: the place changes per page, the rule does not.

**When a row is hidden, hide its price cells with it.** The phone panel once carried `oncond` on
the Truck Stop's *label* only; at rest the label vanished and three orphan price cells stayed in
the grid, shifting every row after them. One class per cell, or the row is not a row.

- **Hide a column by hiding one cell per row**, header included, so grid auto-placement stays
  intact.
- **Hide the header row as a whole or not at all.** The leading blank cell is part of it; hiding
  the three labels but not the blank pushes every price one column right. Give the blank the
  same class as the labels.
- Always all four places. No "only show them if they differ" — a conditional layout has no answer
  for partly-different prices and changes shape day to day.
- Keep the column headers in **both** states. They are what makes a Location priced a few cents
  apart visible at a glance; dropping them collapsed would make the two states two layouts.
- Prices use `--lb-navy-deep`, labels `--lb-navy` (skill `brand-system`).
- Place labels get `text-overflow: ellipsis`, never wrapping. A wrapped "Fisherman's Cove"
  breaks row alignment and the columns with it.

**Every block collapses and expands.** There is no "always expanded" variant.

**Opening — one mechanism.** Because every block loads collapsed, nothing is ever drawn open on
arrival, and the rule that used to force a second mechanism — *a panel already open on arrival
cannot overlay* — no longer has a case to apply to.

| the block… | opens as | why |
|---|---|---|
| loads collapsed (**every page**, Home and `/fuel-prices` included) | HTML **popover** (`popover="auto"`), anchored over the block | overlays the page; outside-click and Escape dismiss it with **zero JavaScript** |

The popover covers the block rather than opening below it, so the two collapsed rows are not
repeated inside the panel. It lives in the browser's top layer, so the block's own box never
changes and there is no collapsed height to reserve.

**Stacking order** (ADR 0005, deliberately not in the locked `brand-system`):
waterline `1` · block `40` · panel `50` · header and nav `60`. Nav outranks the panel — one is
navigation, the other is information.

**Accessibility** — wrap the block in `<aside aria-label="Fuel prices">` so it is one skippable
landmark, and keep the control a real `<button>`. It sits above the page's own heading on every
page; a screen-reader user meets it on every navigation.

**Known cost of the rail on phones**, accepted with eyes open: control 45px + gap 10px + price
block 135px = **191px** before any page content, on every page. The sticky header holds a
further ~47px permanently.

## Safety checks (test before done — do not assert)
- JSON parses (no trailing comma).
- All four places present; every grade shown on a page exists in the data.
- Prices render **collapsed on every page** — a Location page, `/truck-stop`, a non-Location
  page and Home alike. Nothing arrives open. `/truck-stop` shows the Truck Stop first.
- The popover dismisses on outside-click **and** on Escape. Check in Safari and Firefox, not
  only Chromium — CSS anchor positioning is the project's one dependency on a newer feature,
  and the corner placement is what requires it (ADR 0005).
- Opening the popover moves page content by **zero pixels**. Assert it, do not eyeball it.
- At 200% text the expanded panel still fits the screen, or scrolls inside itself.
- With the checkbox checked, saving writes all three Locations — and leaves the Truck Stop alone.
- The strip reads on a 375px-wide screen without horizontal scroll.
