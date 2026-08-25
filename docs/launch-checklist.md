# What it takes to get this live

Two categories, and only one of them is engineering. **The client-supplied column is the one
that usually sets the date** — those items have lead times measured in weeks and cannot be
compressed by working faster.

## A. Only the client can provide these
| # | Item | Blocks | Notes |
|---|---|---|---|
| A1 | **Logo vector files** — including a reversed/light lockup | The header, on every page | Currently a chat image; not in the repo. See ADR 0006 |
| A2 | **Confirmed addresses, hours, phone numbers** | Every Location page, the footer | Present values were scraped and are marked unconfirmed |
| A3 | **Art direction + budget** — commissioned Lummi art, photography, or both | Every page's finished look | Site has no imagery at all today (ADR 0012) |
| A4 | **Cultural approval** for any Coast Salish art | Launch, unconditionally | Final art must be authentic, commissioned, or tribe-approved |
| A5 | **Pricing sign-off** — is a short stale window acceptable, and what disclaimer runs | The fuel block's footnote | Register C7. A business decision |
| A6 | **Domain control for lummibay.com and exit260.com** | DNS cutover, the 301 | Registrar login or someone who has it |
| A7 | **Two staff emails** for CMS editor logins | Staff being able to edit | Free tier is 2 seats (ADR 0002) |
| A8 | **Rewards app links** — the real App Store / Play URLs | The Rewards pill, on every page | Currently `#` |
| A9 | **Careers link destination** | Footer | Editable field, needs a target |
| A10 | **Contact form destination** — which inbox, and who monitors it | The footer form | Also decides whether spam protection is needed |

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
| Vercel Hobby | $0 — but check whether commercial use requires Pro ($20/mo) |
| TinaCMS free tier | $0, 2 editor logins. Team tier $29/mo for 5 (ADR 0002) |
| Domains | existing renewals |
| **Total** | **$0–$50/mo**, no database to run or back up |

## What could move the date
1. **Art and photography.** The largest unknown, entirely outside engineering, on the critical
   path. Nothing else on this list has a comparable lead time.
2. **The logo contrast blocker.** Small, but it sits on the header, which is on every page.
3. **The redirect map.** Boring, and the thing most likely to be discovered late. Do the crawl
   early — it is a half-day task that becomes a scramble if left to launch week.
4. **Copy.** Everything currently on the page is first-draft placeholder.
