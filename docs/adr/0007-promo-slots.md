# 0007 — A graphic promo region, below the page title, linking to a product info page

Status: Accepted

Terms (Location, Amenity): `CONTEXT.md`. Placement interacts with the fuel price band
(ADR 0005) and the sticky header (ADR 0006).

## Context
The three source sites carry no promotional surface. The owner wants one: predominantly
graphic promos on pages, where clicking the image opens a page with product information.

## Decision
**The promo region sits below the page's own title.** Reading order on an interior page is:
sticky header → fuel price band → page title → promo. The whole image is the link.

*This reverses the original wording of this ADR, which said "above the page's own title".* That
clause could not both be true and coexist with the next one: a full-width region **below the
two-column top** is by construction below the title, because the title lives inside that
two-column top. Measured on the built desktop pages, the title sits at 92px and the promo at
205px — the region has been below the title on desktop the whole time, and there is no
arrangement in which it is not. The ADR asserted two things that contradict each other, and
only one of them was ever buildable.

On a phone the choice was real, and the numbers settle it. With the current header (56px) and
price card (102px), a 16:9 promo above the title puts the page title at **388px — 48% down an
812px screen**, so a guest who tapped "Exit 260" is half a screen in before the page says
Exit 260. A 2.5:1 crop only reaches 332px. Below the title the title sits at **190px**, and the
promo is still the first large graphic on the page. The original Consequences section computed
this and raised it; it is now taken.

**Promos are a full-width region below the two-column top, not a slot inside it**, and the
region grows with the number of promos: a grid of `minmax(300px, 1fr)`, so one promo fills the
width, two split it, three or four wrap — no per-count layout to write. On a phone they always
stack. Being below the two-column region rather than inside it is what lets them go full width
without ever running under the price rail.

**Each promo picks a width from a fixed ladder**, on a 12-column grid: full, two-thirds, half,
third, quarter. Any mix tiles exactly. Free-typed percentages were rejected — 45% + 45% leaves
a 10% orphan, and a staff member editing the set months later has no way to know what the other
promos are set to.

A **20% promo is below the readable floor on most desktops**: measured, 20% of a 1280px viewport
is 247px of content and 279px at 1440 — narrower than a 375px phone screen, for artwork meant to
carry an offer. Only at 1920 does it reach 375px. A quarter is what 20% usually means in
practice and it holds up. On a phone the ladder is ignored and every promo is full width.

**The slot reserves its box with a fixed `aspect-ratio`** so the page does not shift when the
image loads — 5:1 on desktop, 16:9 on a phone as built. Two crops, not one image scaled: a
wide desktop banner rendered at 375px is unreadable.

**The slot is never named `ad`, `advert`, `banner`, or `sponsored`** — in class names, ids, or
image filenames. Those strings are on every ad-blocker filter list, matched on exactly those
attributes, so a first-party promo named that way is hidden from a large share of guests with
nothing in the build to show for it. The class is `.promo`.

**Clicking opens a product info page.** That page type does not exist in the locked
architecture and is not designed here; see Open.

**Promos are a constrained template, not a freeform builder.** One TinaCMS collection with
fixed fields — image (desktop crop, phone crop), alt text, eyebrow, headline, body, button
label, button link, start, end, which pages it appears on, priority — rendered by one component.

A builder that lets staff assemble graphics, text and buttons freely was considered and
rejected. It is *harder* for non-technical staff, not easier: it hands them layout decisions
they did not ask for and cannot evaluate, and the project's first requirement is that content
updates be easy for exactly those people. It also puts the locked brand system at the mercy of
whoever is filling in a promo that afternoon. A form with fixed slots produces an on-brand,
accessible, responsive promo every time; a genuinely bespoke layout is a developer change, not
a builder feature.

**Scheduling is the hard half, and it is not the scheduler.** Dates in a file are trivial.
Making them *fire* on a static site is the real work: pages are rendered at build time, so a
promo whose end date is Friday at 5pm does not vanish at Friday 5pm — nothing rebuilds. Three
mechanisms, in preference order:

1. **A scheduled rebuild** (Vercel cron) at the granularity the offers need. Reliable, exact,
   and the site stays genuinely static in between. Use this when an end time is a promise —
   "offer ends Friday" has to actually end Friday.
2. **ISR `revalidate`.** No cron to maintain, and expiry is bounded by the interval — but
   Next.js serves stale-while-revalidating, so the *first* visitor after the window closes
   still sees the expired promo. Acceptable for soft promos, not for dated offers.
3. **A client-side date check. Rejected.** The promo's markup ships to everyone regardless, it
   flashes on load, search engines index an offer that is not running, and anyone can read it
   in view-source before it starts.

Dates carry an explicit timezone — `America/Los_Angeles`. Staff typing "Friday" mean Friday
here, and a UTC-naive date silently shifts the window.

## Consequences
- **The phone title now sits at 190px**, 23% down an 812px screen, with the header at 56 and the
  price card at 102. Re-measured after the header and price card changed size (ADR 0006, 0005);
  the figures this section carried before — header 52, card 135, title at 424px — were taken
  before either. Moving real elements in the built page rather than adding heights: promo above
  the title at 16:9 gives **388px**, at a 2.5:1 crop **332px**, below the title **190px**.
  Swapping the price card and the promo changes nothing while both are above the title, which is
  what makes "below" the only lever that moves.
- **The price card must be in flow on a phone**, not absolutely positioned as the desktop rail
  is. Left absolute it covered the promo completely. The reserved-column arrangement is
  desktop-only.
- The same revalidation question governs fuel prices (ADR 0004), which are also static. Whatever
  mechanism is chosen here should cover both rather than being solved twice.
- **Rules are needed for zero and for more than one active promo.** With none, the slot must
  collapse to nothing rather than reserve an empty box. With several, `priority` decides, and
  only one renders per slot — otherwise a busy month silently stacks banners on every page.
- **The promo is almost certainly the page's largest contentful paint**, since it is the first
  large element. Every page it appears on is as fast as that image is. It needs explicit
  dimensions, a modern format, and a size budget.
- **Text baked into an image is not searchable, not selectable, not translatable, and does not
  resize** for a guest who has enlarged their type. It also cannot be changed by staff without
  a designer — against the project's first requirement, that non-technical staff can update
  content. Recommended, not decided: **image plus live text** — art as the background, the
  offer and call to action as real HTML over it. Same look, none of those four costs.
- Every promo needs alt text describing the offer, not the artwork, because the image *is* the
  link and the alt text is its accessible name.
- Promos are content, so they belong in TinaCMS as their own collection: image (both crops),
  alt text, target page, and an active window. Without an active window a staff member must
  remember to take a promo down, which is how stale offers survive.

## Open, and deliberately not decided here
- **Product info pages are a new page type.** URL scheme, whether they appear in navigation,
  whether they are a Products collection or one-off pages, and who writes them. This is IA
  work — ux-navigation-architect — and it widens the site beyond the four locked nav items.
- **First-party promo or paid third-party placement.** If any promo is sold, it needs
  disclosure, and the two cases have different legal and editorial rules. Assumed first-party
  throughout.
- **Whether Home carries a promo.** Only interior pages were asked for. Home currently renders
  one in the proof so the region can be seen in context; that is a proof convenience, not a
  decision.
- **What happens when no promo is active.** The slot must collapse to nothing rather than
  reserve an empty box, or every page carries a hole.
