# 0026 — A `/privacy` page, required by the app rather than by the website

Status: Accepted. Amends **ADR 0025**, adds checklist items **A21** and **B12**, and attaches a
new precondition to **A8**.

Not legal advice. The platform requirements below are product-submission rules, which is a
different kind of claim from a legal read — they are published by Apple and Google and are
checked by a human reviewer before an app is allowed to ship.

## Context
One commit ago, ADR 0025 decided the footer carries a plain sentence and **no** privacy policy
link, and argued the point directly:

> *"A 'Privacy Policy' link promises a policy document — a legal artifact somebody has to own,
> review and keep current. There is no page behind this because there is nothing a page would
> add."*

That reasoning was sound for the thing it was reasoning about, and it was about the **website**.
The client then said, on 17 Sep 2026:

> *"I'll need to include a 'Privacy Policy' page due to the fact we have a mobile app and I want
> to make sure the rules and policies are listed online for that application."*

This is not a reversal of ADR 0025. It is a fact ADR 0025 did not have. **The site's own
cookielessness is unchanged and still needs no policy page. The app does.**

## Why the app forces it

The Rewards loyalty app (`CONTEXT.md`; the site pitches it at `/rewards`) cannot be published
without a publicly reachable privacy policy URL. This is a **submission condition on both
stores**, not a jurisdictional question that a small Washington retailer might fall under:

- **Apple** requires a privacy policy link in the App Store Connect listing *and* reachable from
  inside the app, plus Privacy Nutrition Labels declaring what is collected.
- **Google Play** requires a privacy policy URL in the Play Console listing *and* a Data Safety
  declaration, which the reviewer compares against the policy.

Two consequences follow immediately and neither is obvious:

1. **The site's cookielessness cannot satisfy this.** The policy has to describe what the *app*
   collects — an account, purchases, a points balance, almost certainly a push token and
   plausibly location. The website collects none of that. A policy that describes only the
   website would be a policy that does not cover the product it was filed for.
2. **The URL becomes load-bearing.** Once it is typed into a store listing, `/privacy` is a
   permanent address: changing the slug breaks a live app listing, and taking the page down can
   get an app pulled. It is closer to a DNS record than to a page.

## Decision

**Build `/privacy` as a page, link it from the footer, and keep the existing footer sentence.**

1. **The page.** A document in the `pages` collection (ADR 0015) — not a hand-written route — so
   the policy can be revised by staff or by legal counsel through the CMS without an engineer,
   which is the only way a policy document stays current. It renders with no promo region, like
   `/contact`.
2. **The URL is `/privacy` and is permanent.** Treat it under the ADR 0018 rule: never delete,
   never rename. If the wording is ever replaced wholesale, the replacement is published at the
   same address.
3. **The nav does not change.** Still three items (ADR 0008). `/privacy` is reached from the
   footer, like `/about` and `/fuel-prices`.
4. **The footer carries both.** The plain sentence stays exactly as it is, and a **Privacy
   Policy** link joins it on the base row:

   > © 2026 Lummi Bay Market · No cookies. Visits counted anonymously. · Privacy Policy ·
   > Lummi Commercial Companies

   Keeping both is deliberate. The sentence is a **specific, checkable claim about this website**,
   verifiable in ten seconds with devtools; the policy is a **general document that mostly
   describes the app**. Replacing the first with the second would trade a fact for a genre — and
   the honest, unusual thing about this site is precisely the fact.

## The one thing the policy must get right

The policy covers two products with very different data practices, and the failure mode is that
it blurs them. If it opens with boilerplate about "we may collect information about you", the
footer sentence on every page becomes something a reader has to reconcile with the policy, and
the site's clearest commitment turns into an apparent contradiction.

So the policy is scoped explicitly, per section: **what the website does, and what the app does,
said separately and labelled.** The website half is short and unusually strong, and it should say
so. The app half is where the substance is.

## What this ADR does not do

**The policy's content is not drafted here, and should not be drafted by anyone who does not have
the app's data inventory.** A privacy policy is a factual description of real data practices; a
plausible-sounding one that misdescribes them is worse than none, because it is then a published
false statement about personal data, and on Play it is also a Data Safety mismatch — a removal
risk rather than a paperwork problem.

What is needed from the app's builder, before a word is written:

- what the app collects (account fields, purchase history, points, device identifiers, push
  tokens, location — and whether location is foreground only)
- which third parties receive any of it (the loyalty platform, a payment processor, crash
  reporting, any analytics SDK)
- how long data is kept, and how a customer deletes their account — **Apple requires an in-app
  account-deletion path for any app that lets you create an account**, and the policy is normally
  where that route is documented
- who the data controller is: Lummi Bay Market, LCC, or the app vendor

~~**Open question for the client:** if the Rewards app is a white-labelled product from a loyalty
vendor, that vendor may already publish a policy covering their platform. Hosting a second,
divergent policy is worse than either hosting one or linking theirs. Establish which before
drafting — it changes who owns the document.~~

**Answered 17 Sep 2026, by the policy text itself.** The client supplied the document, and its
Children's Privacy section names **Rovertown** as *"our app platform partner"* and links their
policy. So the app **is** white-labelled, and the shape that resulted is the middle case this
paragraph did not consider: one policy of our own that defers to the vendor's for one section.
That is workable. It is also a live dependency — if Rovertown revise their policy, this page's
answer on children's data changes and nobody here is told.

The supplied text is now at `content/pages/privacy.mdx`, **reproduced verbatim**, with the
labelled website section this ADR requires placed above it. What it leaves open — a probable
copy defect in the Choice of Law clause, a `lastModified` date of 6/12/2025, and the store
declarations that have to match it — is written up in `docs/privacy-policy-notes.md`, along with
the rule that **legal text is revised by its owner, not by an engineer and not by Claude.**

## Consequences
- **A8 gains a precondition.** The app cannot be submitted, so the real App Store / Play URLs
  cannot exist, until this page is live at a public URL. The page is upstream of the links, not
  parallel to them.
- **ADR 0025 is amended, not voided.** No cookie banner, no cookies, analytics still cookieless.
  Every constraint it placed on future embeds and on analytics stands, and the footer sentence
  still has to stay true.
- **The site now has a document with an owner and a review cadence**, which it did not before,
  and which ADR 0025 correctly identified as the real cost of a policy page. That cost is now
  worth paying because the app cannot ship without it — not because the website needed it.
- **The policy must be revised whenever the app changes what it collects**, and the store
  declarations revised with it. That is an ongoing obligation on whoever operates the app, and it
  is the part that gets forgotten.

## Amendment — the app is already published, so the precondition on A8 is discharged, 17 Sep 2026

This ADR attached a precondition to checklist item **A8**: the store links could not exist until
`/privacy` was live, because neither store publishes an app without a public policy URL. That
reasoning was sound and it is now moot — **the app is already in both stores**, and has been for
some time:

- Apple — `https://apps.apple.com/us/app/lummi-bay-market/id6744988483`, *Lummi Bay Market*,
  seller **Lummi Commercial Company**, category Food & Drink.
- Google Play — `https://play.google.com/store/apps/details?id=com.rovertown.lummi`, **confirmed by
  the client 17 Sep 2026**.

A submission that has already happened cannot be gated by a page that has not been built.
**A8 is unblocked and always was**; what it needed was somebody to look up the two URLs, which the
client did.

**The decision to build `/privacy` is unchanged, and so is its ranking in Phase 3.** The page was
never only a submission artifact: the footer links to it (ADR 0025 amended), the policy describes
a product this business owns, and the reason the URL is permanent — that a store listing points at
a policy URL and a dead one is an app-review problem — applies to whatever URL is in the listing
today just as strongly.

**What this opens is a question for the client, not a decision for this ADR.** The Apple listing's
privacy policy currently points at `appcustomersupport.com/privacy-policy/470c696e-…`, a
Rovertown-hosted URL — consistent with the white-label arrangement A21 uncovered. So there will be
two public copies of substantially the same policy: one the business controls at
`lummibay.com/privacy`, one it does not. Whether the store listings are repointed at the site's
copy is theirs to decide with Rovertown. It is worth deciding rather than drifting: two policies
that are meant to be identical will not stay identical, and the one customers are shown at
install time is the one the business cannot edit.
