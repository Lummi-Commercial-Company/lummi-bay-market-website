# How the site gets updated

The short version: **there is no database and no admin server.** Content is a set of text files
in this git repository. Editing content means changing a file; changing a file triggers a
rebuild; the rebuild publishes. Everything below is a different front door onto that same act.

```
                    ┌──────────────────────────────────────┐
                    │  1. STAFF — TinaCMS visual editor    │
                    │     Log in by email at /admin        │
                    │     Click the price, type, Publish   │
                    └──────────────────┬───────────────────┘
                                       │
┌──────────────────────────────┐       │       ┌──────────────────────────────┐
│ 2. CLAUDE — via chat         │       │       │ 3. DEVELOPER — via git       │
│    "Set Cove diesel to 4.19" │       │       │    Edit the file, commit     │
└──────────────┬───────────────┘       │       └───────────────┬──────────────┘
               │                       │                       │
               └───────────────────────┼───────────────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │   GIT REPOSITORY (GitHub)    │
                        │  content/fuel-prices.json    │
                        │  content/locations/*.md      │
                        │  content/promos/*.md         │
                        │                              │
                        │  every change is a commit:   │
                        │  who, what, when, and undo   │
                        └──────────────┬───────────────┘
                                       │  push triggers build
                                       ▼
                        ┌──────────────────────────────┐
                        │   VERCEL — rebuild + deploy  │
                        │   ~1–2 min, automatic        │
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │   lummibay.com — live        │
                        │   static pages, no database  │
                        └──────────────────────────────┘
```

## The three doors

**1. Staff, in the browser — the normal way.** A staff member signs in at `/admin` **with their
email; no GitHub account is needed** (ADR 0002). They see the actual page, click the text or the
fuel price they want to change, edit it in a sidebar with live preview, and press Publish. They
never see git, a file, or a branch. This is the route the whole stack was chosen for — TinaCMS
needs React, which is why Next.js is the framework and not Astro (ADR 0003).

> **Tell staff this before they touch it:** after pressing Publish, the new price takes
> **one to two minutes** to appear on the site. Nothing is wrong during that time — the page
> keeps showing the old price until the rebuild finishes, so visitors never see a broken or
> blank page. **Do not press Publish again.** A second publish does not make it faster; it
> starts a second build.
>
> *Confirmed in production on 29 Sep 2026: a price changed in the editor became the commit
> `cf76e3a "TinaCMS content update"`, and appeared on every page that shows prices after the
> rebuild. The refresh done a few seconds after Publish still showed the old price — which is
> exactly the behaviour described here, and exactly what will generate the first support call
> if nobody is told.*

**2. Claude, in chat.** "Set Fisherman's Cove diesel to 4.19" — Claude edits
`content/fuel-prices.json` and pushes a commit. Same file, same rebuild, same result. This works
*because* content is files in the repo; it would not be possible against a hosted CMS database.
The exact procedure is in skill `fuel-price-update`.

**3. A developer, directly.** Edit the file, commit, push. For bulk changes and anything
structural.

All three converge on the same commit. There is no separate "CMS content" that can drift from
what is in the repository.

## What that buys you
- **Every change is a commit** — who changed what, when, and a one-click revert. A wrong fuel
  price is undone by reverting, not by remembering the old number.
- **Nothing to back up.** The repository *is* the backup, and it is already mirrored on GitHub
  and on every clone.
- **No database, no CMS server, no security patching, no monthly database bill.**
- **The site cannot go down because the CMS went down.** Published pages are static files on a
  CDN. If TinaCMS is unreachable, staff cannot *edit* — visitors are unaffected.

## Timing, honestly
A publish is **not instant**. Push → build → live is roughly **one to two minutes**, and a
CDN-cached page can lag a little further. For hours, promos and store copy that is irrelevant.
**For fuel prices it is the one real trade-off of a static site** (register C7, ADR 0004) — if a
price must be correct to the minute, this stack is the wrong shape and that should be said out
loud now rather than discovered at launch.

## Is there a staging site?
**Three different things get called staging, and they cost differently.** Two are free and
already part of the stack; the third is the one people usually mean, and it is $41/mo.

**1. Preview while you edit — free, built in.** TinaCMS visual editing renders the real page
with your change as you type, before you press Publish. This is precisely why the stack is
React/Next.js rather than Astro (ADR 0003). It answers "let me see it before it goes live" for
the person making the edit.

**2. A shareable URL for developer changes — free, automatic.** Vercel builds a preview
deployment for every branch, each with its own URL. Anything a developer or Claude changes can
be looked at, and sent to someone, before it touches production.

**3. Staff edits landing on a branch for someone *else* to approve.** That is TinaCMS
**Editorial Workflow**: the editor saves to a new branch, a draft pull request is opened, a
configured `previewUrl` gives a branch-specific link, and publishing means merging the PR.
Verified against tina.io (Aug 2026): it is **Team Plus at $41/mo** — not free, and *not* Team
at $24.

**The distinction that decides whether you need to pay:** 1 and 2 are *view before live*. 3 is
*someone else approves before live*. Only the second costs money, and only some organisations
want it.

### The free workaround, and its catch
Point the single TinaCloud project at a `staging` branch rather than `main`. Staff edits land on
staging, Vercel gives staging its own URL, and going live is a merge — a button in GitHub, or
Claude in chat. Costs nothing.

Two catches. **The free tier allows one project**, so this is staging *instead of* production
editing, not alongside it. And publishing stops being self-service, which works against the
project's first requirement.

That matters unevenly, and it is the thing to think about before choosing:
**fuel prices want to be instant and self-service; promos and page copy want review.** A single
global gate makes price changes slow, which is the one thing this site cannot afford. Do not put
prices behind an approval step to get review on copy.

**Recommendation: start free.** Live preview plus branch previews cover "view before live" on day
one. Revisit Editorial Workflow once there is evidence staff want an approval step — and when
that comes up, check whether they want it for *promos and copy* rather than for prices, because
the answer changes what is worth buying.

## Limits worth knowing before staff are trained
- **The free tier caps assets at 100 MB and allows one project.** The asset cap is worth knowing
  *now*, while photography is still an open decision — a modest set of store photos will exceed
  it, and that pushes either the plan or where images are hosted.
- **Two editor logins** on the free tier. A third needs Team at $24/mo (ADR 0002). Decide
  who the two are before provisioning — shared logins destroy the per-person audit trail that is
  half the point.
- **Staff edit content, not layout.** They can change prices, hours, copy, promos, and the
  Careers link. They cannot move a section, change a colour, or add a page. That is deliberate:
  the promo builder was rejected specifically because handing layout to non-designers is *harder*
  for them, not easier (ADR 0007).
- **Two people editing the same field at once** will conflict. With two seats this is unlikely,
  but the answer is "the second person re-edits", not a merge dialog.
- **A publish can fail.** If a build breaks, the previously published site stays up — visitors
  see the old page, not an error. Someone still has to notice and fix it, so build failures need
  to reach a human.

## Scheduling: can a promo take itself down at noon?
**Yes, but it costs $20/mo, and that is worth knowing before it is promised to anyone.**

A static page does not know what time it is — it was rendered when someone last pushed. So
"expires at noon" needs something to *happen* at noon. Three ways, verified Aug 2026:

| Mechanism | Precision at noon | Cost |
|---|---|---|
| **Vercel Cron → `revalidatePath`** | exact, per-minute | **Vercel Pro, $20/mo** |
| Same, on Vercel **Hobby** | **not possible** — one run per day, ±59 min | $0 |
| Time-based ISR (`revalidate`) | late by the interval, **plus one stale page view** | $0 |
| Dynamic promo slot (page static, promo rendered per request) | exact | $0 + a function call per view |

The trap is the second row. Vercel's Hobby plan allows **one cron run per day with per-hour
precision** — a job set for 12:00 fires somewhere in the noon hour — and a more frequent
schedule *fails at deploy* rather than quietly running late. So the obvious answer ("just add a
cron") is not available on the plan this project was costed at.

Two smaller details that decide the feel of it:
- **Time-based ISR is late twice, not once.** The interval has to elapse, and then the first
  visitor after it still gets the expired page while the new one builds behind them. The visitor
  after that gets the correct page.
- **`output: 'export'` must never be set.** Next.js static export supports neither ISR nor
  on-demand revalidation, so that one line would remove every option above except the one we
  rejected.

Full reasoning in ADR 0007.

## "Can't we just refresh the price pages?"
No — because **the price block is on every page** (ADR 0005), so there is no smaller set to
refresh. Refreshing prices is refreshing the site.

What that choice really trades is *eager against lazy*. A full rebuild re-renders every page up
front, takes one to two minutes, and ships as one atomic deployment you can roll back.
On-demand refreshing marks every page stale in seconds and re-renders each one when its next
visitor arrives — nobody ever sees a stale price, but the first visitor to each page waits for
one render, and the site now has two publishing paths instead of one.

For a site of about ten pages, the rebuild is the sane default: code changes need a build
anyway, and prebuilt pages cost nothing to serve. **If prices genuinely have to be current
within seconds, the answer is neither** — it is to stop baking prices into the page and render
that one block per visitor. See ADR 0004.

## Fuel prices specifically
All eight prices live in one file, `content/fuel-prices.json`, and every place the site shows a
price reads from it — the block, the condensed bar, the panel, `/fuel-prices`. **Change the
number once and it changes everywhere.** There is no second copy anywhere in the site, and that
is enforced by ADR 0004, not by discipline. The safe step-by-step procedure, for both staff and
Claude, is in skill `fuel-price-update`.
