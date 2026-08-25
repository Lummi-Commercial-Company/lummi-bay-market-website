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

## Limits worth knowing before staff are trained
- **Two editor logins** on the free tier. A third person needs Team at $29/mo (ADR 0002). Decide
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

## Fuel prices specifically
All eight prices live in one file, `content/fuel-prices.json`, and every place the site shows a
price reads from it — the block, the condensed bar, the panel, `/fuel-prices`. **Change the
number once and it changes everywhere.** There is no second copy anywhere in the site, and that
is enforced by ADR 0004, not by discipline. The safe step-by-step procedure, for both staff and
Claude, is in skill `fuel-price-update`.
