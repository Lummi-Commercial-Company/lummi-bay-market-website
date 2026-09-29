# 0024 — A posted price is live on publish, with no stale window

Status: Accepted. Settles register item **C7** and checklist **A5**, and therefore **B8**.

Terms (Fuel Price, Fuel Grade, DEF, Truck Stop): `CONTEXT.md`. Storage: ADR 0004. Display:
ADR 0005. Procedure: skill `fuel-price-update`.

## Context
ADR 0004 laid out three ways a price change can reach the site and deliberately did not choose
between them, because the choice depends on a business answer nobody had yet: **is a short stale
window acceptable?** It named the fork precisely — full rebuild, on-demand revalidation, or
stop baking prices into the page at all — and deferred to C7.

The client answered on 16 Sep 2026, without qualification:

> *"No. Once a price is pushed it must go live immediately."*

That is not a preference between two similar options. It removes the premise the first two rest
on. A rebuild takes one to two minutes and a revalidation still waits for a webhook to fire and
the next visitor to arrive. Both are short. Neither is *immediate*, and the requirement was
stated as an absolute.

## Decision

**The price block resolves per request. The page shell stays static.**

This is the third path ADR 0004 described and declined to pick: the price block renders behind a
`<Suspense>` boundary, so every page is still a prebuilt CDN document and only the block is
dynamic. There is no rebuild to wait for and no cache to invalidate, because nothing about a
price was ever baked in.

**The block must read from a request-time source, not the built file.** This is the whole of the
decision and the easiest part to get wrong. Content lives as files in git (ADR 0002), and a file
in the deployed bundle only changes on a deploy — so a per-request render of the *built*
`content/fuel-prices.json` is exactly as stale as a static page, at the cost of server work for
nothing. The block reads the **TinaCloud content API**, which serves the committed content
without waiting for a deploy. Per-request rendering and a request-time source are one decision;
shipping half of it is a regression that looks like the feature.

**The build-time value is the fallback, never the source.** If the content API is slow or
unreachable, the block renders the value from the last deploy and its `updated` stamp, rather
than an error, a spinner that never resolves, or an empty space where a price goes. A guest must
never see a blank where a number belongs — that reads as a broken site, and this block is on
every page.

**`output: 'export'` was already impossible; it is now impossible twice.** ADR 0017 made the
emergency notice depend on the build not being a static export. A per-request block is the
second thing that a static export would silently delete rather than fail on.

## The disclaimer half of C7, which the answer does not settle
C7 asked two things and one was answered. The technical lag is now zero. **The human lag is
not**, and no architecture reaches it: if the pump price changes at 6am and nobody opens the CMS
until 9am, the site is wrong for three hours, and that has nothing to do with how it publishes.

So the short line stays, and it stops being about the build:

- **Keep the `updated` stamp in the expanded panel.** With instant publish it is no longer a
  proxy for build latency — it is now the *only* thing on the page that tells a guest how fresh
  the number is. C9 gets more load-bearing, not less.
- **Keep one short "prices subject to change" line.** It covers the gap between the pump and the
  CMS, which is the only gap left.
- Neither is a legal opinion and neither is expensive. If the client wants the line gone, that is
  their call to make with the stamp still in place; the stamp is not optional.

**Confirmed by the client, 16 Sep 2026: "keep the stamp."** So it is settled rather than merely
recommended — the `updated` stamp ships, and removing it later is a decision to reopen this ADR,
not a tidy-up. The "prices subject to change" line was not raised either way and stays as written.

**C9 (stamp stored or derived) resolves to stored-on-save**, as recommended. A stamp derived from
the commit would have to be read at request time from a git history the build cannot see, which
is a second request-time dependency bought for nothing.

## Consequences
- **Every page view now does a little server work.** Previously a pure CDN hit. The shell is
  still static, so this is one small fetch beside the document, not a rendered page — but it is
  not free, and it is on every page because the block is on every page (ADR 0005). Budget it in
  B10 rather than discovering it.
- **TinaCloud moves from a convenience to a runtime dependency.** It was the editing surface; it
  is now in the serving path for a number on every page. The fallback above is what keeps that
  from being a single point of failure, and it has to be *tested by taking the API away*, not
  assumed.
- **The verification in section C of the launch checklist gets sharper.** "A staff member changes
  a fuel price and sees it live" now has a number attached: a hard refresh should show the new
  price, not a page that catches up a minute later. If it does not, this ADR is not built.
- Prices and the emergency notice now publish by two different mechanisms — the notice by
  revalidation (ADR 0017), prices per request. That is deliberate. The notice is rare, sitewide
  and cacheable once thrown; a price is a number that must be right on the read.
- **This does not license request-time rendering elsewhere.** Promos compute live per visitor
  already (ADR 0018) and the notice does not. Nothing else on the site has a freshness
  requirement measured in seconds, and adding one should have to argue for itself here.
