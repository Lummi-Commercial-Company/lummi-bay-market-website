# ADR 0005 — No online commerce

Status: **Accepted** (2026-08-21)
Related: ADR 0001 (LCC boundary), ADR 0004 (domain split).

## Context

`exit260.com` runs a real transactional store. Verified 2026-08-21 on
`exit260.com/260smokes/skydancer-silver-king`: an "Add To Cart" button, a
Carton/Pack size selector, a quantity field, a published price ($4.94), and
"Cart 0" / "Sign In My Account" in the global header. `lcc-lummi.com` carries a Cart
in its nav too.

The catalog is most of the legacy site. Roughly **110 of the 116 URLs** in
`exit260.com/sitemap.xml` are cigarette product pages — national brands alongside
the Native-manufactured lines (Skydancer, Seneca, Native, Complete, Signal, Crowns,
Great Country). `/tfs` adds ~100 chew blends, nicotine pouches, vape, and 500+
liquor SKUs.

## Decision

**The new site has no online commerce. It is removed, not migrated.**

Owner decision, 2026-08-21: *"there is no online e-commerce — remove it."*

Concretely, lummibay.com has:
- no cart, no checkout, no order flow
- no customer accounts or sign-in
- no payment handling of any kind
- **no product catalog** — the ~110 tobacco SKU pages do not come across, and
  neither does a read-only price list standing in for them

Tobacco, liquor, vape and food are described as **things the store carries**, in
prose on the relevant location page. Never as items with prices and a quantity field.

## Consequences

- **PCI scope is zero, by construction.** No card data, no stored payment methods,
  no checkout to secure or audit. The static-first stack stays static.
- **No online age-verification obligation.** Selling nicotine online carries
  requirements a brochure site cannot meet, and now never has to.
- **~110 URLs need redirects, and this is now the largest single SEO decision in
  the project.** They are the bulk of the legacy site's indexed surface and they
  must not all 404. With no catalog to land on, each path needs a destination
  chosen on purpose — most plausibly the Exit 260 location page or its tobacco
  and spirits section. This feeds the S10 redirect map and should not be done in
  bulk without looking at which paths actually draw traffic.
- **Squarespace decommissioning has obligations this repo cannot discharge.** Open
  orders, customer accounts, and any stored payment data live in that account.
  Whoever holds access must check all three, plus any active subscription, before
  switching anything off. Launching the new site does not complete this.
- **A real capability goes away.** Customers could previously check a price before
  driving out. That is a genuine loss, taken knowingly: the owner's judgement is
  that a catalog is not worth its maintenance and compliance weight on a brochure
  site. If it is ever missed, the cheapest answer is prose — "over 100 varieties,
  ask at the drive-thru" — not a rebuilt catalog.
- **Reversing this is a different project.** Restoring commerce later means a
  payment provider, PCI scope, and age verification, not a toggle.
