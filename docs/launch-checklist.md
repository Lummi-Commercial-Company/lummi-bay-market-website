# What it takes to get this live

Two categories, and only one of them is engineering. **The client-supplied column is the one
that usually sets the date** — those items have lead times measured in weeks and cannot be
compressed by working faster.

## A. Only the client can provide these
| # | Item | Blocks | Notes |
|---|---|---|---|
| ~~A1~~ | ~~**Logo vector files** — including a reversed/light lockup~~ **Done** | — | Delivered as PNG in `public/brand/`. The vector was rejected on colour fidelity; masters stay with the designer. ADR 0006, amended |
| ~~A2~~ | ~~**Confirmed addresses, hours, phone numbers**~~ **Done** | — | All three Locations confirmed by the client, plus both Exit 260 numbers. Every scraped value proved correct. In `location-content-model` |
| A15 | **Two Location names** | Every page that prints them | The client writes "Lummi Bay Market **Minimart**" (one word) and "Lummi Bay Market Fisherman's Cove" (no "at"); this project had "Mini Mart" and "at Fisherman's Cove". Exit 260 does use "at". Not changed — a business's own name printed wrong is not a detail. `navLabel` is a separate field and is unaffected |
| A3 | **Art direction + budget** — commissioned Lummi art, photography, or both | Every page's finished look | Site has no imagery at all today (ADR 0012). Note the CMS free tier caps assets at **100 MB** — a real photo set exceeds it |
| A4 | **Cultural approval** for any Coast Salish art | Launch, unconditionally | Final art must be authentic, commissioned, or tribe-approved |
| A5 | **Pricing sign-off** — is a short stale window acceptable, and what disclaimer runs | The fuel block's footnote | Register C7. A business decision |
| A6 | **Domain control for lummibay.com and exit260.com** | DNS cutover, the 301 | Registrar login or someone who has it |
| A7 | **Two staff emails** for CMS editor logins | Staff being able to edit | Free tier is 2 seats (ADR 0002) |
| A8 | **Rewards app links** — the real App Store / Play URLs | The Rewards pill, on every page | Currently `#` |
| A9 | **Careers link destination** | Footer | Editable field, needs a target |
| ~~A10~~ | ~~**Contact form destination**~~ **Dropped** | — | There is no form anywhere on the site (ADR 0015). Phone and address are the contact routes, so there is no inbox to nominate and no spam handling to build |
| A11 | **A favicon mark** — new art, not a crop | The browser tab, every page | The supplied set carries the full 3:1 lockup, illegible at 16px. Paddle-alone ruled out by ownership, so a monogram or other device must be designed and approved |

| A12 | **Real copy, everywhere** | Nothing technically — which is the danger | Every word on the site today was written to fill a layout and reads as finished. Named in `loose-ends.md` §6. Specifically: the home headline and sub, all promo eyebrows and titles, `summary` on each Location, the tenant descriptions, the promo landing page body, and the footer's four column names — About / Visit / Rewards / Work with us — which were invented, not specified |
| ~~A13~~ | ~~**The coffee truck's trading name**~~ **Done** | — | **Hi-Tide Coffee**, confirmed by the client after three variant spellings |
| A14 | **Whether to advertise tenants at all** | Nothing — the collection ships empty | Undecided by design (ADR 0016). If the answer is no, the cost is one unused collection |

| ~~A16~~ | ~~**How the Locations map is embedded**~~ **Decided** | — | Google My Maps, embedded via Share → Embed on my site. Free, no API key. **The map must be set to public or the embed silently renders nothing.** ADR 0019 |
| A19 | **The built map itself** — three pins, public, iframe handed over | `/contact` | Steps are in ADR 0019. The iframe goes in a CMS field, not the markup, or every future change is an engineering task |
| A17 | **A company Google account, if My Maps is used** | The map, permanently | A map built in a personal account leaves with that person. Same failure as A6, and consumer-product ownership transfer is not reliable — create it in the right account first |
| A18 | **Cookie/consent decision** | Any third-party embed | The site tracks nobody today and has no banner. An embedded Google map loads third-party code and sets cookies; a static image does not |

## B. Engineering
| # | Item | Notes |
|---|---|---|
| B1 | The whole application | Phases 1–3 of `docs/roadmap.md`. Nothing is built yet |
| B2 | Vercel project + build pipeline | Previews per branch, production on the default branch |
| B3 | TinaCMS configured, editors provisioned, visual editing verified | ADR 0002/0003 |
| B4 | `exit260.com` → `lummibay.com/locations/exit-260` **301** | Permanent, not 302 — a 302 keeps the old domain in search results |
| B5 | Redirect map from the three old sites' URLs | Every indexed URL that will not exist needs a target, or search traffic lands on 404s |
| B6 | Technical SEO | Titles, meta, canonical tags, `sitemap.xml`, `robots.txt`, LocalBusiness structured data per Location |
| B7 | Analytics | Which product, and who reads it |
| B8 | Rebuild strategy for fuel prices | Scheduled rebuild vs ISR (ADR 0007's mechanism list applies to prices too) |
| B9 | Accessibility pass | Targets and contrast are designed; the built site still needs a real audit |
| B10 | Performance budget | Static-first makes this achievable, images are what will break it |

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
| Staff editor logins ×2 | Phase 2, at training | Decide *which two people* before provisioning: shared logins destroy the per-person history that is half the point (ADR 0013) |
| Analytics | Phase 3 | Pick the product and the person who will actually read it |
| Contact form inbox | Phase 3 | Also decides whether spam protection is needed |

**The rule:** create an account when the work that needs it starts — but confirm access *today*
to anything that already exists. The registrar is the one that bites.

## C. Verify before cutover
- A staff member changes a fuel price in TinaCMS, unaided, and sees it live. **If this fails,
  nothing else matters** — it is the project's first requirement.
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
