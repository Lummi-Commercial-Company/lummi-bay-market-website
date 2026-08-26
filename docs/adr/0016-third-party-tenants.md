# 0016 — Third-party tenants get pages; they are not Locations

Status: Accepted — as a **capability**. Nothing is published until the business decides to.

Terms (Location, Truck Stop): `CONTEXT.md`. Bounded by ADR 0001 (what stays off this site)
and the hard rules in CLAUDE.md. Built on the collection mechanism in ADR 0015.

## Context
Three independent businesses rent space at Exit 260 / Salish Village today:

- **Wendy's**, in its own building on the property,
- **High Tide Coffee**, a drive-through on the property,
- the **piroshki counter**, inside the Exit 260 store. *Trading name to confirm.*

Lummi Bay Market does not own or operate any of them.

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
- The piroshki counter is *inside* the Exit 260 store and Wendy's is a separate building on
  the same property. The schema records that as `placement: inside | on-property`, because
  "where is it" is the guest's actual question and the two answers are different errands.
- This site now has a place where non-Lummi-Bay businesses appear. That is a real widening
  of scope, and ADR 0001's boundary is what keeps it narrow: **tenants of a Lummi Bay
  property, not businesses in the LCC portfolio.** A future request to add Silver Reef,
  Loomis Trail or the development itself is still refused by ADR 0001.
- **Nothing here obliges the business to advertise anyone.** If the answer is that tenants
  stay off the site, the cost of this decision is one unused collection definition.
- Two things to confirm when convenient: the piroshki counter's exact trading name, and
  whether any current tenant contract already requires listing. If one does, this stops
  being speculative and joins Phase 0.
