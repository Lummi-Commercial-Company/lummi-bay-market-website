# Loose ends — what was noticed but never written down

Written at the end of the design session (Aug 2026) as a deliberate memory dump. The ADRs record
decisions; this records **the things that never became decisions** — gaps nobody has closed,
traps that cost time, and assumptions the whole design rests on that nobody has tested.

Ordered by how much damage each could do, not by when it came up.

---

## 1. The biggest gap: nobody has looked at what people actually use the three sites for

**The entire information architecture assumes fuel prices are the primary draw.** The price block
is on every page, the nav is three items, and several rounds of work went into how a price
condenses on scroll. That assumption has never been checked against a single piece of evidence.

Nobody has opened analytics for exit260.com, lcc-lummi.com or lummibay.com. If most traffic is
people looking for **hours**, or the **Cove Kitchen menu**, or a phone number, then the IA is
optimised for the wrong thing and we will not find out until after launch.

**This is a half-day task with a large blast radius.** Do it before Phase 3. If the three sites
have no analytics at all, that is itself the finding, and search-console impressions or even the
top queries from the sites' own search boxes would beat nothing.

## 2. Nobody has watched staff update a price today
The CMS design assumes a workflow that has not been observed. How do prices get changed *now* —
a whiteboard, a call to a manager, a POS system, someone with FTP? Who physically changes the
pump signs, and does the website need to match them or lead them?

ADR 0004's whole model (one document, a checkbox that sets all three Locations) was reasoned from
first principles and from what the owner asked for. It has never been shown to the person who
will use it. **Phase 2 step 11 tests whether they can work the tool we built; it does not test
whether we built the right tool.** Half an hour of watching beats both.

## 3. Colour contrast has never been measured
Tap targets and layout were measured to the pixel. **Contrast was not measured at all.** The
brand palette is locked, which makes this more urgent rather than less — if something fails, the
fix has to be a usage rule, since the tokens cannot move.

Specifically unchecked:
- `--lb-cedar` (#C9772E) on white and on `--lb-bone` — used for eyebrows and small labels, which
  is the worst case because it is small text.
- Body copy set at `opacity: .7`–`.75` over `--lb-ground`. **Opacity silently lowers effective
  contrast** and none of those computed values were checked against WCAG AA (4.5:1 for body,
  3:1 for large text).
- `--lb-navy` on `--lb-ground` — probably fine, never confirmed.

Run it before the components are written, not after.

---

## 4. Things that will bite whoever writes the components
Traps found the hard way in this session. Each one cost real time and none is obvious from the
outside. Most are recorded in `docs/proofs/fuel-strip-proof.html`; they are gathered here because
that file is easy to miss.

| Trap | What happens |
|---|---|
| `grid-row: 1 / -1` with no explicit `grid-template-rows` | `-1` resolves to the end of the *explicit* grid — line 1 — so it silently collapses to row 1 and the page loses half its height. No error. Use `1 / span 2`. |
| **Container queries add no specificity** | `@container { .loccard p {…} }` loses to `.phone .loccard p` outside it. The CSS is valid, applies nothing, and reports no error. Match the full selector. |
| Absolutely-positioned child, `left: 0` | Resolves against the **padding** box, not the border box — a panel sits 1px inside its parent and the edges jog. `left:-1px; right:-1px; width:auto`. |
| `display: none` on *some* cells of a grid row | Auto-placement shifts every subsequent cell. Hide **all** of a row's cells or none — including the blank leading header cell. |
| Flex `gap` with bare text runs | Each bare run is an anonymous flex item, so `<span>★ <b>A</b> B</span>` gets a gap *between the words*. Wrap the label in one element. |
| `scrollWidth === clientWidth` when text **wraps** | Wrapping is not overflow. A "does it fit" check built on this reports success while the element silently becomes two lines. Measure with a Range over the text instead. |
| `align-content` on a page grid | Surplus height from a `min-height` is distributed *between* rows, opening holes mid-page. `align-content: start`. |
| `elementFromPoint` | Viewport coordinates. Scroll the target into view first or every probe returns null. |
| CSS masks with no `@supports` guard | Unsupported masks render as **solid coloured blocks**, which is far worse than no decoration. (ADR 0012) |
| `aria-label` on an element with real text | **Overrides** the text. A promo with a headline announced its placeholder label instead. (ADR 0012) |
| `output: 'export'` | Kills ISR *and* on-demand revalidation — silently removes every promo-scheduling mechanism except the rejected one. (ADR 0007) |

## 5. Pages that are referenced but have never been designed
Named in the locked architecture or in ADRs, and not thought about since:
- **`/rewards`** — the app-promo page. A pill links to it from every page.
- **`/about`** — brand story, the Lummi values, the community note.
- **`/fuel-prices`** — exists, reached from the footer; register C6 recommends it *be* the block
  expanded, but that was never confirmed.
- **Product info pages** — promos link to them, the page type does not exist, and it sits outside
  the locked three-item nav. Needed before promos ship, not before the site does.
- **The contact form** — no destination, no spam handling, no success/error states.

## 6. Decisions I made that look like decisions but were placeholder
These read as finished and are not. Someone will ship them by accident.
- **All body copy**, including "Three stops on the bay" and "Fuel, food and a full truck stop —
  open where you need us, on Lummi land." I wrote those to fill a layout.
- **The promo sample copy** — "Fresh coffee, all day", "Join in 60 seconds", "The Cove Kitchen".
  Deliberately carries no numbers, so at least no fake offer can be screenshotted.
- **The footer's four groups** — About / Visit / Rewards / Work with us. I invented that grouping;
  the locked architecture names the *links*, not the columns.
- **"Our other locations"** as the heading when a page drops its own card. My wording.

## 7. Operational things nobody has raised
- **What happens to the three old sites after launch?** Parked, redirected wholesale, or shut
  down? Who keeps paying for them? ADR 0001 covers the *content* boundary with lcc-lummi.com but
  not its hosting future.
- **SSL certificates on the old domains** — who renews them, and does anything break at cutover.
- **Email / newsletter.** Never mentioned by anyone. If the business expects a signup, it is not
  in the architecture.
- **Truck Stop amenities** — showers and the driver lounge may have prices or hours of their own.
  The content model has no place for them.
- **Price history.** Git records every change, but nothing surfaces "what was diesel last Tuesday"
  and nobody has asked whether that matters.
- **Register C9 changed shape** and the ADR does not say so. If prices render per-request (the
  dynamic-slot option in ADR 0004), the `updated` stamp question is different from the one C9 asks.

## 8. Two things about how this session went, worth carrying forward
**Every free tier had a catch, four times out of four.** Vercel cron is daily-only on Hobby;
Editorial Workflow is Team Plus, not Team; assets cap at 100 MB; and Hobby forbids commercial use
outright. The habit that caught these was checking vendor documentation before answering rather
than after. Keep it — the pattern is unlikely to have stopped.

**Measurement overturned argument repeatedly, and the argument was usually mine.** Three-across
location cards, the Back-to-top threshold, the promo's position, the two-column footer — in each
case the reasoning was plausible and the browser disagreed. Build the rejected option for ten
minutes instead of debating it. The measurement harness in `docs/proofs/scripts/` is there so the
next person can do the same.

A related caution: the errors that reached the owner were nearly all the **same shape** — a rule
written correctly, then applied to a subset instead of universally. DEF shown for a place that
does not sell it; the panel's "carries what is off screen" rule applied to Locations but not the
Truck Stop; "refresh the price pages" when prices are on every page. When a rule is written, check
every place it should apply, not the place that prompted it.
