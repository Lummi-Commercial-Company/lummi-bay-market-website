# 0016 — Third-party tenants get pages; they are not Locations

Status: Accepted — as a **capability**. Nothing is published until the business decides to.

Terms (Location, Truck Stop): `CONTEXT.md`. Bounded by ADR 0001 (what stays off this site)
and the hard rules in CLAUDE.md. Built on the collection mechanism in ADR 0015.

## Context
Independent businesses operate at Exit 260 / Salish Village. **Rent for all of them —
space and building alike — is paid to Lummi Commercial Company.** Lummi Bay Market owns,
operates and manages none of them.

| Business | Where | Status |
|---|---|---|
| **Piroshky Piroshky** | A counter inside the Exit 260 convenience store | Open |
| **Wendy's** | Its own building on the property | Open |
| **Hi-Tide Coffee** | A coffee truck outside the store | Open |
| **Black Bear Diner** | Its own building, same arrangement as Wendy's | Planned, not yet built |

LCC owns, operates and manages Lummi Bay Market, and is also the landlord here. The exact
roster will change — a tenant leaves, another arrives — which is the argument for a
collection rather than a hand-built page: the facts belong in fields somebody fills in, not
in this document.

**Whether to advertise them at all is undecided, and this ADR does not decide it.** The ask
is narrower: the *ability* to publish such a page should exist before it is needed, because
the moment it is needed it will be needed quickly.

### Why the page is about the guest, not the lease
Every one of these businesses is LCC's tenant, not Lummi Bay Market's. ADR 0001 keeps LCC's
own business — the Salish Village development, billboard leasing, the portfolio — off this
site, so the justification for these pages cannot be the leasing relationship.

It does not need to be. A driver stopping for fuel reasonably wants to know what else is on
the property to eat. That is a Lummi Bay Market service to a Lummi Bay Market customer, and
it holds regardless of who collects the rent.

**The site therefore never mentions renting, leasing, or landlords.** It says what is on the
property and that we do not operate it. That single rule keeps these pages clear of ADR 0001
without needing a judgement call each time one is written.

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

**The index is a page of its own, grouped by where the business is.** "Also at Exit 260" is
somewhere a guest goes deliberately — parked, deciding where to eat — not only a strip at the
foot of a tenant page. It is generated from the collection, so it grows and shrinks with the
list and nothing is hand-listed.

Grouping is by `placement`, not alphabetical: **inside the store**, **on the property**,
**in the lot**. Someone choosing between four places is really choosing how far to walk, and
walking twenty feet to a counter, driving round to a building, and finding a truck in the lot
are three different errands. A group with nothing in it does not render, so the page never
shows an empty heading.

The disclosure runs **once, at the foot of the index**, rather than on every card — repeated
four times it reads as a warning about the tenants rather than a statement of fact. Each
tenant's own page still carries its own.

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
- The roster above is a snapshot, not a specification. Tenants, hours and descriptions are
  fields in the CMS; nothing about them needs an engineer or an ADR revision.
- Worth knowing at some point, though it does not block anything: whether a tenant contract
  requires a listing and on whose website, since every lease here is LCC's.
