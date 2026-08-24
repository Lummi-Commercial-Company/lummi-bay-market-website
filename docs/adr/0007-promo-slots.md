# 0007 — A graphic promo above the page title, linking to a product info page

Status: Accepted

Terms (Location, Amenity): `CONTEXT.md`. Placement interacts with the fuel price band
(ADR 0005) and the sticky header (ADR 0006).

## Context
The three source sites carry no promotional surface. The owner wants one: predominantly
graphic promos on pages, where clicking the image opens a page with product information.

## Decision
**A promo slot sits above the page's own title.** Reading order on an interior page is:
sticky header → fuel price band → promo → page title. The whole image is the link.

**The slot reserves its box with a fixed `aspect-ratio`** so the page does not shift when the
image loads — 5:1 on desktop, 16:9 on a phone as built. Two crops, not one image scaled: a
wide desktop banner rendered at 375px is unreadable.

**The slot is never named `ad`, `advert`, `banner`, or `sponsored`** — in class names, ids, or
image filenames. Those strings are on every ad-blocker filter list, matched on exactly those
attributes, so a first-party promo named that way is hidden from a large share of guests with
nothing in the build to show for it. The class is `.promo`.

**Clicking opens a product info page.** That page type does not exist in the locked
architecture and is not designed here; see Open.

## Consequences
- **On a phone the promo pushes the page title to 350px** — header 52 + band 72 + promo 197.
  That is 43% down a 375x812 screen, so a guest landing on a Location page cannot see which
  Location without scrolling. Measured. A 2.5:1 phone crop would cost ~140px and land the title
  around 265px. Built at 16:9 as the prominent reading of "predominantly graphic"; the trade is
  worth choosing deliberately rather than inheriting.
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
- **Whether Home carries a promo, and whether more than one appears per page.** Only the
  above-the-title slot on interior pages was asked for.
- **What happens when no promo is active.** The slot must collapse to nothing rather than
  reserve an empty box, or every page carries a hole.
