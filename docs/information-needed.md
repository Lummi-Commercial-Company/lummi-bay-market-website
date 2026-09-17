# Information still needed — design, layout and content

Everything here is a **question only the business can answer**. Nothing on this list is artwork,
a promotion, or a fuel price: those three are handled separately and are excluded by request.

This is a *view*, not a new record. Where an item already has an ID it carries it — the reasoning
lives in `docs/launch-checklist.md` (section A), `docs/loose-ends.md` and the ADRs, and is not
repeated here. Items with no ID are gaps neither document had captured.

**Read the three starred items first.** They are the only ones that can change work already
finished; everything else fills a field in a design that already exists.

---

## ★ 1. The three answers that can change the design

| # | What we need | Why it can move things |
|---|---|---|
| ★A | **Analytics or Search Console access for exit260.com, lcc-lummi.com and lummibay.com** — whatever exists, even if it is nothing | The whole navigation assumes **fuel prices are the primary draw**. That has never been checked against one piece of evidence. If most visits are people hunting for *hours*, a *phone number* or the *Cove Kitchen*, the three-item nav is optimised for the wrong thing and we find out after launch. `loose-ends.md` §1. If no analytics exist anywhere, that is the answer — and **20 minutes of "what do people phone and ask?" from whoever answers the phone beats nothing** |
| ★B | **Do any hours vary?** By day of week, by season, or on holidays — Thanksgiving, Christmas, New Year's Day | Today each Location stores hours as **one line of text** (`open daily 7am–8pm`). One "closed Christmas Day" turns that field into a structure, and it changes the Location card, the Locations index and `/contact` at once. Cheap to build in now, expensive to retrofit. Worth noting: the Minimart's hours are the one confirmed value that later turned out wrong, so **re-check each with the staff who open up** |
| ★C | **The full amenity list for each Location, as a customer would ask for it** | Amenities drive a row of badges on every Location page, so the list *is* the layout. What we hold for the Minimart today is "fuel + convenience store" — almost certainly incomplete. Things people search for and we have no record of: ATM, propane exchange, ice, lottery, hot food, restrooms, air and water, car wash, EV charging, RV lane, accessible parking and restrooms |

---

## 2. Words — the site is currently written in placeholder

Every line below was written to fill a layout and **reads as finished**, which is the danger
(`A12`, `loose-ends.md` §6). None of it is a design question; all of it blocks launch.

| # | What we need |
|---|---|
| 2.1 | **Home headline and sub-headline.** Currently "Three stops on the bay" / "Fuel, food and a full truck stop — open where you need us, on Lummi land." Invented |
| 2.2 | **One line per Location** (`summary`) — what makes *this* stop different, in a customer's words, not a marketing sentence |
| 2.3 | **The About page.** Three separate things: the brand story, the Lummi Nation relationship **in the wording the Nation prefers**, and a light community note. Also the boundary — LCC corporate/enterprise content stays out (ADR 0001) |
| 2.4 | **The footer's four column headings** — About / Visit / Rewards / Work with us. Invented here; the architecture names the *links*, never the columns |
| 2.5 | **The Truck Stop page: what a driver decides on.** The amenity list is settled, the decision factors are not — shower cost and whether towels are included, lounge access rules, how long a truck may park, any reservation, whether there is a scale, and which **fleet cards** are accepted |
| 2.6 | **The Cove Kitchen** — hours (are they the store's?), whether there is a menu to publish, and a phone for orders. It is an Amenity, not a tenant (settled 16 Sep 2026), but customers will search for it by name |
| 2.7 | **The Careers link destination** (`A9`), and whether "Careers" is the right label |
| 2.8 | **The Rewards app in one paragraph** — what a customer gets, for the `/rewards` page. Separate from the store links in §5 |
| 2.9 | **The legal entity name for the footer copyright line** — "Lummi Bay Market", or a registered company name |
| 2.10 | **Whether to advertise the businesses renting space at Exit 260 at all** (`A14`) — Piroshky Piroshky, Wendy's, Hi-Tide Coffee, and Black Bear Diner when it is built. Undecided by design; the collection ships empty and nothing renders until the answer is yes. **If yes**, each needs a short description, and none of them is a Location or an amenity |

---

## 3. Structure — small facts the content model has nowhere to put yet

| # | What we need | Note |
|---|---|---|
| 3.1 | **Which fuel grades each Location and the Truck Stop actually sell** | This is the *shape* of the price table, not the prices in it — the table's rows are the grades present. Fisherman's Cove is recorded as carrying ethanol-free; nobody has confirmed the full set anywhere |
| 3.2 | **Do the showers or driver lounge have their own hours or a cost?** | The content model has no field for either (`loose-ends.md` §7) |
| 3.3 | **Is a newsletter or email signup expected?** | Nobody has ever mentioned one, and it is **not** in the architecture. It would be the only form on a site that deliberately has none (ADR 0015), so it is an architecture decision rather than a field |
| 3.4 | **Are there Facebook / Instagram accounts for any of the three?** | Nothing on the site links to social today. Either they get a footer row or the answer is "no accounts", and both are fine — but the current silence is an omission, not a decision |

---

## 4. Access — things that already exist and somebody must be able to log into

Checking these costs nothing today and can cost the launch date if left. **The registrar is the
one that bites**: a domain registered years ago under a former employee's address can take weeks
to recover.

| # | What we need | ID |
|---|---|---|
| 4.1 | **Registrar logins for lummibay.com and exit260.com** — not to change anything, just proof someone at the company can get in | `A6` |
| 4.2 | **A company Google account** for the Locations map — a map built in a personal account leaves with that person | `A17` |
| 4.3 | **The Google Business Profile for each of the three Locations** — do they exist, who controls them, and do the name, hours and phone match what this site will publish? | — |
| 4.4 | **Confirmation the GitHub repo sits in a company org**, and that Vercel and the CMS will be owned the same way | — |
| 4.5 | **Two staff emails for CMS editor logins** — deferred, and the deadline is training, not now. Two constraints when it is answered: the free tier is **exactly two seats**, and one of the two has to be able to publish an emergency notice at 5am | `A7` |
| 4.6 | **Who will actually read the analytics** | `B7` |

**4.3 is the one most often skipped and it matters more than the website for a fuel stop.** More
people will see the Google listing than the site, and hours that disagree between the two
generate complaints at the counter rather than emails.

---

## 5. The Rewards app

| # | What we need | ID |
|---|---|---|
| 5.1 | **The real App Store and Google Play URLs.** Blocked until the privacy page is live — neither store publishes an app without a public policy URL | `A8` |
| 5.2 | **The app's data inventory**, from whoever built it: what it collects, who receives it, retention, the account-deletion route, and who the data controller is. **Not a writing task until these facts exist** | `A21` |
| 5.3 | **Is the app white-labelled from a loyalty vendor?** If so they may already publish a policy, and hosting a second divergent one is the worst of the three options | ADR 0026 |

---

## 6. Two operational questions, easy to forget

| # | What we need |
|---|---|
| 6.1 | **What happens to the three old sites after launch** — parked, redirected wholesale, or shut down? Who keeps paying, and who renews the SSL certificates? (`loose-ends.md` §7.) Separately, a **full URL list from all three** is needed so every indexed address either resolves or redirects — a crawl, not a memory (`B5`) |
| 6.2 | **How does a price change happen today?** Not the prices — the *process*. Who changes the pump signs, who tells whom, and does the website need to match the pumps or lead them? The CMS design was reasoned from first principles and has never been shown to the person who will use it (`loose-ends.md` §2) |

---

## What this list does not cover, by request
**Artwork** (`A3`, `A4`, `A20`, and the static map still at `A19`), **promotions**, and **fuel
prices**. All three are maintained in TinaCMS or through a chat session once the site is running,
and none of them blocks the build — which is exactly why they are excluded and everything above
is not.
