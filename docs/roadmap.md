# Next steps

Where this actually stands: **93 tracked files, none of them application code.** No
`package.json`, no Next.js app, no components. What exists is a locked stack, eighteen decisions
(`docs/adr/`), a content model, and a browser-verified interaction proof for the hardest
component on the site. That is real work and it de-risks the build — but the build has not
started, and nothing on this list should read as "nearly done."

The proof sheet is a standalone HTML page used to settle behaviour. **It is not the site and no
part of it ships.** Its CSS was written to make one file demonstrate six frames; the React
components get written fresh against the ADRs.

See also `docs/loose-ends.md` — the gaps that never became decisions, and the assumptions the
design rests on. `HANDOFF.md` names it the most important file for deciding what to do next.

## Phase 0 — unblock (parallel, mostly not engineering)
These gate later phases and none of them are code. Start them now because they have lead times.

1. ~~**The logo files.**~~ **Done.** In the repo at `public/brand/`, as PNG — a supplied vector
   was rejected because its paddle did not match the approved art. Vector masters stay with the
   designer by decision, not oversight.
2. ~~**Resolve the navy-on-navy header.**~~ **Done — the header stays navy.** A reversed lockup
   was supplied, so the light-ground alternative was never needed. See the amendment to ADR 0006.
2a. ~~**A favicon mark.**~~ **Done — 27 Aug 2026.** A full set was supplied and ownership
   approved the paddle alone as the icon mark, reversing the earlier ruling against it. The old
   set carried the full lockup, a 3:1 band unreadable at 16px; the new one is the paddle on a
   navy disc, with the 16px weight hand-tuned. **No logo item is open.** See A11.
3. **Confirm addresses, hours and phone numbers.** Everything in `location-content-model` was
   pulled from lcc-lummi.com and is marked unconfirmed. Hours must come back in the short form
   (`6am–9pm`) — there is a measured length budget on the Location card line (ADR 0009).
4. **Decide art direction.** The site currently has no illustration or photography of any kind;
   the illustrated layer was built and rejected (ADR 0012). Options are commissioned Lummi art,
   photography of the three stores, the company's sasquatch, or some mix. This has a budget and
   a lead time and it sits on the critical path.
5. **Verify registrar access for lummibay.com and exit260.com**, and decide who owns the
   accounts. Nothing to build — but a domain nobody can log into is discovered at cutover, and
   recovering one registered years ago under a former employee's address takes weeks. Costs an
   afternoon now. See the account timing table in `docs/launch-checklist.md`.
6. **Answer the pricing question (register C7).** If a posted price is stale for two minutes
   after a rebuild, is that acceptable, and does the site carry an "updated" stamp and a
   "prices subject to change" line? This is a business call, not a design one — it belongs with
   whoever owns pricing.

## Phase 1 — scaffold
6. `create-next-app` (App Router, TypeScript), the locked tokens from `brand-system` as CSS
   custom properties, Google Fonts (Space Grotesk + Inter) self-hosted or `next/font`.
7. Vercel project, connected to the repo, deploying previews on every branch.
8. The layout shell: sticky header, footer, waterline, the Rewards pill, Back-to-top (ADR 0011).
   Owner: frontend-engineer with design-director.

## Phase 2 — data and CMS
9. `content/locations/*.md` and `content/fuel-prices.json` per `location-content-model` and
   ADR 0004. **Data first, pages second** — every page reads from these and nothing is
   hard-coded.
10. TinaCMS: collections, field labels written for non-technical staff, visual editing wired,
    two editor logins provisioned (ADR 0002/0003). Owner: backend-engineer.
11. **Verify a real staff member can change a fuel price and see it live**, without help. That
    is the project's first requirement; test it before building more pages on top.

## Phase 3 — pages
12. The fuel price block. The largest single component and the one with the most decisions
    behind it (ADR 0005) — build it from the ADR, not by copying the proof sheet.
13. Home · Locations index · three Location pages · Truck Stop · Rewards · Fuel Prices · About.
14. Promo region and the TinaCMS promo collection (ADR 0007), including scheduling.
15. Copy: copy-editor merges the three source sites into one voice. Currently first-draft
    placeholder throughout.

## Phase 4 — launch
See `docs/launch-checklist.md`.

## Still undecided, and cheap to leave that way
- **Register C5** (panel height at 200% text) and **C9** (`updated` stamp stored vs derived).
  Both have recommendations; neither causes rework if settled later.
- **Safari/Firefox verification of CSS anchor positioning.** Only Chromium was testable here.
  Phones only, and the fallback is a ten-line script whose component shape is identical.
