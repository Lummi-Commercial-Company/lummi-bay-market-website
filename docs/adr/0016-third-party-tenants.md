# 0016 — Third-party tenants get pages; they are not Locations

Status: Accepted — as a **capability**. Nothing is published until the business decides to.
**Amended 17 Sep 2026: the business decided to.** Tenants are advertised, there will be a tenants
page, and a tenant card links either to a page here or straight to the tenant's own website —
see *The open question, answered* below. Closes checklist **A14**.

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

> **Answered 17 Sep 2026.** The client, asked directly, said yes: *"If you are referring to
> Piroshky Piroshky, then we will create a page for tenants and add their card to that page. The
> card will either link to a page about the tenant on our website or link directly to their
> website, depending on the company's decision at that time."* Everything below stands as
> written — the rules were settled in advance precisely so that this answer would not require
> reopening them. The one thing it adds is the per-tenant choice of where a card points, which is
> a new field and is specified at the end of this section.

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

**A tenant is never an Amenity either.** The two are told apart by who owns the counter: if
Lummi Bay Market hires the staff and takes the revenue it is an Amenity on that Location; if the
business pays rent for the space it is a tenant. The **Cove Kitchen is an Amenity** (client,
16 Sep 2026) — it stays in Fisherman's Cove's `amenities` and is unaffected by whether tenants
are ever advertised. The known tenants are all at Exit 260.

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

### The open question, answered: a card points one of two ways

The client's answer carries a requirement the original decision did not have. A tenant card links
**either** to a tenant page on this site **or** directly to the tenant's own website, decided per
tenant and revisable — *"depending on the company's decision at that time."*

So the choice is a field, not a build-time assumption:

| Field | Purpose |
|---|---|
| `linkMode` | `internal` (the tenant's page here) or `external` (their own site) |
| `externalUrl` | Required when `linkMode` is `external`, ignored otherwise |

**Why it has to be a field.** Piroshky Piroshky, Wendy's and Black Bear Diner are national or
regional brands with their own sites and their own marketing rules; Hi-Tide Coffee's presence may
be an Instagram account. Which way a card points is a decision made per business, sometimes by the
business, and it can change after launch when a franchise asks. A boolean in the CMS answers that
in ten seconds. Anything else answers it in a deploy.

**An external card is marked as leaving the site, visibly.** An arrow glyph on the card and a new
tab with `rel="noopener noreferrer"` — the same treatment as the social links in ADR 0028. A guest
who taps what looks like a page on this site and lands on wendys.com has been bounced somewhere
they did not choose to go, and on a phone the back button is the only way home. The mark is not
politeness; it is what keeps the index usable.

**`internal` still requires the page to exist and be published.** A card in `internal` mode
pointing at an unpublished document does not render — the same rule that keeps the whole index
invisible while the collection is empty. A card that links nowhere is worse than an absent card.

**The disclosure is unaffected and non-negotiable either way.** An `external` card still sits
under the index's single disclosure line, because a card in our theme carrying another company's
name makes the same implication whichever way it points. Where an `external` tenant has no page
here, that index line is the only place the disclosure can appear, which is an argument for its
being on the index rather than only on tenant pages — as it already is.

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
- ~~**Nothing here obliges the business to advertise anyone.** If the answer is that tenants
  stay off the site, the cost of this decision is one unused collection definition.~~
  **Overtaken 17 Sep 2026** — the answer is yes, and the collection will be used. Keeping the
  line because it records why the capability was built before the decision: the cost of being
  wrong was one unused definition, which is what made building it early the cheap move.
- **The tenants page is now a real launch item, not a latent one.** It needs at least one
  published tenant to exist at all, which means the roster above has to be turned into records:
  hours, a description, `placement`, `linkMode`, and a logo only where `markApproved` is true.
  Piroshky Piroshky is the one the client named, so it is the one to write first.
- The roster above is a snapshot, not a specification. Tenants, hours and descriptions are
  fields in the CMS; nothing about them needs an engineer or an ADR revision.
- Worth knowing at some point, though it does not block anything: whether a tenant contract
  requires a listing and on whose website, since every lease here is LCC's.

## Amendment — built, and named "Dining at Salish Village", 2 Oct 2026

**The Liquor Store is not a tenant.** A Liquor Store document was saved under Other Businesses;
Lummi Bay Market owns and runs it, so it is a page of ours (`/liquor-store`, under Pages), as is
the Tobacco & Liquor Drive-Thru (`/drive-thru`). Both are linked from the Exit 260 page
(under What's here) and the Locations menu through Exit 260's "Also inside this location
(pages)" field, and the Liquor Store from the footer's Visit column. They were also listed under
the "Our locations" cards until the owner removed that row the same day: it sat directly above
the footer and read as part of it. The same reasoning that keeps the Cove
Kitchen an Amenity: the test is who runs it, not where it is.

**The index is named "Dining at Salish Village"** — the owner's choice, which overrides the
"Also at Exit 260, never Salish Village" rule above **for this page and the card that links to it,
and nowhere else.** CLAUDE.md's hard rule on other Lummi companies still holds everywhere else:
no "Salish Village" in the nav, the footer (the footer still refuses a link that names it), or
any other copy. The page title is the page's own field, so the card reads whatever the page is
called.

**How it is built:**
- The index is an ordinary page document, `content/pages/dining.mdx` → `/dining`, carrying one
  section, "Other businesses on our properties", that draws the cards from Other Businesses.
  Its title and words are edited under Pages like any other page.
- A card on the Locations list — under the Location cards, wherever the list appears (Home, the
  Locations page, each Location page, the Truck Stop page) — links to whichever page carries
  that section, and appears only when at least one business is saved.
- Cards are grouped by `placement`, open businesses first. The headings are the owner's
  wording (2 Oct 2026), and the same words label the business's own page: **"Inside Exit 260"**
  (the Location it is in), **"Salish Village"** (its own building on the property) and
  **"Parking Lot Exclusive"** (a truck or trailer in the lot). The "Salish Village" heading and
  label fall inside this page's exception, which therefore covers the business pages too. The disclosure line is drawn once at the foot of the list and once on
  each business page; it is not a field.
- A business whose card goes "A page here on our site" has its page at `/dining/{file name}`,
  in the sitemap. One whose card goes "Straight to their own website" opens that site in a new
  tab, marked as leaving; an address that is not a plain http(s) one is dropped and the card
  goes to the page here instead.
- **`status: planned` shows, rather than hiding.** The original decision said a planned tenant
  "does not render"; the approved template draws it as a card with an "Opening soon" badge that
  links nowhere, which is what was built — so Black Bear Diner can be on the page before it opens.
  The field is "Open yet?" in the CMS.
- Gates enforced by the site whatever the document says, with tests (`lib/tenant-rules.ts`):
  hours only once confirmed with the business; logo and photo only with permission.

**The four records are placeholders.** Piroshky Piroshky, Wendy's, Black Bear Diner (planned)
and Hi-Tide Coffee were entered with a one-line description each and no hours, logo or photo.
The wording is ours, not the businesses', and is to be confirmed with them.
