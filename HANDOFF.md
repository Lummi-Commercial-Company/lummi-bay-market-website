# Handoff — Lummi Bay Market website

**Read this first, then `CLAUDE.md`.** Written at the end of the design session (Aug 2026) for
whoever picks this up next, human or Claude.

## Start here
1. `CLAUDE.md` — the project's source of truth. Stack, hard rules, locked architecture.
2. `CONTEXT.md` — the domain language. Use these words: Location, Truck Stop, Amenity.
3. `docs/adr/` — **13 decisions**, each with its reasoning, its measurements, and what was
   rejected. Read 0004, 0005 and 0013 before touching anything.
4. `docs/roadmap.md` — the work, in order.
5. `docs/loose-ends.md` — **the most important file for deciding what to do next.** Gaps nobody
   closed, traps that cost time, and the assumptions the whole design rests on that nobody has
   tested.

The skills in `.claude/skills/` load automatically. Do not paste their contents anywhere.

## Where this actually stands
**Zero lines of application code.** No `package.json`, no Next.js app, no components. What exists
is a locked stack, thirteen recorded decisions, a content model, and a browser-verified
interaction proof for the hardest component on the site. That work is real and de-risks the build.
**The build has not started.** Nothing here should be read as "nearly done."

Latest work is on branch `claude/grill-with-docs-0twl4v`, tip `6287d79`. Merge or branch from it.

## What is locked — do not relitigate without a reason
- **Stack**: Next.js App Router + React + TinaCMS + Vercel Pro. TinaCMS needs React, which is why
  not Astro (ADR 0003).
- **Nav is three items**: Home · Locations · Truck Stop (ADR 0008).
- **The logo is untouchable** — never redraw, recolour or restyle it (CLAUDE.md).
- **Other Lummi companies appear once**, as a single footer link. Nowhere else.
- **Coast Salish art must be authentic, commissioned, or tribe-approved.** Do not generate
  formline, even as a placeholder. An illustrated layer was built and rejected (ADR 0012).
- **Prices live in one file** and every surface reads from it (ADR 0004).
- **$20/mo**, all Vercel — Pro is required because Hobby forbids commercial use (ADR 0013).

## What is open and needs a person, not a build
In priority order. The first three are from `docs/loose-ends.md` and matter more than any code:

1. **Nobody has looked at analytics for the three source sites.** The whole IA assumes fuel prices
   are the primary draw and that has never been checked. Half a day, largest blast radius.
2. **Nobody has watched staff change a price today.** The CMS model was reasoned, never observed.
3. **Colour contrast has never been measured** — cedar on white at small sizes, and body copy at
   70–75% opacity. The palette is locked, so a failure becomes a usage rule.
4. **Phase 0 blockers** (`docs/roadmap.md`): logo vectors + a reversed lockup, the navy-on-navy
   header, confirmed hours and addresses, an art direction, the pricing decision, and registrar
   access for lummibay.com and exit260.com.
5. **Register items C5, C7, C9** — in `docs/proofs/fuel-strip-proof.html`. C7 is a business call.

## How this project works
- **Decisions go in `docs/adr/`**, including rejected ones (see 0012). A rejected decision that
  stays recorded is cheaper than rediscovering the same two defects.
- **Measure, do not argue.** The harness is in `docs/proofs/scripts/` — Playwright against
  `docs/proofs/fuel-strip-proof.html`. Several designs in here were reversed *because* the browser
  disagreed with a plausible argument: three-across location cards, the Back-to-top threshold, the
  promo's position, the two-column footer.
- **Verify vendor claims against vendor docs before answering.** Four out of four "free tier"
  assumptions in this project turned out to have a catch.
- **Delegate to the agents in `.claude/agents/`** to keep the main thread lean.
- **Read prices, addresses and hours from data.** Never hard-code them in a page.
- Ask before adding dependencies, pages, or nav items.

## Things that will confuse a new session
- **`docs/proofs/fuel-strip-proof.html` does not ship.** Its CSS makes one file demonstrate six
  frames at two widths. Write the components fresh against the ADRs; treat the file as a lab
  notebook. Same for `launch-plan.html`.
- **There is a sibling repo, `Lummi-Commercial-Company/Lummi-Bay-Market`** — a PHP + MySQL
  digital-signage builder for in-store pricing signs. Different product, same org, similar name,
  **and its own ADRs numbered 0001–0012 on entirely different subjects.** Do not cross the two.
- **Git remote quirk (this container only):** the repo was transferred to the org, and credentials
  are keyed to the old `Sky-SRCR` path. Pushing to the old URL works via GitHub's transfer
  redirect; "correcting" the remote to the canonical org URL breaks authentication. A fresh
  session sourced from the org repo will not have this problem.
- Two published artifacts hold the same content as `docs/proofs/`, at stable URLs. The repo copies
  are canonical.

## What the owner cares about
Stated or demonstrated across the session, worth knowing before proposing anything:
- **Easy updates by non-technical staff is requirement number one.** Anything that slows a fuel
  price change is suspect — that is why the approval workflow was skipped (ADR 0013).
- **Restraint.** An illustrated art layer was built to the brief and rejected as too much. Warmth
  is wanted; decoration is not.
- **Advertising stays plain.** "Without adding too much creative elements with the advertising."
- **The Truck Stop and Exit 260 are two c-stores on one property** — two fuel needs, two customer
  types. This is a business fact and it drives the data model, not a layout preference.

## A known failure mode to watch for
The errors that reached the owner in this session were nearly all the same shape: **a rule written
correctly, then applied to the case that prompted it rather than everywhere it belonged.** DEF
shown at a place that does not sell it; the panel's "carries what is off screen" rule applied to
Locations but not the Truck Stop; "just refresh the price pages" when prices are on every page.
When you write a rule, check every place it should apply.

## Suggested opening message for a new session
> Read `HANDOFF.md`, then `CLAUDE.md` and `docs/loose-ends.md`. We are at Phase 0 of
> `docs/roadmap.md` — no application code exists yet. Do not start building until we have
> discussed the three untested assumptions at the top of `loose-ends.md`.
