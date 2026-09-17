# Backend setup — getting the site live once it is built

A runbook, in order. Complements `docs/launch-checklist.md` (which says *what* must be true at
launch); this says *what you click, and when*. Decisions behind it: ADR 0002 (TinaCMS),
ADR 0013 (tiers and the Vercel licence), ADR 0015/0016/0018 (collections), ADR 0017 (the
emergency notice and why the build can never be a static export).

## First, what "backend" means here — and does not
There is **no database, no server to run, and no form handler.** Content is Markdown and JSON
files in this repo; Vercel builds them into static pages. So the setup below is really three
accounts wired together — GitHub, Vercel, TinaCloud — plus DNS.

Two things people expect to set up and should not:
- **No form backend.** There is no form anywhere on the site (CLAUDE.md). `/contact` carries
  hours, addresses and phone derived from Location data. Nothing to POST, nothing to email.
- **No backups to arrange.** The repo *is* the backup. Every content change is a commit with an
  author and a one-click revert (`docs/content-updates.md`).

~~The one genuinely undecided piece is the map embed on `/contact` — mechanism is open (ADR 0019),
and if it lands on a keyed provider that adds an API key and a cookie/consent question.~~

**Corrected 17 Sep 2026.** The mechanism is not open: ADR 0019 settled on an **embedded Google My
Maps**, and ADR 0025 settled the click-to-load still image in front of it, precisely so that no
third-party code loads before a visitor asks for it. So the keyed-provider worry above is resolved
rather than pending — there is no API key and no consent question, which is what keeps the
footer's "No cookies" line true.

What is genuinely outstanding is smaller and is a task, not a decision: **nobody has made the map
yet.** Someone builds it in Google My Maps with three pins, sets it public, and pastes the
`<iframe>` into `map.embedCode` plus a picture of it into `map.stillImage`. Both fields are empty
until then, and an empty map renders one section fewer on `/contact` rather than a broken page.

---

## Phase A — do these now; they have unbounded lead time
These do not wait on code, and step 1 is the single most common launch-week disaster.

1. **Prove you can log in to the registrar for `lummibay.com` and `exit260.com`.** Not "we own
   them" — actually log in. A domain registered years ago under a former employee's address can
   take weeks to recover. Checking costs nothing today and can cost the launch date if left.
   (Launch checklist A6.)
2. **Decide who owns the accounts, and make them company identities** — not anyone's personal
   login. Vercel specifically **cannot change project owners during a Pro trial**, so getting
   this wrong is expensive to unwind.
3. **Email TinaCMS and ask, in writing, whether TinaCloud Free covers commercial use.** ADR 0013
   found no prohibition but also no stated permission, and says to convert that into an actual
   answer before launch. One email.

## Phase B — Vercel project
4. **Scaffold the Next.js app** (App Router). Before anything else, confirm `next.config`
   does **not** set `output: 'export'`. Static export silently kills on-demand revalidation, and
   it would not fail loudly — the emergency notice would simply never reach anyone, and nobody
   would find out until the day it mattered (ADR 0017).
5. **Connect this repo to a Vercel project.** Production builds from the default branch; every
   other branch gets its own preview URL. That preview URL is what replaces the paid approval
   workflow we skipped — it is how a developer's change gets looked at before it is live.
6. **Choose when to pay.** Pro is **$20/mo and required, not preferred**: Hobby is restricted to
   non-commercial personal use and this is a commercial site (ADR 0013). The Pro trial is
   **14 days, one per user account** — so either pay from the day you connect ($20 during the
   build is noise) or save the trial for the final fortnight. Do not burn it early.
7. **Confirm the first deploy serves** on the `*.vercel.app` URL before touching DNS.

## Phase C — TinaCMS
8. **Create the TinaCloud project** and point it at this repo and the production branch. Only the
   person who holds GitHub needs to do this. Do it once there is real content — an empty CMS
   teaches staff nothing.
9. **Set three environment variables in Vercel**, for Production, Preview *and* Development:
   `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `NEXT_PUBLIC_TINA_BRANCH`. These are what make
   `/admin` and visual editing work; a missing one fails at the editor, not at the build.
10. **Define the collections**: `locations`, fuel prices (ADR 0004), `pages`, `mainPages`,
    `infoPages`, `promos`, `tenants`, the `siteAlert` singleton, and the settings singleton that
    points at the live main page. Label every field for a non-technical editor.
    **`promos` has a written field list — ADR 0018 §2.** Build it from there rather than from
    memory: three text fields (`eyebrow`, `headline`, `cta`) and no `body`, one 2400 × 1350
    image and not two crops, a 28-character counter on `headline`, and no `width` on the promo
    because the row owns the layout.
11. **Invite the two editors by email.** The free tier caps at **2 logins** — a third person is
    Team at $24/mo, which is a separate purchase from approvals at $41/mo.
12. **Have a real staff member edit a real page**, unaided, and watch. Then have them do it
    **from a phone browser**, because that is the device the emergency notice will be published
    from at 5am (ADR 0017).

## Phase D — the two things that must publish in seconds
13. **Wire on-demand revalidation.** Saving the `siteAlert` calls `revalidatePath('/', 'layout')`;
    Vercel updates caches in all regions within ~300ms, with no rebuild. Verify it by publishing
    a notice and seeing it appear without a deploy running.
14. **Verify a fuel price reaches every surface.** Prices are on every page, not just the price
    pages — so test a page you did not edit. Then confirm promos compute live per visitor
    (ADR 0018): an expired promo should free its slot and its row re-divide, with no scheduler.

## Phase E — domain cutover
15. **Add `lummibay.com`** to the Vercel project, point DNS at Vercel, and wait for the
    certificate to issue before announcing anything.
16. **Add `exit260.com` to the same project as a redirect** to `lummibay.com/locations/exit-260`.
    It must be a **301, permanent — not a 302**; a 302 keeps the old domain in search results.
17. **Crawl all three source sites first** and build the redirect map, then add the redirects.
    This is boring and it is the item most reliably discovered late.
18. **Leave `lcc-lummi.com` alone.** It stays as-is and appears once, as the single footer link
    (ADR 0001).

## Phase F — before you flip DNS
19. **Sitemap and robots.** An `infoPage` whose promo is not live keeps its URL but drops out of
    the sitemap and goes `noindex` — it is never deleted, or shared links break (ADR 0018).
20. **Check `output: 'export'` one more time.** It is a launch check, not a footnote.
21. **The acceptance test is a person, not a build:** a staff member changes a fuel price in
    TinaCMS, unaided, and sees it live. If that fails, nothing else matters.
22. **Confirm every old URL either resolves or redirects**, using the map from step 17.

## Running cost at launch
**$20/mo, all of it Vercel.** The CMS is genuinely free at two editors, and there is no database
either way. Upgrades are trigger-based (ADR 0013): a third editor is $24/mo, an approval step is
$41/mo, and photography over 100 MB means hosting images outside the CMS or changing the plan.
