# 0017 — An emergency notice, publishable in seconds, on every page

Status: Accepted

Terms (Location, Truck Stop): `CONTEXT.md`. Sits above ADR 0005's price block in the sticky
header, uses the collection mechanism in ADR 0015, and depends on the build **not** being a
static export.

## Context
ADR 0015 gives the main page a swap: build a replacement, point the settings singleton at it,
publish. That is right for a planned campaign and wrong for weather. It is a **rebuild** — the
pointer commits to git and triggers a deploy — and it is blunt, replacing a whole page when the
thing that changed is one sentence.

The ask is for a snowstorm, a power cut, a road closure: something true for a few hours that
every visitor needs, whichever page they landed on, and that has to be live in minutes rather
than on the next build. *"I'd rather have it and not use it than need it and not have it."*

## Decision

**A `siteAlert` singleton, rendered by the layout, on every page.** One document with
`active`, `headline`, `detail`, an optional `link`, and an `updated` stamp. When `active` is
false nothing renders — no empty bar, no reserved space.

**It rides inside the sticky header wrapper.** An emergency notice that scrolls away is a
notice the guest can miss by flicking once. It sits under the waterline, above everything else,
and stays with them.

**Publishing is on-demand revalidation, not a rebuild.** Verified against Vercel's own
documentation rather than assumed: on revalidation *"all caches across all regions update within
300ms"*, and it runs in the background while visitors keep getting the cached page. Saving the
alert calls `revalidatePath('/', 'layout')`; the notice is live globally in under a second,
with no deploy.

**This is the reason the build can never be `output: 'export'`.** `loose-ends.md` §4 already
recorded that static export silently kills ISR and on-demand revalidation, and treated it as a
promo-scheduling problem. It is now the emergency path as well. Export would not fail loudly —
the notice would simply never reach anyone, and nobody would find out until the day it
mattered. Elevated here so it is a launch check rather than a footnote.

**The header's height is no longer a constant.** ADR 0005's revision pins the fuel block flush
to the underside of the header; a notice makes that underside move. The sticky offset is
therefore **measured from the header wrapper at runtime** and published as a custom property,
not written as a number. Verified with the notice both on and off: the block sits flush at 0px
in both states.

**Wording rules.** Lead with what is true and useful — *"All three stores are open"* — before
the caveat. Name the Location and the road. Carry the `updated` stamp, because a notice with no
time on it is worthless by the second hour and actively misleading by the next morning.

## Consequences
- **Somebody has to be able to publish it at 5am.** The free tier is two editor logins
  (ADR 0002/0013). If both belong to people who are asleep, or on a laptop at the office, this
  mechanism does not work when it is needed. TinaCMS is editable from a phone browser; that
  should be tested by the person who would actually be doing it, in the dark, once.
- **Taking it down matters as much as putting it up.** A stale storm notice on a sunny Tuesday
  costs more credibility than never having posted one. The `updated` stamp makes staleness
  visible; nothing enforces removal.
- The notice is not a promo. It uses navy-deep and bone, not the promo field, and it is never
  used for an offer. If it becomes a marketing surface it stops being believed, and then it
  does not work for weather either.
- No dismiss control at launch. A dismissed notice cannot be un-dismissed by us, and the whole
  point is that everyone sees it. Revisit if a long-running notice ever needs one.
- Scheduling is out of scope. An emergency is not known in advance; `active` is a switch a
  person throws.
