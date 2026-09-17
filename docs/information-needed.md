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

**One item is still open and it is the only one that can change work already finished**: ★C, the
real amenity list per Location.

---

## ★ 1. The three answers that can change the design

| # | What we need | Why it can move things |
|---|---|---|
| ~~★A~~ | ~~**Analytics or Search Console access**~~ | **Answered by assertion, 17 Sep 2026** — *"Fuel prices are the draw."* The three-item nav stands. Recorded in `loose-ends.md` §1 with the one caveat worth keeping: that answers *why people come*, which is not the same question as *what they could not find*. Nothing is blocked |
| ~~★B~~ | ~~**Do any hours vary?**~~ | **Answered and built, 17 Sep 2026** — *"most likely would be an alert bar mention… If you want to build in a second 'one line of text' variable for any changes, that would be smart."* That is now `hoursOverrides`: a second hours line on a date window, per Location, which swaps in and back out on its own. **ADR 0027**, checklist **B14**. The New Year's Eve case in the answer is the worked example in the ADR |
| ★C | **The full amenity list for each Location, as a customer would ask for it** | **Still open — the one thing on this list that is.** Amenities drive a row of badges on every Location page, so the list *is* the layout: see `docs/proofs/amenity-badges.html`, which draws it. What we hold for the Minimart today is the single string `fuel + convenience store`, which renders as **one lone chip** under a heading promising a list. Two asks: split the compound strings we already have, and five minutes with whoever opens up. Things people search for and we have no record of: ATM, propane exchange, ice, lottery, hot food, restrooms, air and water, car wash, EV charging, RV lane, accessible parking and restrooms. Checklist **A23** |

---

## 2. Words — the site is currently written in placeholder

Every line below was written to fill a layout and **reads as finished**, which is the danger
(`A12`, `loose-ends.md` §6). None of it is a design question; all of it blocks launch.

The client's answer — *"All the text will be updated before launch. Is that the concern?"* — is
exactly the concern, and it is now answered: yes, and this is the list of what has to be written,
so nothing is discovered missing on launch week.

| # | What we need |
|---|---|
| 2.1 | **Home headline and sub-headline.** Currently "Three stops on the bay" / "Fuel, food and a full truck stop — open where you need us, on Lummi land." Invented |
| 2.2 | **One line per Location** (`summary`) — what makes *this* stop different, in a customer's words, not a marketing sentence |
| 2.3 | **The About page.** Three separate things: the brand story, the Lummi Nation relationship **in the wording the Nation prefers**, and a light community note. Also the boundary — LCC corporate/enterprise content stays out (ADR 0001) |
| 2.4 | **The footer's four column headings** — About / Visit / Rewards / Work with us. Invented here; the architecture names the *links*, never the columns |
| 2.5 | **The Truck Stop page: what a driver decides on.** The amenity list is settled, the decision factors are not — shower cost and whether towels are included, lounge access rules, how long a truck may park, any reservation, whether there is a scale, and which **fleet cards** are accepted |
| 2.6 | **The Cove Kitchen** — hours (are they the store's?), whether there is a menu to publish, and a phone for orders. It is an Amenity, not a tenant (settled 16 Sep 2026), but customers will search for it by name |
| 2.7 | **The Careers link destination** (`A9`), and whether "Careers" is the right label |
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
| 3.5 | **Which social accounts exist, and their URLs** — per brand or per Location, and who posts to them. An account linked from the footer and last posted to in 2023 is worse than no link at all |

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
| 4.1 | **The App Store and Google Play URLs** for the `/rewards` page. Not an app question — `/rewards` is a page on this site whose two main buttons point nowhere. Still open, but no longer waiting on the policy: 4.2 is answered | `A8` |
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
**Artwork** (`A3`, `A4`, `A20`, and the static map still at `A19`), **promotions**, and **fuel
prices**. All three are maintained in TinaCMS or through a chat session once the site is running,
and none of them blocks the build — which is exactly why they are excluded and everything above
is not.
