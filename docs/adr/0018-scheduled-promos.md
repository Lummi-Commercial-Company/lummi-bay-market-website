# 0018 — Promos are scheduled documents; pages compose them

Status: Accepted. Supersedes the promo-region parts of ADR 0007 and demotes `mainPages`
from ADR 0015.

Terms (Location, Truck Stop): `CONTEXT.md`. Depends on the site never being
`output: 'export'` (ADR 0007, ADR 0017).

## Context
Four asks, and the first one is a good question rather than a request:

1. Is a main-page swap needed at all, if promo slots can be scheduled to the minute?
2. Promo slots should be addable and removable on **any** page, not three fixed ones on Home.
3. When a promo expires, the info page it points at should leave the site too.
4. An expired promo should be reactivatable, from somewhere that lists the old ones.

## Decision

### 1. The main-page swap is demoted, not deleted

**It is not needed for campaigns, and it will not be scheduled.**

A main-page swap and a scheduled promo overlap almost completely. What the swap could do that
a promo cannot is change the **hero** — so the hero gets the same treatment as a promo, and the
overlap becomes total:

**`heroVariants`** — a list on the home document, each with a headline, a sub, and a date
window. The one whose window contains "now" wins; the last entry has no window and is the
fallback, so there is always a hero. Same engine as promos, no second mechanism.

With that, `mainPages` has one job left: **a genuine redesign**, a different layout rather than
different words. That is a build activity, it happens rarely, and it does not want a scheduler.
So the settings pointer from ADR 0015 stays — it is a few lines and it is the escape hatch —
and nothing schedules it.

This removes the preview-URL question ADR 0015 left open, and it removes the awkward fact that
a whole-page swap needed a rebuild while everything around it was exact to the minute.

### 2. `promos` is a collection, and placement is a field

`content/promos/*.md`, one document per promo:

| Field | Purpose |
|---|---|
| `title`, `eyebrow`, `image` + alt | What it says |
| `link` | A reference to an `infoPages` document |
| `startsAt`, `endsAt` | The window. Both optional — no `startsAt` means "already running", no `endsAt` means "until turned off" |
| `active` | A manual kill switch. **False beats any date**; true never overrides a date |
| `placement` | Which pages it appears on: `home`, `all-interior`, or references to specific pages |
| `width` | From the ladder — full, two-thirds, half, third, quarter |
| `priority` | Ties broken by soonest `endsAt`, then by title |

**A page renders whatever is live for it.** No fixed count, no fixed slots, nothing reserved.
Adding a promo is creating a document; removing one is setting `active: false` or letting
`endsAt` pass.

**Live means:** `active` is true, AND `startsAt` is absent or past, AND `endsAt` is absent or
future — evaluated per visitor at request time, in `America/Los_Angeles`. That is ADR 0007's
dynamic slot, unchanged: nothing is scheduled, so nothing can fail to fire.

**A display cap of four per page**, ordered by `priority`. Past that the region stops rendering
and the CMS says so. Not a data limit — a page with eleven promos on it is not a page anyone
reads, and an unbounded region is a design failure that arrives silently on a busy week.

**Zero live promos renders nothing.** No region, no gap, no empty grid — the same rule the
tenants index follows.

### 3. Expiry hides the info page; it does not delete it

The ask is right and the literal implementation is a trap. If the info page is *removed* at
expiry, every link to it breaks: a Facebook post, a printed QR code, a bookmark, a search
result. The guest gets a 404, which reads as a broken site rather than a finished offer. And
requirement 4 needs the page back if the promo is reactivated, so it cannot be gone.

**When its promo is not live, an info page:**
- **stops being linked** — nothing on the site points at it,
- **leaves the sitemap** and is served `noindex`, so search drops it,
- **keeps its URL**, and serves an unambiguous ended state: *"This offer has ended."* plus a
  link to what is running now.

That satisfies "removed from the website" in every sense that matters — undiscoverable,
unindexed, not advertised — without turning shared links into errors. It is also reversible in
one field, which requirement 4 needs.

An info page can still be deleted outright when it is genuinely finished. That is a separate,
deliberate act, not something expiry does behind your back.

### 4. The list of old promos already exists

**It is the TinaCMS promos collection.** Tina lists every document in a collection with create,
edit and delete. Building a second admin screen would mean a second thing to secure, a second
login, and a second place for the truth to live.

What it gains is a **`state` shown on each promo, derived and never stored**:

| State | Means |
|---|---|
| **Live** | Showing now |
| **Scheduled** | `startsAt` is in the future |
| **Ended** | `endsAt` has passed |
| **Off** | `active` is false, whatever the dates say |

Derived, because a stored status drifts from the dates the moment one of them changes, and then
two fields disagree about the same fact.

- **Reactivate** — clear or extend `endsAt`, set `active` true. The promo returns and its info
  page comes back with it.
- **Deactivate** — `active: false`. Immediate, no date maths, the obvious panic button.
- **Delete permanently** — Tina's delete. And because the CMS is git-backed (ADR 0002),
  **deleted is not gone**: the document is in the history and recoverable. Worth telling staff,
  because it makes delete a safe button rather than a frightening one.

## Consequences
- ADR 0007's fixed three-promo Home region is superseded. The 12-column ladder survives as the
  width vocabulary; what changes is that the set is composed at request time rather than
  authored into the page.
- The promo region and the hero are now the only dynamic parts of an otherwise static page.
  Both sit behind their own boundary so the shell still serves from the CDN.
- **A promo pointing at a deleted info page must not render.** The link is a reference; if the
  target is missing the promo is skipped rather than shipping a dead card. Cheap to enforce,
  and it will happen eventually.
- Two editor logins on the free tier (ADR 0002/0013) still applies. Scheduling reduces how often
  someone has to be at a keyboard, which is the point.
- `output: 'export'` remains forbidden — it takes this with it, along with the emergency notice.
- Timezone is `America/Los_Angeles`, stored explicitly. Staff typing "Friday 5pm" mean Friday
  5pm here, and a server in another region must not decide otherwise.

## Revision — the region is rows, and the row owns the layout

The model above gave each promo a width and let the region tile them. Replaced, on the owner's
ask, with something both simpler to operate and structurally sounder.

**The promo region on a page is a list of rows. Each row chooses how many promos it holds.**
One across, two, three, four — and rows are added as needed. Staff build a shape rather than
setting a width on each promo and hoping the set tiles.

| Row layout | Spans |
|---|---|
| 1 across — full width | 12 |
| 2 across — halves | 6 + 6 |
| 3 across — thirds | 4 + 4 + 4 |
| 4 across — quarters | 3 + 3 + 3 + 3 |
| 2 across — wide + narrow | 8 + 4 |
| 2 across — narrow + wide | 4 + 8 |
| 3 across — lead + two | 6 + 3 + 3 |

**A row's layout is a capacity, and it re-divides when a promo expires.** A three-across row
holding two live promos becomes two halves; holding one, it becomes full width. This is the
part that matters: **12 divides evenly by 1, 2, 3, 4 and 6**, so a row that loses a promo
always re-divides into equal columns. A hole cannot appear.

That deletes the "last row fills" rule from the addendum below, which existed only because
widths lived on promos and a composed set would not always sum to twelve. Move the layout onto
the row and the problem stops existing rather than being patched.

**Five across is not offered.** Twelve does not divide by five, so a five-up row could not
re-divide when one expired. The constraint is arithmetic, not taste — and at Home's width, five
promos across are too small to read anyway.

**Rows are capped at six per page**, and a row with nothing live does not render. Promos beyond
the available slots wait for one: they stay live in the data and appear as earlier ones expire,
in `priority` order. That replaces the flat display cap of four — capacity is now something
staff can see and set, rather than a number in the code.

**On a phone every row is one column**, whatever its desktop layout. Unchanged.

**The region is full page width.** It belongs to the full-width area below the two-column top
region, not inside the content column. Only the top region is two columns — the page title
beside the price rail — and everything under it, promos included, spans the page. Putting the
region in the content column leaves a dead block of ground to the right of every promo row,
under the rail, on every page that has one. Home already did this correctly; the tenant, contact
and promo templates did not, and were corrected. Verified by measurement rather than by eye: a
promo row's right edge and the price rail's right edge are the same pixel.

**This has now been got wrong four times** — the promo region on three templates, then the
whole tenants index, then the Location blocks on `/contact`. The cause is the same every time:
`.maincol` is the obvious place to put content and it is the narrow column. State the rule as a
check rather than a principle. **When adding a block to any page template, measure its right
edge against the price rail's. If they differ, it is in the wrong container.** Only the page
title and its lede belong in `.maincol`; everything below goes in `.homerest`.

## Addendum — where the region sits, and how a short set tiles

The promo region is now on the tenant and contact templates too. Two things settled while
placing it.

**Position is a template decision, not a promo one.** CLAUDE.md says the region goes "below the
page title on interior pages". That is right for a page about us and wrong for both of these:

- On a **tenant page** the title is another company's name. A promo directly beneath it reads as
  *their* offer — which is the same confusion ADR 0016's disclosure exists to prevent, arriving
  by layout instead of by wording. The region goes **below the disclosure**, separated by a
  waterline band, above the "Also at Exit 260" index.
- On **contact** the guest came for a phone number. Anything above the Location blocks delays
  the one thing the page is for. The region goes **after them**, before the no-form note.

`placement` decides *which* pages a promo appears on; each page type decides *where*. Those are
different questions and conflating them would put a promo in a bad spot on some page eventually.

**The last row fills.** *(Superseded by the revision above — rows now own the layout and
re-divide on expiry, so there is no orphan gap to close.)* Widths came from the ladder, but a
live set is composed at request time and would not always sum to twelve. The rule made the final
promo stretch to close the row. It worked, and it was a patch over the real problem: the width
was on the wrong object.
