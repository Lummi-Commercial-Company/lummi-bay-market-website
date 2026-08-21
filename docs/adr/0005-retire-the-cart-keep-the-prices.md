# ADR 0005 — Retire the cart, keep the prices

Status: **Accepted** (2026-08-21)
Supersedes nothing. Related: ADR 0001 (LCC boundary), ADR 0004 (domain split).

## Context

`exit260.com` runs a real transactional store, not a price list. Verified on
2026-08-21 against `exit260.com/260smokes/skydancer-silver-king`: an "Add To Cart"
button, a Carton/Pack size selector, a quantity field, a published price ($4.94),
and "Cart 0" / "Sign In My Account" in the global header. `lcc-lummi.com` carries a
Cart in its nav too.

The catalog is most of the site. Roughly **110 of the 116 URLs** in
`exit260.com/sitemap.xml` are cigarette product pages — national brands alongside
the Native-manufactured lines (Skydancer, Seneca, Native, Complete, Signal, Crowns,
Great Country). `/tfs` adds ~100 chew blends, nicotine pouches, vape, and 500+
liquor SKUs.

The store appears to serve pickup, not shipping: `/tfs` states "You must **present
photo ID** at time of purchase" and restricts purchases to personal consumption.
That matters, because it means the customer value sits in *knowing the price before
driving out*, not in the transaction.

Meanwhile the new site is static-first with no payment handling by design, and
online tobacco retail is a heavily regulated category that a brochure site has no
business carrying.

## Decision

**Retire the cart. Keep the prices as a read-only list.**

1. No cart, no checkout, no accounts, no payment handling on lummibay.com. The
   product pages become browsable price information only.
2. The price list may be **removed entirely after the build is complete** — the
   owner has flagged this as likely. So it must be built as a self-contained,
   removable section: no other page may depend on it, and deleting it must not
   break navigation, sitemaps, or the fuel-price model.
3. Prices in the list are content, not commerce. Same rule as fuel prices: never
   invented, never seeded with examples, and shown as unavailable rather than
   guessed.

## Consequences

- **PCI scope stays at zero.** No card data, no stored payment methods, no
  checkout flow to secure or audit.
- **No online age-verification obligation.** Selling nicotine online carries
  requirements a static brochure site cannot meet. Publishing a price does not.
- **~110 URLs need a redirect decision**, and they are the bulk of the legacy
  site's indexed surface. They must not all 404. This feeds the S10 redirect map:
  either path-preserving 301s to the retained price list, or 301s to a category
  page. Decide per path, not in bulk.
- **The Squarespace decommission has obligations this repo cannot discharge.** Open
  orders, customer accounts, and any stored payment data live in that account.
  Whoever holds access must check all three, plus any active subscription, before
  switching anything off. Do not treat launch as completing this.
- **Build it to be deleted.** Because item 2 is expected, the price list should be
  one route, one data file, and one component — not threaded through the location
  pages.
- **Reversible, but not cheaply.** Restoring e-commerce later means a payment
  provider, PCI scope, and age verification — a different project, not a toggle.

## Not decided here

Whether the retained price list covers all ~110 tobacco SKUs or a smaller set, and
whether liquor and vape prices join it. That is a content-scope question for the
owner once the list's shape exists.
