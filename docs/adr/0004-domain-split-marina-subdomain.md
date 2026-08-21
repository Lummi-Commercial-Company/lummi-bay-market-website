# 0004 — lummibay.com for the Market, marina.lummibay.com for the Marina

Status: Accepted (2026-08-21)

## Context
`CLAUDE.md` names **lummibay.com** the canonical domain for the Lummi Bay Market site
and lists it among the three source sites to merge. Checking the domain in August 2026
showed that second premise to be wrong: lummibay.com does not serve Market content
awaiting a merge. It serves **Lummi Bay Marina** — a live boat and dry-dock storage
business, running on third-party storage software, with its own phone, email, office
hours, paying storage customers, and pages for renting (`/pages/rent`), support
(`/pages/support`), and a site map (`/pages/map`). Its navigation links *out* to
lcc-lummi.com/cove for the Market.

So the canonical-domain decision was never a redirect task. Taking the apex means
moving an operating business's website, and doing it carelessly means paying storage
customers cannot reach their rental or billing pages.

Marina is a recognized sub-brand in the brand book, and `CONTEXT.md` places it out of
scope as a section of this site. Nothing here changes that: the marina keeps its own
site on its own software. Only its address changes.

## Decision
Split the domain by host:

- **lummibay.com** (apex, plus `www`) → the Lummi Bay Market site. Canonical, as
  originally specified.
- **marina.lummibay.com** → Lummi Bay Marina, continuing to run on its existing
  storage software.

exit260.com still 301-redirects to the Exit 260 location page. lcc-lummi.com is still
left alone (ADR 0001).

## Consequences

**A vendor dependency, not just a DNS change.** The marina runs on hosted storage
software. Serving it at marina.lummibay.com requires that vendor to support a custom
domain — a CNAME target and a TLS certificate issued for the new hostname. Confirm the
vendor supports this *before* scheduling any cutover; if they do not, this decision
needs revisiting rather than forcing.

**Sequence matters, because real customers are on the old address.** Stand up and
verify marina.lummibay.com serving the marina over valid TLS *first*. Only then point
the apex at the Market site. Reversing that order takes a paying customer's rental and
payment pages offline.

**The marina's old apex URLs need path-preserving redirects.** Once the apex belongs to
the Market, `lummibay.com/pages/rent`, `/pages/support`, and `/pages/map` are Market
404s unless they 301 to the same paths on marina.lummibay.com. Customers have these
bookmarked; treat them as inbound links worth keeping, and inventory the full path list
from the live marina site rather than assuming these three are all of them. This joins
the S10 redirect map.

**301s carry the marina's search history to the subdomain.** Permanent redirects, not
302s, so accumulated ranking and inbound links transfer rather than being abandoned.

**Marina email is unaffected.** It runs on lummibaymarina@lcc-lummi.com — a different
domain, untouched by this change.

**The marina's outbound Market link should be updated** from lcc-lummi.com/cove to the
Fisherman's Cove page on the new site, once that page exists (S3).

**Reversible, but not cheaply.** Once customers learn the subdomain and 301s are
cached, moving the marina again costs more than this move does. Hence the record.

## Open
Who controls the lummibay.com DNS zone, and who owns the marina vendor relationship
(tracked as E5). The cutover cannot be scheduled until both are known.
