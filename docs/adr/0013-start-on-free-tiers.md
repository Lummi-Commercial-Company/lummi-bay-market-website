# 0013 — Start on the free tiers, with one exception the licence forces

Status: Accepted

Plans and pricing verified against vendor documentation, August 2026. Interacts with ADR 0002
(TinaCMS), ADR 0007 (promo scheduling) and register item C7.

## Context
Three paid features had been identified as possibly necessary at launch: TinaCMS Editorial
Workflow for an approval step, Vercel Pro for timed promos, and a higher CMS tier for asset
storage. The instruction was to start free and skip Editorial Workflow.

## Decision
**Skip Editorial Workflow. Staff edit production directly.** "View before it goes live" is
covered without paying for it: TinaCMS visual editing renders the real page with the change as
the editor types, and Vercel builds a preview URL for every branch, which covers anything a
developer or Claude changes. What Editorial Workflow adds is *someone else approving* before
publish — a different need, and one nobody has yet asked for. It is Team Plus at $41/mo when
that changes.

**TinaCMS stays on Free**: 2 editor logins, 1 project, 100 MB of assets.

**Vercel cannot stay on Hobby, and this is not a preference.** Vercel's fair-use guidelines
state that "the Hobby plan restricts users to non-commercial, personal use only." Lummi Bay
Market is a commercial retail business. **Vercel Pro at $20/mo is required by the terms of
service**, independently of any feature we want. Deploying a commercial site on Hobby risks the
project being paused, which for a site whose job is posting fuel prices is not a risk worth
carrying to save $20.

## Consequences
- **Running cost at launch is $20/mo**, not $0. All of it is Vercel; the CMS is genuinely free.
- **The promo-scheduling constraint disappears as a side effect.** ADR 0007 recorded that a
  promo which ends at noon needs Vercel Pro, because Hobby cron runs once a day with per-hour
  precision. Since Pro is now required anyway, **per-minute scheduling is available at no
  additional cost**. Timed promos went from "$20/mo extra" to "included."
- That makes the promo mechanism a real choice rather than a forced one. The dynamic promo slot
  (ADR 0007, mechanism 3) is still the recommendation — it needs no scheduler to maintain and is
  the framework's default rendering model — but scheduled revalidation is now viable too.
- **No approval gate means mistakes are corrected, not prevented.** That is an acceptable trade
  *because* every change is a commit with an author and a one-click revert (see
  `docs/content-updates.md`). It would not be acceptable without that.
- **Prices keep instant self-service publishing**, which is the outcome that mattered most: a
  global approval gate would have slowed the one thing this site cannot afford to slow.
- **The 100 MB asset cap is now a live constraint on the art-direction decision**, not a
  footnote. A real set of store photographs exceeds it. Either images are hosted outside the CMS,
  or the plan changes. Decide it as part of art direction, not after.
- Two editor logins remain the cap. A third editor is Team at $24/mo — which does *not* include
  Editorial Workflow, so "we need a third person" and "we need approvals" are separate purchases
  at separate prices.

## Revisit triggers
Buy the upgrade when the trigger fires, not before:

| Trigger | Buy | Cost |
|---|---|---|
| A third person needs to edit | TinaCMS Team | $24/mo |
| Someone must approve staff edits before they publish | TinaCMS Team Plus | $41/mo |
| Photography exceeds 100 MB | a higher CMS tier, or host images elsewhere | TBD |

## Open
- **Vercel's commercial-use rule was verified; TinaCMS's was not.** Tina's Free tier is presented
  as an ordinary product tier and no commercial restriction was found, but that is absence of
  evidence rather than evidence of absence. **Confirm before launch**, since it is the same class
  of problem the Vercel check just caught.
- If $20/mo is genuinely a blocker, Netlify is the recorded fallback host (CLAUDE.md). Its free
  tier terms would need the same check, and the redirect and revalidation behaviour would need
  re-verifying — it is not a drop-in.
