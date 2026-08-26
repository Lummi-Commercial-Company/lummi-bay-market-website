# 0015 — Pages are documents in collections, never new routes

Status: Accepted

Terms (Location, Truck Stop, Amenity): `CONTEXT.md`. Depends on ADR 0002/0003 (TinaCMS,
Next.js), ADR 0008 (three-item nav), ADR 0009 (the location list is derived). Third-party
tenant pages are ADR 0016.

## Context
Every page type the site has was hard-wired by hand: Home, three Locations, Truck Stop,
Rewards, Fuel Prices, About. Nothing lets staff add a page. `docs/loose-ends.md` §5 lists
five pages that are referenced and have never been designed, and CLAUDE.md names product
info pages as "a new page type, not yet designed" — promos link to them and they do not
exist.

The owner's first requirement is that non-technical staff can update the site. A site
where every new page needs an engineer fails that requirement quietly: it looks fine at
launch and calcifies within a year.

Verified against Tina's own documentation before writing this, per the project's habit of
checking vendor claims rather than assuming them:
- A collection's `path` determines where its documents are stored; the file is
  `<path>/<match.include>.<format>`.
- The CMS shows a create button per collection. `ui.allowedActions.create: false` removes
  it; `delete` and `createNestedFolder` are the sibling switches.
- `ui.router` maps a document to its live URL and is what puts the visual-edit link on the
  collection list — the click-to-edit workflow ADR 0002/0003 was chosen for.
- A collection may declare `templates` instead of `fields`, which is Tina's supported route
  to a block-based page builder.

## Decision

**A page is a document in a collection, rendered by a dynamic route. Adding a page is a
content action, not a code change.** New *routes* are written only when a genuinely new
page *type* appears.

### The layout contract — what a page never owns
The header, the waterline, the footer, the back-to-top button and the fuel price block are
rendered by `app/layout.tsx` and are not addressable from any page document. ADR 0011
already says this of the button — *"it is one control shared by every page, so it belongs
in the layout, not in a page component"* — and the same reasoning governs the rest.

A new page therefore cannot lose the furniture, misplace it, or drift from it. The block
takes its two forms (Home's rail, the interior band) from the page's **type**, per ADR
0005/0006, not from anything an editor chooses.

### The four collections

**1. `pages` — the general page.** `content/pages/*.mdx`, route `/[slug]`.
Carries About, Rewards, Fuel Prices and anything later. Block-built from the vocabulary
below.

**Contact is one of these, and it has no form.** It renders hours, address, phone and a
short synopsis for all three Locations plus the Truck Stop. Critically, **it does not
re-author any of that**: it renders the `locationList` block, which reads
`content/locations/*` — the same source the Location cards and the footer read. ADR 0009's
rule that "the location list is derived, never authored per page" applies here or the site
grows a second set of hours to forget to update.

The synopsis is a new `summary` field on the Location schema (one or two sentences, what
the place offers), not prose typed into the contact page. Adding it there means the Location
pages and any future index can use it too.

This also gives the hours and addresses removed from the footer a proper home.

**2. `mainPages` — the swappable main page.** `content/main-pages/*.mdx`.
More than one may exist. `/` renders whichever one a `content/settings/site.json` singleton
points at, through a `reference` field. A seasonal or campaign main page is therefore built
in full, reviewed on its own URL, and switched live by changing one field — with the
previous one still sitting there to switch back to.

The pointer lives in settings rather than as a `live: true` flag on each document, because
a boolean lets two documents both claim to be live and there is no good answer for what the
site should then do. A single reference cannot be ambiguous. The settings document sets
`ui.allowedActions.create` and `delete` to `false`: it is a singleton, and the CMS should
not offer to make a second one.

**3. `infoPages` — what a promo points at.** `content/info-pages/*.mdx`, route
`/info/[slug]`. This is the page type ADR 0007 assumed and never specified. A header image,
a title, body blocks, an optional hours table and a call to action.

**4. `tenants` — third-party businesses on a Lummi Bay property.** Same block vocabulary as
`infoPages`, deliberately a separate collection. The reasons are in ADR 0016: these pages
carry a mandatory disclosure and a trademark gate that must be enforced by the template
rather than remembered by an editor, and they need their own index. A shared collection
would make both optional.

### The block vocabulary
One closed set, shared by every collection above:

| Block | What it is |
|---|---|
| `richText` | Headings, copy, links |
| `imageBanner` | A header image with required `alt` |
| `hoursTable` | Hours rows, hand-entered — for tenants, not Locations |
| `locationList` | Derived from `content/locations/*`; no free text |
| `ctaRow` | One or two buttons |
| `faq` | Question/answer pairs |

Closed on purpose. An open block set becomes a second design system inside the CMS, and
every block is a surface where the locked palette and the ADR 0014 contrast rules can be
broken by someone who is just trying to publish a notice.

## Consequences
- **A new page does not appear in the navigation.** The nav is three items (ADR 0008) and
  this does not change it. Every new page needs an entry point chosen deliberately — a
  promo, a footer link, a link from a Location page. This is the most likely surprise for
  an editor and belongs in `docs/content-updates.md`.
- Contact stops being a form. Nothing collects submissions, so there is no destination, no
  spam handling and no success/error states to build — three of the open items in
  `loose-ends.md` §5 close with it. A phone number is the contact route.
- `summary` is added to the Location schema and is unconfirmed until the client supplies it,
  alongside the addresses and hours already marked unconfirmed.
- Tina's free tier is two editor logins (ADR 0002/0013). Page creation does not change that;
  more editors is a paid tier, not a schema question.
- `ui.allowedActions.create: false` on the Locations collection. There are three Locations
  and one Truck Stop; a fourth is a business event, not a CMS action.
- Every collection needs `ui.router`, or its documents are editable in a sidebar but not
  visually — which is the whole reason this stack was chosen.
- Product info pages come off the "not yet designed" list. Promos can ship.
