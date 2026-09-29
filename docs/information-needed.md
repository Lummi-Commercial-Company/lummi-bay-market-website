# Information still needed — design, layout and content

Everything here is a **question only the business can answer**. Nothing on this list is artwork,
a promotion, or a fuel price: those three are handled separately and are excluded by request.

This is a *view*, not a new record. Where an item already has an ID it carries it — the reasoning
lives in `docs/launch-checklist.md` (section A), `docs/loose-ends.md` and the ADRs, and is not
repeated here. Items with no ID are gaps neither document had captured.

**Revised 17 Sep 2026** after the client answered the first version point by point. Answered items
are kept, struck through, with where the answer went — a list that deletes what it asked loses the
record of why the design is the way it is. **Three groups were cut entirely**: they were launch
logistics, not design, layout or content, and the client was right to say so. See *What was cut*
at the foot.

**Revised again 17 Sep 2026**, after the client answered the twelve open checklist items in one
pass. The short version: **nothing on this list blocks the build any more.** ★C, the amenity list,
was the one item that could change finished work — the client has moved it into the post-build
content pass along with artwork, promotions and tenants, and the half of it that was mechanical
rather than a question (the Minimart's compound string) has been split. Everything in §2 is
answered the same way: *"Use current copy as placeholders."*

That is a real decision with a real cost, and it is worth naming once here rather than arguing it
twice: deferring words and pictures does not make them smaller, it makes them invisible until the
site is public. §2 is kept in full, unstruck, for exactly that reason.

---

## ★ 1. The three answers that can change the design

| # | What we need | Why it can move things |
|---|---|---|
| ~~★A~~ | ~~**Analytics or Search Console access**~~ | **Answered by assertion, 17 Sep 2026** — *"Fuel prices are the draw."* The three-item nav stands. Recorded in `loose-ends.md` §1 with the one caveat worth keeping: that answers *why people come*, which is not the same question as *what they could not find*. Nothing is blocked |
| ~~★B~~ | ~~**Do any hours vary?**~~ | **Answered and built, 17 Sep 2026** — *"most likely would be an alert bar mention… If you want to build in a second 'one line of text' variable for any changes, that would be smart."* That is now `hoursOverrides`: a second hours line on a date window, per Location, which swaps in and back out on its own. **ADR 0027**, checklist **B14**. The New Year's Eve case in the answer is the worked example in the ADR |
| ★C | **The full amenity list for each Location, as a customer would ask for it** | **Deferred 17 Sep 2026** — *"Not a hold up. This can be populated during the updating process of artwork, promotions, advertising, tenant creation."* It no longer blocks, and the one part that was not a question has been done: the Minimart's `fuel + convenience store` is **split into two**, so the badge row renders instead of falling back to a sentence. Two badges is a floor, not a finish. Amenities drive a row of badges on every Location page, so the list *is* the layout: see `docs/proofs/amenity-badges.html`, which draws it. What we hold for the Minimart today is the single string `fuel + convenience store`, which renders as **one lone chip** under a heading promising a list. Two asks: split the compound strings we already have, and five minutes with whoever opens up. Things people search for and we have no record of: ATM, propane exchange, ice, lottery, hot food, restrooms, air and water, car wash, EV charging, RV lane, accessible parking and restrooms. Checklist **A23** — now scheduled rather than pending |

---

## 2. Words — the site is currently written in placeholder

Every line below was written to fill a layout and **reads as finished**, which is the danger
(`A12`, `loose-ends.md` §6). None of it is a design question; all of it blocks launch.

The client's answer — *"All the text will be updated before launch. Is that the concern?"* — is
exactly the concern, and it is now answered: yes, and this is the list of what has to be written,
so nothing is discovered missing on launch week.

**17 Sep 2026: *"Not a hold up. Use current copy as placeholders."*** The sentence arrived numbered
`A7`, and the client has since confirmed what `A7` meant — the CMS editor seats, deferred as an
implementation matter — so this is the answer to `A12`, and the mapping is no longer in doubt.
Accepted for the build —
none of this is engineering and none of it blocks a line of code. The list stays whole and
unstruck, because the deferral changes *when* these get written, not *whether*, and it moves the
work to the side of the launch where placeholder text is public. Each row below is still a thing
somebody has to write.

| # | What we need |
|---|---|
| 2.1 | **Home headline and sub-headline.** Currently "Three stops on the bay" / "Fuel, food and a full truck stop — open where you need us, on Lummi land." Invented |
| 2.2 | **One line per Location** (`summary`) — what makes *this* stop different, in a customer's words, not a marketing sentence |
| 2.3 | **The About page.** Three separate things: the brand story, the Lummi Nation relationship **in the wording the Nation prefers**, and a light community note. Also the boundary — LCC corporate/enterprise content stays out (ADR 0001) |
| 2.4 | **The footer's four column headings** — About / Visit / Rewards / Work with us. Invented here; the architecture names the *links*, never the columns |
| 2.5 | **The Truck Stop page: what a driver decides on.** The amenity list is settled, the decision factors are not — shower cost and whether towels are included, lounge access rules, how long a truck may park, any reservation, whether there is a scale, and which **fleet cards** are accepted |
| 2.6 | **The Cove Kitchen** — hours (are they the store's?), whether there is a menu to publish, and a phone for orders. It is an Amenity, not a tenant (settled 16 Sep 2026), but customers will search for it by name |
| ~~2.7~~ | ~~**The Careers link destination**~~ — **supplied and settled 17 Sep 2026**: `https://www.silverreefcasino.com/careers` (`A9`). The one thing that went *to* the client — whether linking a sibling Lummi enterprise sits inside ADR 0001 — came back decided: *"Should read as 'Careers' and link to the provided link I gave, not a /careers page on this website."* One footer link, labelled **Careers**, straight out. The rule that survives the decision: **the label stays "Careers"**, with no company name and no logo beside it, because a link naming no company is a destination rather than a mention |
| 2.8 | **The Rewards app in one paragraph** — what a customer gets, for the `/rewards` page. This is a page on this website with nothing on it, which is why it survived the cut of the app group below |
| 2.9 | **The legal entity name for the footer copyright line** — "Lummi Bay Market", or a registered company name |
| ~~2.10~~ | ~~**Whether to advertise the businesses renting space at Exit 260 at all**~~ (`A14`) — **Answered: yes.** *"we will create a page for tenants and add their card to that page."* ADR 0016 amended, `A14` closed. What is still needed is ordinary content, and it is now item **2.11** |
| 2.11 | **A short description and hours for each business at Exit 260**, and for each one, whether its card links to a page on our site or straight to their own website — *"depending on the company's decision at that time."* Piroshky Piroshky first, since that is the one named. A logo only where we have written permission (`markApproved`, ADR 0016) |

---

## 3. Structure — small facts the content model has nowhere to put yet

The client's answer here was *"not sure the actual issue"*, which is fair — the heading was doing
no work. The issue in every case is the same one: **a fact that exists in the business but has no
field to live in**, so it cannot be entered in the CMS until someone adds one. That is a build
change, not a content update, which is why they are asked before launch rather than after.

| # | What we need | Note |
|---|---|---|
| 3.1 | **Which fuel grades each Location and the Truck Stop actually sell** | This is the *shape* of the price table, not the prices in it — the table's rows are the grades present. Fisherman's Cove is recorded as carrying ethanol-free; nobody has confirmed the full set anywhere |
| 3.2 | **Do the showers or driver lounge have their own hours or a cost?** | The content model has no field for either (`loose-ends.md` §7) |
| 3.3 | **Is a newsletter or email signup expected?** | Nobody has ever mentioned one, and it is **not** in the architecture. It would be the only form on a site that deliberately has none (ADR 0015), so it is an architecture decision rather than a field |
| ~~3.4~~ | ~~**Are there Facebook / Instagram accounts?**~~ | **Answered 17 Sep 2026** — *"Social site links should be added to the bottom of the page, within or below the footer links."* Built as a footer social row: **ADR 0028**, checklist **B13**. One rule came with it — **links only, never embedded feeds or follow buttons**, because an embed loads third-party code and sets cookies, which would falsify the footer's own "No cookies" line (ADR 0025). What is still needed is the accounts themselves: **3.5** |
| ~~3.5~~ | ~~**Which social accounts exist, and their URLs**~~ — **supplied 17 Sep 2026.** Facebook `LBMat260`, Instagram `lbmexit260`, Yelp `lummi-bay-market-at-exit-260-bellingham`. All brand-level despite the Exit 260 handles, so the footer is three icons and no Location page gets its own. Yelp is a review listing rather than a posting account, which is why it is ordered last. Recorded in ADR 0028 (amended) and `content/settings/site.json`. The half-question that came with it is **not** answered and is not blocking: whether the two tended accounts are current. That is a five-minute look, not a decision |

---

## 4. Everything else — cut

The first version of this list had three more groups: **Access** (registrar logins, Google
accounts, repo ownership), **The app** (its data inventory, store URLs, whether it is
white-labelled) and **Operations** (what happens to the three old domains, and how a price change
happens today).

**The client's objection was right and the groups are removed.** They are launch and operations
logistics, not the design, layout and content questions this list was asked for. Nothing is lost:
every one of them is already an item in `docs/launch-checklist.md` section A, which is where
launch logistics belong, and they are tracked there.

Two things did not survive the cut, because they are not really about the app or about
operations — they are pages on this website with nothing on them:

| # | What we need | ID |
|---|---|---|
| ~~4.1~~ | ~~**The App Store and Google Play URLs**~~ — **supplied 17 Sep 2026**, with one correction. Apple is right and live. The Play link given was a **search** URL; it was fetched, and the twelve apps it returns are all unrelated — the app is not among them, so as a store button it would land a customer on other companies' apps. The direct listing is `play.google.com/store/apps/details?id=com.rovertown.lummi`, **confirmed by the client 17 Sep 2026** and recorded without a flag in `content/settings/site.json`. The moral is worth keeping even though the item is closed: a search URL looks like a store link and behaves like a directory, so whatever goes in that field gets opened and checked rather than pasted on trust. Also learned in the looking: **the app is already published in both stores**, which retires the ADR 0026 worry that `/privacy` gated the submission — it never could have, because the submission already happened | `A8` |
| ~~4.2~~ | ~~**What the Rewards app collects**, for `/privacy`~~ — **answered 17 Sep 2026.** The client supplied the policy text; the page is written at `content/pages/privacy.mdx` and what it left open is in `docs/privacy-policy-notes.md` | `A21` closed |

And one answer from the cut groups was kept, because it changed a document rather than a plan:

> **How a price change happens today** — *"Price changes today are immediate and manual. 3-4
> people have to get together and say 'change prices....now' and then do their related tasks to
> change the price as close to the same time as possible."*

That is now recorded in the `fuel-price-update` skill — as facts about the **website**, not as a
recommended order of operations. **Corrected 17 Sep 2026 at the client's direction:** an earlier
draft of that skill told them where the website belonged in their sequence. It is not ours to say.
What the skill records instead is that the site's own publish latency is effectively zero (Save is
the last action, ADR 0024), that whoever types the price is holding a phone rather than sitting at
a desk, and that the `updated` stamp is where a missed change becomes visible.

---

## What this list does not cover, by request
**Artwork** (`A3`, `A4`, and the static map still at `A19`), **promotions**, and **fuel prices**.
All three are maintained in TinaCMS or through a chat session once the site is running, and none
of them blocks the build — which is exactly why they are excluded and everything above is not.

**The client confirmed that reading on 17 Sep 2026 and extended it**: artwork, promotions,
advertising and Lummi art are all updated after the build, by chat session or in TinaCMS, and the
build runs on placeholders (`A3`). `A20`, the per-Location share cards, was removed outright — the
field stays, the assets are not a launch item. What the answer does not reach is `A4`: cultural
approval was never a development question, and it still stands between a placeholder motif and a
real one.
