# 0004 — Fuel prices live in one document, and "all locations" is an action, not stored state

Status: Accepted

How these prices are *shown* is ADR 0005. This ADR covers storage only.

## Context
Four places post fuel prices: the three Locations and the Truck Stop (see `CONTEXT.md`).
Eight prices in total — regular and diesel at each Location, diesel and DEF at the Truck
Stop. Midgrade, premium and ethanol-free are not priced on this site.

An architecture review proposed folding prices into each Location document, so that one
document would own everything about a Location and a price would be click-editable on the
page it appears on. Two facts killed that proposal.

First, the owner requires one control that sets all three Locations to the same price, or
releases them to be priced individually. TinaCMS forms are **bound to a single document** —
`form.change()` reaches fields in the same document, not across documents. Prices split
across three Location documents cannot be driven by one control without machinery outside
Tina's form model.

Second, the owner wants prices edited **in a sidebar**, not by clicking the price on the
page. Click-to-edit was the entire argument for folding prices into Location documents, and
it turned out to serve a need this field does not have.

## How a price change reaches the site — corrected
**Superseded in its conclusion by ADR 0024, 16 Sep 2026.** The analysis below stands and is why
0024 chose what it chose; what changed is that the client answered the question this section
defers to C7 — *"once a price is pushed it must go live immediately"* — which removes the premise
the first two options rest on. The third path, the one this section names and declines to pick,
is now the decision. Read this for the reasoning; read ADR 0024 for what is built.

An earlier answer here claimed that on-demand revalidation would refresh "just the price
pages" in seconds, against a full rebuild's one to two minutes. **That was wrong, and the
reason is ADR 0005: the price block is on every page.** Invalidating prices invalidates the
whole site. There is no smaller set.

The real difference between the two is not *how many* pages, it is **eager vs lazy**:

| | Full rebuild | On-demand revalidation |
|---|---|---|
| What happens on save | every page re-rendered up front | every page's cache entry marked invalid |
| How long that takes | ~1–2 min for a site this size | seconds — it is just marking |
| When a page re-renders | before anyone asks | when the next visitor asks for it |
| Who waits | nobody; pages are prebuilt | the first visitor to each page, for one render |
| What a visitor sees | old page, then new page | never a stale price — the next request serves fresh |
| Deployment | yes, atomic, rollback-able | no deployment at all |

So revalidation is genuinely faster to *take effect*, and nobody sees a stale price either
way. What it costs is that the first visitor to each page absorbs a render, and the site now
has two publishing mechanisms to understand instead of one.

**For a site of roughly ten pages that is a thin win**, and a full rebuild remains the
default: code changes require a build regardless, a deploy is atomic and revertible, and
prebuilt pages are pure CDN hits with no first-visitor cost. Revalidation earns its keep at
hundreds or thousands of pages, which this site is not.

**If price freshness in seconds is a real requirement, neither is the right tool.** The
answer is then to stop baking prices into the page at all: render the price block behind a
`<Suspense>` boundary so the page shell stays static on the CDN and the block resolves per
request. Prices are then always current, on every page, with no rebuild and no invalidation —
at the cost of a little server work per page view. This is the same mechanism as the promo
slot in ADR 0007, and it is the default shape of Next.js 16 with Cache Components, not an
exotic option. **Decide this with register item C7**, not separately. — *C7 was decided on
16 Sep 2026 and took this path. ADR 0024, which also names the one way to build it wrong: reading
the built `content/fuel-prices.json` per request is exactly as stale as a static page.*

## Decision
All eight prices live in **one** document, `content/fuel-prices.json`, configured as a
TinaCMS collection with `ui.global: true` — it appears under "Site" in the sidebar and opens
straight to the form.

Storage is always **one price per place per grade**. There is no "all locations" price
stored anywhere. The checkbox is an *action*: with it checked, the typed value is written
into all three Locations via `form.change()` within the same document. It controls what
staff type, never what the site reads.

The **Truck Stop is always priced independently** and is never touched by the checkbox. It
shares only diesel with the retail Locations, and truck-lane diesel is not car-lane diesel.

Each of the four places carries its own `updated` stamp. A single document-wide stamp would
misreport the Truck Stop, whose prices move on a different schedule from retail.

## Considered options
- **Prices inside each Location document** — best locality, and the only shape that makes a
  price click-editable on its own page. Rejected: Tina forms are single-document, so the
  all-locations control cannot work.
- **A stored "all locations" price plus per-location overrides** (four fields per grade) —
  the owner's first proposal. Rejected: two homes for one number, and a revert trap. Check
  the box and all three show the shared value; uncheck it and they fall back to per-location
  values that may be weeks stale. Nobody edits the number that changes. On a posted fuel
  price that is a wrong number in front of a customer.
- **Prices in their own collection, one document per place** — no better than one document
  for editing, and it reintroduces a cross-document join for nothing.

## Consequences
- The price shown on a Location page is **not** click-editable there; it comes from a
  different document, so it carries none of the `_content_source` metadata `tinaField`
  needs. Prices are edited in the sidebar. This is accepted, not overlooked.
- Nothing is resolved at render — the site reads a number and prints it. No branching, no
  fallback chain.
- Unchecking the checkbox can never resurrect a stale price, because no second value is
  stored to fall back to.
- A future architecture review will look at a separate prices document and want to fold it
  into the Locations. This ADR is why it must not: the single-document form constraint, not
  taste.
- `fuelGrades` per Location is no longer a separate declaration — the grades a place sells
  are the entries present in its price list.
- ~~Still unresolved: whether the `updated` stamp is stored on save or derived from the commit
  that changed the price.~~ **Resolved 16 Sep 2026 — stored on save (ADR 0024).** Deriving is
  cleaner but needs per-file git history, and once the block renders per request that history
  would have to be read at request time from something the build cannot see: a second runtime
  dependency bought for nothing. The stamp also matters more now, not less — with publish latency
  at zero it is the only thing on the page telling a guest how fresh the number is.
