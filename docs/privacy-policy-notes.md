# `/privacy` — what the supplied policy settles, and what it does not

The client supplied the policy text on **17 Sep 2026**. It is now at
`content/pages/privacy.mdx`, **reproduced verbatim** — the only additions are section headings
(the source was one bulleted list) and a labelled website section above it, which ADR 0026
requires. Nothing in the legal text was reworded, tidied or corrected.

That last point is deliberate and is the rule for this file: **legal text is not edited by an
engineer or by Claude.** Three things below need somebody's decision. None of them is a change
Claude should make on its own, and two of them are not changes to make at all without counsel.

---

## 1. It answers the open question in ADR 0026 — the app platform is Rovertown

ADR 0026 ended with:

> *"**Open question for the client:** if the Rewards app is a white-labelled product from a
> loyalty vendor, that vendor may already publish a policy covering their platform."*

The supplied text answers it. Children's Privacy points at
[Rovertown](https://www.rovertown.com/privacy-policy) and names them **"our app platform
partner."** So the app is a Rovertown product, and there are now **two** policies in play: this
one, and theirs.

ADR 0026 warned that *"hosting a second, divergent policy is worse than either hosting one or
linking theirs."* What actually exists is the middle case — one policy that defers to another for
one section. That is workable, and it is a live dependency: if Rovertown changes their policy,
this page's Children's Privacy answer changes with it and nobody here gets told.

**What this closes:** checklist `A21`, the app data inventory, is answered for the purpose of
publishing a page — the collection list is right there in Information Collection and Use. It does
**not** close the Data Safety and Privacy Nutrition Label declarations, which have to match this
text and are the app submitter's job, not the website's.

## 2. The "raffle" clause is almost certainly a copy defect — flagged, not fixed

Choice of Law contains:

> *"...other than participant's actual out-of-pocket expenses (i.e., **costs associated with
> participating in this raffle**)..."*

There is no raffle. The paragraph also says *"participant"* throughout rather than *user* or
*customer*. Both read as a sweepstakes or promotion document that this clause was lifted from.

It is left **exactly as supplied**, for two reasons. A privacy policy is a published legal
statement, and quietly rewording one on somebody's behalf is not an editorial act — it changes
what a person agreed to when they used the app. And this clause is the one that sends disputes to
Lummi Nation Tribal Court and waives categories of damages, which is the part of the document
most likely to be read closely by somebody who is unhappy.

**Action, for whoever owns the document:** have counsel confirm whether "raffle" should read
"App" (or the sentence be struck). Then the corrected text is pasted into the CMS and the
`lastModified` date moves. One edit, from the owner, in one place.

## 3. The app says cookies; this site says no cookies. Both are true, and the page has to show it

The policy's Cookies section says the Service *"may use third party code and libraries that use
cookies."* The "This website" section at the top of `/privacy` says **this site sets no
cookies** (ADR 0025). *(Until 29 Sep 2026 every page also carried "No cookies. Visits counted
anonymously." in the footer; that line was removed at the owner's direction and the claim now
lives on this page alone.)*

Those are not in conflict — they are about two different products — but a reader who lands on
`/privacy` from the footer link sees them ten seconds apart, and if the page opens with the app's
boilerplate the footer sentence reads as contradicted. ADR 0026 predicted this exact failure:

> *"If it opens with boilerplate about 'we may collect information about you', the footer sentence
> on every page becomes something a reader has to reconcile with the policy."*

So the page opens with a short, plainly labelled **"This website"** section that states the site's
own practice, and hands off explicitly to **"The Lummi Bay Market app"**. The handoff sentence is
load-bearing; it is not decoration and should not be trimmed for length.

---

## Standing obligations this page creates

- **The URL is permanent.** `/privacy` goes into both store listings. Never renamed, never
  deleted, never `noindex` (ADR 0026, and unlike an expired `infoPage` under ADR 0018).
- **The date is part of the content.** The page says it was last modified **6/12/2025** — over a
  year old at launch. If anything about the app's data collection has changed since, this text is
  wrong before it ships. Worth one question to whoever runs the app.
- **It has to be revised when the app changes**, together with the store declarations. That is an
  ongoing obligation on the app's owner and is the part that gets forgotten.
- **It is a `pages` document** (ADR 0015), so the revision is a CMS edit by whoever owns the
  policy — no engineer, no deploy ticket. That is the whole reason it is a document and not a
  hand-written route.
