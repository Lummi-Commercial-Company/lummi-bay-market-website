# 0004 — Fuel prices live in one document, and "all locations" is an action, not stored state

Status: Accepted

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
- Still unresolved: whether the `updated` stamp is stored on save or derived from the commit
  that changed the price. Deriving is cleaner but needs per-file git history at build time,
  and Vercel builds from a shallow clone by default. Settle with a spike, not an argument.
