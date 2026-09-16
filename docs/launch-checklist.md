# What it takes to get this live

Two categories, and only one of them is engineering. **The client-supplied column is the one
that usually sets the date** — those items have lead times measured in weeks and cannot be
compressed by working faster.

## A. Only the client can provide these
| # | Item | Blocks | Notes |
|---|---|---|---|
| ~~A1~~ | ~~**Logo vector files** — including a reversed/light lockup~~ **Done** | — | Delivered as PNG in `public/brand/`. The vector was rejected on colour fidelity; masters stay with the designer. ADR 0006, amended |
| ~~A2~~ | ~~**Confirmed addresses, hours, phone numbers**~~ **Done** | — | All three Locations confirmed by the client, plus both Exit 260 numbers. Every address and phone from the scrape proved correct; the Minimart's hours did not — **7am–8pm, not 6am–10pm** (client, 16 Sep 2026). In `location-content-model` |
| ~~A15~~ | ~~**Two Location names**~~ **Done** | — | Settled by the client 16 Sep 2026: **"Minimart"** (one word) and **"Fisherman's Cove"** with no "at"; "at" stays on Exit 260 alone. Applied across the repo — 17 files, including the `minimart` slug. In `location-content-model` |
| A3 | **Art direction + budget** — commissioned Lummi art, photography, or both | Every page's finished look | Site has no imagery at all today (ADR 0012). Note the CMS free tier caps assets at **100 MB** — a real photo set exceeds it |
| A4 | **Cultural approval** for any Coast Salish art | Launch, unconditionally | Final art must be authentic, commissioned, or tribe-approved |
| ~~A5~~ | ~~**Pricing sign-off** — is a short stale window acceptable~~ **Decided** | — | **No stale window** (client, 16 Sep 2026): "once a price is pushed it must go live immediately". The price block now resolves per request against the content API, not the build — ADR 0024. The disclaimer half stays and is no longer about the build: keep the `updated` stamp (now the only freshness signal a guest gets) and one short "prices subject to change" line, which covers the pump-to-CMS gap. The line is the client's to strike; the stamp is not optional |
| A6 | **Domain control for lummibay.com and exit260.com** | DNS cutover, the 301 | Registrar login or someone who has it |
| A7 | **Two staff emails** for CMS editor logins | Staff being able to edit | **Deferred by the client, 16 Sep 2026** — "undecided, don't see as important". Fine to defer to Phase 2 training, with two constraints attached so it is not a surprise then: the free tier is **exactly 2 seats** and a third is $24/mo (ADR 0002/0013), and **somebody has to be able to publish the emergency notice at 5am** (ADR 0017) — which makes the choice of *which two people* an operational one, not an admin formality. Shared logins are the one wrong answer: they destroy the per-person history that is half the point |
| A8 | **Rewards app links** — the real App Store / Play URLs | The Rewards pill, on every page | Currently `#` |
| A9 | **Careers link destination** | Footer | Editable field, needs a target |
| ~~A10~~ | ~~**Contact form destination**~~ **Dropped** | — | There is no form anywhere on the site (ADR 0015). Phone and address are the contact routes, so there is no inbox to nominate and no spam handling to build |
| ~~A11~~ | ~~**A favicon mark** — new art, not a crop~~ **Done** | — | A full set was supplied 27 Aug 2026 — the paddle alone, white on a navy disc — replacing the lockup-in-a-square that was illegible at 16px. Ownership approved the paddle as the icon mark the same day, **reversing the earlier ruling** that had closed this route. The 16px is hand-tuned, because a straight downscale reads as a dot. Method, measurements and the rejected alternatives in `public/brand/README.md` |

| A12 | **Real copy, everywhere** | Nothing technically — which is the danger | Every word on the site today was written to fill a layout and reads as finished. Named in `loose-ends.md` §6. Specifically: the home headline and sub, all promo eyebrows and titles, `summary` on each Location, the tenant descriptions, the promo landing page body, and the footer's four column names — About / Visit / Rewards / Work with us — which were invented, not specified |
| ~~A13~~ | ~~**The coffee truck's trading name**~~ **Done** | — | **Hi-Tide Coffee**, confirmed by the client after three variant spellings |
| A14 | **Whether to advertise tenants at all** | Nothing — the collection ships empty | Undecided by design (ADR 0016). If the answer is no, the cost is one unused collection |

| ~~A16~~ | ~~**How the Locations map is embedded**~~ **Decided** | — | Google My Maps, embedded via Share → Embed on my site. Free, no API key. **The map must be set to public or the embed silently renders nothing.** ADR 0019 |
| A19 | **The built map itself** — three pins, public, iframe handed over | `/contact` | Steps are in ADR 0019. The iframe goes in a CMS field, not the markup, or every future change is an engineering task |
| A17 | **A company Google account, if My Maps is used** | The map, permanently | A map built in a personal account leaves with that person. Same failure as A6, and consumer-product ownership transfer is not reliable — create it in the right account first |
| ~~A18~~ | ~~**Cookie/consent decision**~~ **Decided** | — | **No banner** — ADR 0025. No US federal or Washington cookie law applies, CCPA's thresholds are not met, and GDPR follows targeting rather than reachability. Rather than rely on that read, the site sets nothing to consent to: public pages are cookieless, TinaCMS auth lives only in `/admin`, Vercel and `next/font` set nothing. Two standing constraints: `/contact` loads the map iframe only on a click (ADR 0019 amended), and B7 must be a cookieless product |
| A20 | **Per-Location share cards** — 1200 × 630 | Nothing — the sitewide default already covers every link | **The sitewide default is done**, at `public/brand/share/share-default-2026-09.jpg`, so nothing scrapes a 26px motif any more. What is left is the better version of the same thing: the three Locations and `/truck-stop`, in that order. Size, safe area and the rules are in ADR 0022, on the designer spec sheet and in `docs/lummi-bay-asset-specs-brand-guide.pdf` |

## B. Engineering
| # | Item | Notes |
|---|---|---|
| B1 | The whole application | Phases 1–3 of `docs/roadmap.md`. Nothing is built yet |
| B2 | Vercel project + build pipeline | Previews per branch, production on the default branch |
| B3 | TinaCMS configured, editors provisioned, visual editing verified | ADR 0002/0003 |
| B4 | `exit260.com` → `lummibay.com/locations/exit-260` **301** | Permanent, not 302 — a 302 keeps the old domain in search results |
| B5 | Redirect map from the three old sites' URLs | Every indexed URL that will not exist needs a target, or search traffic lands on 404s |
| B6 | Technical SEO | Titles, meta, canonical tags, `sitemap.xml`, `robots.txt`, LocalBusiness structured data per Location |
| B7 | Analytics | Which product, and who reads it. **The product must be cookieless** (ADR 0025) — Vercel Web Analytics and Speed Insights are, and are already on the platform. **Google Analytics is ruled out**: it would hand the site a consent obligation it does not otherwise have |
| ~~B8~~ | ~~Rebuild strategy for fuel prices~~ **Settled** | Neither rebuild nor ISR — the block renders per request behind `<Suspense>` and reads the TinaCloud content API, so there is nothing to invalidate (ADR 0024). Build it wrong and it looks built: a per-request render of the **built** `content/fuel-prices.json` is exactly as stale as a static page. `output: 'export'` is now impossible twice over — ADR 0017 and ADR 0024 |
| B9 | Accessibility pass | Targets and contrast are designed; the built site still needs a real audit |
| B10 | Performance budget | Static-first makes this achievable, images are what will break it |
| B11 | Open Graph tags + the `shareImage` fields | ADR 0022. `og:image` must be an **absolute URL** — a root-relative path produces no card and no error. A required field on settings, optional per page |

## When each account is needed
Two different questions hide in "when do I set up accounts", and only one of them is about
creating anything.

**Do now — verify access to what already exists.**
| What | Why now |
|---|---|
| **Registrar logins for lummibay.com and exit260.com** | Nothing to create, but *someone at the company must be able to log in*. This has an unbounded discovery time — a domain registered years ago under a former employee's address can take weeks to recover, and it is the single most common launch-week disaster. Checking costs nothing today and can cost the launch date if left. |
| **Decide who owns the accounts** | Company-controlled identities, not an individual's personal login. Retrofitting ownership later is painful, and on Vercel specifically **owners cannot be changed during a Pro trial**. |
| **Confirm the GitHub repo sits in a company org**, not a personal account | Same bus-factor problem, and it is far easier to move now than after CI, the CMS and the host are all wired to it. |

**Create when the work needs it.**
| Account | When | Note |
|---|---|---|
| GitHub | already exists | confirm ownership, above |
| **Vercel** | Phase 1, when the app is first deployed | **Do not start the Pro trial now.** It is **14 days, one per user account** — started today it expires long before launch, and it is the only free look at Pro. Either pay from the day you connect ($20/mo during the build is noise) or hold the trial for the final fortnight. |
| **TinaCloud** | Phase 2, once there is real content to edit | Set up by whoever holds GitHub — only that person needs it. An empty CMS teaches staff nothing, so provision it when there is something to click. |
| Staff editor logins ×2 | Phase 2, at training | Decide *which two people* before provisioning: shared logins destroy the per-person history that is half the point (ADR 0013). Deferred by the client (A7) — the deadline is training, not now |
| Analytics | Phase 3 | Pick the product and the person who will actually read it. Cookieless only (ADR 0025) |
| ~~Contact form inbox~~ | ~~Phase 3~~ **never** | There is no form anywhere on the site (ADR 0015), so A10 was dropped and no inbox is nominated. Phone and address are the contact routes and there is no spam protection to build |

**The rule:** create an account when the work that needs it starts — but confirm access *today*
to anything that already exists. The registrar is the one that bites.

## C. Verify before cutover
- A staff member changes a fuel price in TinaCMS, unaided, and sees it live. **If this fails,
  nothing else matters** — it is the project's first requirement. "Live" now has a number on it:
  a hard refresh shows the new price **immediately**, not a page that catches up a minute later
  (ADR 0024). Test the failure path too, by taking the content API away — the block must fall
  back to the last deployed value, never to a blank where a price goes.
- The site on a real 320px phone, a real iPhone (Safari) and a real Android (Chrome). Anchor
  positioning is verified in Chromium only.
- Every old URL either resolves or redirects. Crawl the three source sites first to get the list.
- `exit260.com` reaches the Exit 260 page and the address bar shows `lummibay.com`.
- Prices on the site match the pumps at all four points of sale, on launch morning.
- The footer's single **Lummi Commercial Companies** link works and is the only mention.

## Running costs
| Item | Cost |
|---|---|
| **Vercel Pro — required** | **$20/mo.** Hobby is restricted to "non-commercial, personal use only" and this is a commercial site. Not optional (ADR 0013) |
| Timed promos (expire at a set time) | **included** — Pro brings per-minute scheduling at no extra cost |
| TinaCMS **Team Plus**, only if staff edits need someone's approval | $41/mo — skipped at launch (ADR 0013) |
| TinaCMS free tier | $0, 2 editor logins. Team $24/mo for 3; Team Plus $41/mo for 5 (ADR 0002) |
| Domains | existing renewals |
| **Total at launch** | **$20/mo** — all of it Vercel. The CMS is genuinely free. No database either way |

## What could move the date
1. **Art and photography.** The largest unknown, entirely outside engineering, on the critical
   path. Nothing else on this list has a comparable lead time.
2. **The logo contrast blocker.** Small, but it sits on the header, which is on every page.
3. **The redirect map.** Boring, and the thing most likely to be discovered late. Do the crawl
   early — it is a half-day task that becomes a scramble if left to launch week.
4. **Copy.** Everything currently on the page is first-draft placeholder.
