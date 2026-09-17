# Loose ends — what was noticed but never written down

Written at the end of the design session (Aug 2026) as a deliberate memory dump. The ADRs record
decisions; this records **the things that never became decisions** — gaps nobody has closed,
traps that cost time, and assumptions the whole design rests on that nobody has tested.

Ordered by how much damage each could do, not by when it came up.

---

## 1. The biggest gap: nobody has looked at what people actually use the three sites for

> **Downgraded 17 Sep 2026 — answered by the client, not by evidence.** Asked directly which of
> the three could change work already done, the client's first answer was flat: **"Fuel prices are
> the draw."** That is the person who runs the business, and it is the best answer available
> without opening an analytics account, so the three-item nav (ADR 0008) and the price block on
> every page stand as designed.
>
> **It is not the same as measurement, and the difference is worth keeping in view.** What the
> client answered is *why people come*. What analytics would have shown is *what they could not
> find* — the searches for a phone number, the Cove Kitchen menu, whether the showers are open to
> non-drivers. Those do not contradict "fuel prices are the draw"; they sit underneath it, and
> they are what would tell us whether anything on this site is hard to reach. So this is no longer
> a risk to the IA. It is an ordinary pre-launch task with a much smaller blast radius, and the
> half-day is still worth spending if the analytics exist at all.

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

> **Half-closed 17 Sep 2026.** The client described the process: *"Price changes today are
> immediate and manual. 3-4 people have to get together and say 'change prices....now' and then do
> their related tasks to change the price as close to the same time as possible."* That answers
> the *shape* of it, and what follows for the **website** is now written into the
> `fuel-price-update` skill: the form has to work one-handed on a phone at the counter, the site's
> own latency is effectively zero because Save is the last action (ADR 0024), and the `updated`
> stamp is where a missed change shows. **What that skill no longer does is tell them the order to
> do their tasks in** — an earlier draft said the website should go last, and the client's
> correction on 17 Sep 2026 was right: that is how the business operates, not a website concern.
>
> **Still open, and still half an hour:** nobody has watched it. Which screen the new price comes
> off, who calls the number out, and whether the person who would edit the site is even in the
> room are all things a description does not settle.

The CMS design assumes a workflow that has not been observed. How do prices get changed *now* —
a whiteboard, a call to a manager, a POS system, someone with FTP? Who physically changes the
pump signs, and at what point in that does somebody reach for the site?

ADR 0004's whole model (one document, a checkbox that sets all three Locations) was reasoned from
first principles and from what the owner asked for. It has never been shown to the person who
will use it. **Phase 2 step 11 tests whether they can work the tool we built; it does not test
whether we built the right tool.** Half an hour of watching beats both.

## 3. Colour contrast has never been measured

> **Closed — measured, and recorded as ADR 0014.** The opacity worry below was unfounded
> (`.70`/`.75` body copy passes at 5.38/6.36). Cedar failed as predicted, and the audit also
> caught the header's Rewards pill failing twice over on every page. Re-run the proof with
> `node docs/proofs/scripts/contrast.mjs`.
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
| `output: 'export'` | Kills ISR *and* on-demand revalidation — silently removes every promo-scheduling mechanism except the rejected one (ADR 0007), **and the emergency notice with it** (ADR 0017). It fails silently: the notice would simply never reach anyone. |

## 5. Pages that are referenced but have never been designed

> **Mostly closed by ADR 0015.** Page types are TinaCMS collections now, so `/rewards`,
> `/about`, `/fuel-prices` and product info pages all have a shape. The contact form is
> **dropped** — `/contact` carries hours, addresses, phone and a per-Location synopsis, and
> nothing on the site collects submissions, so its destination, spam handling and states are
> moot. ADR 0016 adds third-party tenant pages.
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
