# 0016 — Third-party tenants get pages; they are not Locations

Status: Accepted — as a **capability**. Nothing is published until the business decides to.

Terms (Location, Truck Stop): `CONTEXT.md`. Bounded by ADR 0001 (what stays off this site)
and the hard rules in CLAUDE.md. Built on the collection mechanism in ADR 0015.

## Context
Independent businesses operate at Exit 260 / Salish Village. Lummi Bay Market owns,
operates and manages none of them — but **they are not all our tenants**, and that turns out
to matter more than it first appears.

| Business | Where | Rents from | Status |
|---|---|---|---|
| **Piroshky Piroshky** | A counter **inside** the Exit 260 convenience store | **Lummi Bay Market** | Open |
| **Wendy's** | Its own building on the property | **Lummi Commercial Company** — space *and* building | Open |
| **High Tide Coffee** *(name to confirm)* | A coffee **truck** outside Exit 260, in a rental space | To confirm — presumed LCC | Open |
| **Black Bear Diner** | Its own building on the property, same arrangement as Wendy's | **Lummi Commercial Company** | Planned, not yet built |

Lummi Commercial Company owns, operates and manages Lummi Bay Market. So LCC is both this
brand's parent and, for the freestanding buildings, the landlord.

### The part that needs a decision, not just a schema

**Only Piroshky Piroshky is a Lummi Bay Market tenant.** Wendy's and Black Bear Diner rent
building and land from LCC. The coffee truck's landlord is unconfirmed.

That runs into ADR 0001, which keeps LCC's own business — the Salish Village development,
billboard leasing, the rest of the portfolio — off this site. A page advertising LCC's
commercial tenants is, read strictly, LCC's leasing business appearing on a retail brand
site, which is the thing ADR 0001 was written to prevent.

Two consequences follow, and both are worth stating before anyone builds anything:

1. **A contract requiring a listing would most likely be an LCC contract, not a Lummi Bay
   Market one.** If Wendy's franchise terms oblige the landlord to list the business, the
   obligation sits with LCC and could equally be met on lcc-lummi.com. Whether it lands on
   *this* site is a choice, not a requirement. That should be checked before it is assumed.
2. **The justification for putting them here has to be the guest, not the lease.** There is a
   good one: a driver stopping for fuel reasonably wants to know what else is on the
   property to eat. That is a Lummi Bay Market service to a Lummi Bay Market customer, and
   it holds regardless of who collects the rent. If that is the reason, the page is about
   *what is here*, not about who leases from whom — and no page should describe a leasing
   relationship at all.

This ADR takes the second reading. **The site never says who rents from whom.** It says what
is on the property and that we do not operate it.

**Whether to advertise them at all is undecided, and this ADR does not decide it.** The
ask is narrower and worth stating plainly: the *ability* to publish such a page should
exist before it is needed, because the moment it is needed it will be needed quickly — a
tenant contract, Wendy's being the likely one, may require the property to list the
business on its website.

Building the capability now costs one collection. Discovering the need later, with no page
type, costs a build cycle against a contract deadline.

Two boundaries have to be checked before adding third parties to this site, and they turn
out to be different boundaries.

**The CLAUDE.md hard rule does not apply.** It says *other Lummi companies* appear only as
the single footer link. These are not Lummi companies; they are unrelated commercial
tenants. The rule protects against LCC's portfolio bleeding into a retail brand site, and
that is not what is happening here.

**ADR 0001 does apply, through a name collision.** ADR 0001 keeps "the Salish Village
development" off this site as LCC portfolio content. But "Salish Village" is also Exit 260's
own alternate name in `location-content-model`. A page titled *Companies at Salish Village*
would therefore read, to anyone who knows LCC, as exactly the development ADR 0001 excludes.

## Decision

**The `tenants` collection exists and ships empty.** No tenant page is written, and none is
published, until someone decides to advertise. The decision here is that the capability is
in place and the rules it must follow are settled in advance — not that any page will exist.

**A tenant page, if one is published, is in the Lummi Bay Market theme.** Each is a
header image for the business, its hours, and a short description — the same shape as an
`infoPage` under ADR 0015.

**The index is called "Also at Exit 260", not "Salish Village".** The property is named in
market terms, which is how a guest thinks of it and which cannot be confused with the LCC
development. `aka: Salish Village` stays on the Location record; it is not the page title.

**Landlord is recorded, and never published.** Each record carries
`landlord: lummi-bay-market | lummi-commercial-company`, because the distinction is real and
someone will ask. It drives nothing on the page and is never rendered. A guest does not care,
and publishing it would put LCC's leasing business on the site through the back door.

**A tenant is never a Location.** It goes in `content/tenants/`, not `content/locations/`.
This is the load-bearing part of the decision, because Location is not just a label: the
location list is derived from that folder (ADR 0009) and the fuel price table takes its
rows from the places in it (ADR 0004/0005). A tenant filed as a Location would appear in
the Locations index, in the footer, and **as a row in the fuel price table** — a Wendy's
with an em-dash under Regular. Each tenant instead carries a `location` reference to the
property it sits on.

**Every tenant page carries a disclosure, and the template renders it — not the editor.**
Wording: *"Independently owned and operated. Not part of Lummi Bay Market."* It is a
property of the collection, not a block someone remembers to add. A page in our theme, with
our header and our footer, showing another company's name is exactly where a guest will
assume we run the place; the one page type that needs the disclaimer is the one where
forgetting it is easiest.

**No third-party logo renders without written permission.** The schema carries a
`markApproved` boolean and the template will not output `logo` unless it is true. Falling
back to the business name set in our own type is always safe; using a franchise's wordmark
without approval is not, and a boolean in the schema is a cheaper control than a policy
nobody reads. The same gate covers supplied photography.

**Tenant hours are marked as the tenant's.** They drift, and we do not control them. Each
page shows an `hoursConfirmed` date beside them, or omits hours entirely and links to the
tenant's own site. Stale hours for someone else's business is a complaint we would have
volunteered for.

**Nothing appears while the collection is empty.** The "Also at Exit 260" index and the link
to it render only when at least one tenant page is published. An empty collection is
invisible to a guest — no stub page, no empty index, no dead link. Publishing the first
tenant is what makes the entry point appear.

**Not in the navigation.** ADR 0008 is unchanged. The entry point is a link on the Exit 260
Location page, plus a promo if one is wanted. If a contract later requires more prominence,
that is a nav decision to take then, on its own merits.

## Consequences
- A contract obligation to list a tenant becomes a content task, not a build.
- A tenant that leaves is unpublished; no code changes, no dead route in the nav.
- Tenants never enter the fuel table, the Locations index, or the footer's location list —
  they are not in the folder those read from.
- `placement: inside-store | freestanding-building | mobile-unit` — because "where is it" is
  the guest's real question, and walking to a counter inside the shop, driving round to a
  building, and finding a truck in the lot are three different errands. Two values would have
  collapsed the coffee truck into Wendy's.
- `status: open | planned` — Black Bear Diner is not built yet. A planned tenant is a record
  that exists and does not render, so the page can be written in advance and published on
  opening day rather than written on opening day.
- This site now has a place where non-Lummi-Bay businesses appear. That is a real widening
  of scope, and ADR 0001's boundary is what keeps it narrow: **tenants of a Lummi Bay
  property, not businesses in the LCC portfolio.** A future request to add Silver Reef,
  Loomis Trail or the development itself is still refused by ADR 0001.
- **Nothing here obliges the business to advertise anyone.** If the answer is that tenants
  stay off the site, the cost of this decision is one unused collection definition.
- To confirm: the coffee truck's exact trading name (**High Tide Coffee** or **Tide's In
  Coffee** — both have been said, and a tenant's name is the one thing on their page that
  cannot be approximately right), and who its landlord is.
- To confirm, and it is the one that could change this ADR: **whether any tenant contract
  requires a listing, and on whose website.** If the obligation is LCC's and lcc-lummi.com
  satisfies it, this collection stays a convenience rather than a compliance mechanism.
