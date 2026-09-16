# 0025 — No banner, because the site sets nothing to consent to

Status: Accepted. Settles checklist **A18**, constrains **B7**, and resolves the open cookie
consequence in ADR 0019.

Not legal advice. It is a reasoned read of a small Washington retail site's exposure, and the
decision below is deliberately built so that the read does not have to be right.

## Context
The client asked, on 16 Sep 2026:

> *"Cookie/consent — banner or no banner? is it required by law are any cookies used or consent
> need on this site? I don't think there is but unsure about cookies. Consent, this is not an
> adult site."*

**One clarification first, because the two halves of that answer are about different things.**
Cookie consent is a **privacy** rule, not an age gate. It is about storing identifiers on a
visitor's device and who gets told about it — GDPR/ePrivacy in the EU and UK, CCPA/CPRA in
California. "Not an adult site" answers a question nobody asked; a hardware store with the wrong
analytics tag has the same cookie exposure a gas station does.

## Is a banner required here?
No, on the current architecture.

- **No US federal cookie-consent law exists.** There is no American equivalent of the EU rule
  that produced the banners.
- **Washington has none either.** The My Health My Data Act is the state's aggressive privacy
  law and it is health-data-specific — it does not reach a fuel price and a store address.
- **CCPA/CPRA almost certainly does not apply.** It attaches at roughly $25M annual revenue,
  100,000 California consumers, or half of revenue from selling personal data. And where it does
  apply it asks for a **"Do Not Sell or Share" link**, not a banner — the banner is a European
  artifact that American sites copied.
- **GDPR applies to targeting EU residents, not to being reachable from Europe.** Under the
  EDPB's guidance, mere accessibility is not targeting. Three fuel stations on Lummi Nation land,
  priced in dollars, are not targeting anyone in the EU.

## What this site actually sets
This is the part that matters more than the legal read, because it is checkable.

| Surface | Cookies | Notes |
|---|---|---|
| Public pages | **none** | Static/ISR documents. No session, no login, no cart, no form (ADR 0015) |
| `/admin` (TinaCMS) | auth cookies | First-party, strictly necessary, exempt under every regime above. Only a logged-in editor ever sees them — it is not on a guest's path |
| Vercel hosting | **none** | Serving a document sets no visitor cookie |
| Fonts | **none** | `next/font` self-hosts the faces at build time, so no visitor request reaches Google |
| **Google My Maps iframe on `/contact`** | **yes, third-party** | The only one. ADR 0019 |

**One exception, and it is a design choice rather than a requirement.** Everything else about
this site is cookieless by construction, not by care.

## Decision

**No cookie banner. Instead, keep the site cookieless, so there is nothing to consent to.**

That is a stronger position than "we decided a banner isn't required", and it costs nothing:
it makes the legal question moot rather than answered. A banner on a site that sets no cookies
is theatre that every guest has to dismiss.

Two standing constraints follow, and they are the whole of the decision:

1. **`/contact`'s map does not load Google until a guest asks it to.** ADR 0019's choice of
   My Maps stands — the mechanism, the company account, the public setting, all unchanged. What
   changes is *when* the iframe mounts: the page renders a static map image with the three pins
   and a per-Location **Directions** link, and the iframe loads only if the guest clicks to open
   the interactive map. No third-party code runs before an explicit act, which is consent in the
   only form that means anything. If the click-to-load proves fiddly, the static image with
   Directions links **is** the shipped answer — it does what a guest actually wants, which is
   usually "open this in my own maps app".
2. **B7's analytics product must be cookieless.** This is a hard constraint on an item that is
   still open, not a preference. Vercel Web Analytics and Speed Insights are cookieless and are
   already part of the platform. **Google Analytics is ruled out** — it is the single most common
   way a site like this acquires a consent obligation it did not need, and it would reverse this
   ADR on its own.

## How you get past consent without a popup
The trick is that there is no trick. **Consent is required for storage that is not strictly
necessary — so if nothing non-essential is stored, the obligation never attaches.** You are not
working around a banner; you are not triggering the thing a banner exists to answer for. That is
also why it cannot be undone by a cookie policy page or a smaller, politer banner: those manage
the obligation, they do not remove it.

Four rules do the whole job.

1. **"Cookieless" has to mean no device storage at all, not no `Set-Cookie` header.** The law is
   about storing or reading anything on a visitor's device — `localStorage`, `sessionStorage`,
   IndexedDB and a fingerprint all count the same as a cookie. A vendor advertising "cookie-free"
   while writing an id to `localStorage` has changed the mechanism and not the legal position.
2. **Nothing third-party loads on page load.** Not an analytics tag, not a font from a CDN, not a
   video, not a chat bubble, not a map. This is the whole rule, and it is the one that erodes,
   because each of these arrives as somebody's small helpful addition.
3. **Where a third party is genuinely wanted, use a façade.** The page renders a lightweight
   local stand-in — a static map image, a video poster frame — and loads the real embed only when
   the guest clicks it. Nothing reaches the third party until the guest asks for it, which is
   consent in the only form that is not an interruption: they clicked the thing they wanted.
   No modal, no dismissal, no page-load delay, and it is faster besides.
4. **First-party and strictly necessary is exempt anyway.** The TinaCMS session cookie in
   `/admin` needs no consent under any of these regimes and never reaches a guest. If the site
   ever gets a cart or a login, the same exemption covers the session itself — but the rest of
   this ADR would need re-reading.

**What the guest experiences: nothing.** No banner, no overlay, no "we value your privacy", no
second click to read a fuel price. That is the point — the least intrusive consent UI is the one
that never had to exist.

**Optional, and worth it:** a short **Privacy** line in the footer saying the site sets no
cookies and tracks nobody. Not required, does not interrupt anyone, and it is a better answer
than a banner to the guest who wonders. It would be a footer link, so it needs sign-off before
it is added.

## Consequences
- **A18 is closed without a purchase, a vendor, or a banner component.** Nothing ships.
- **The constraint is invisible and therefore easy to break.** Any future embed — a YouTube video,
  a review widget, a chat bubble, a Facebook pixel, a "book a service" button — re-opens this
  decision, usually without anyone noticing, because none of them announce that they set a
  cookie. The rule to carry forward: **an embed that phones a third party is a decision, not an
  implementation detail.**
- **If the site ever gets a login, a cart, or a form, this ADR is void** and the question has to
  be asked again from the top. Today there is no form anywhere (ADR 0015), which is why the
  position is available at all.
- **A Lighthouse or privacy audit now comes back clean**, rather than flagging the map iframe
  ADR 0019 anticipated. That was the concrete, non-speculative cost of the embed, and this
  removes it.
- **A static map image is one more asset the designer owes**, against a 100 MB CMS asset cap
  (A3). It is small, but it is not free, and it should be listed rather than discovered.
- **This is worth one plain sentence to the client**, since they asked a legal question: no
  banner is required, and we went further and built the site so the question does not arise.
