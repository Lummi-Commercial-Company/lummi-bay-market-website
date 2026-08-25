# 0011 — A Back-to-top button, on pages over 1.75 screens only

Status: Accepted

Terms (Location, Truck Stop): `CONTEXT.md`. Interacts with the sticky header (ADR 0006),
the fuel price block's condensed state (ADR 0005), and the footer's touch targets (ADR 0010).

## Context
Pages end in a four-group footer, and on a phone the guest can be a long way from the top of
the page by the time they reach it. A sticky button that returns them to the top was asked for.

## Decision
**One `<button type="button" class="totop" aria-label="Back to top">`, fixed bottom-right**, on
every page. A `button`, not an `<a href="#top">`: nothing is being navigated to, no URL should
change, and a stray `#top` in the address bar is a URL staff will eventually paste somewhere.

**It appears after 0.75 of a viewport of scrolling, so a page shorter than 1.75 screens never
grows one.** The threshold is proportional rather than a pixel count, so it holds on a 667px
phone and a 1200px desktop without a second rule.

**Activating it moves focus to the header** as well as scrolling. Scroll position and focus
position are separate things: without the focus move a keyboard guest is returned to the top of
the page with their tab position still at the bottom of it, and the next Tab drops them straight
back into the footer they just left.

**Scrolling is smooth unless `prefers-reduced-motion: reduce`**, where it jumps. A full-page
smooth scroll is one of the larger vestibular triggers on a site this length.

**The footer reserves a gutter for it** — `padding-bottom: 78px` on a phone, 74px on desktop —
rather than the button dodging out of the way.

## What the threshold is worth, measured
Across the six built pages, the share of each page's scroll range in which the button is present:

| Threshold | Home (phone) | Exit 260 (phone) | Truck Stop (phone) | the three desktop pages |
|---|---|---|---|---|
| 1.0 viewport | 19% | never | never | never |
| **0.75** | **39%** | never | never | never |
| 0.6 | 52% | never | never | never |
| 0.5 | 60% | 11% | 3% | 10% / never / never |

At 1.0 the button reaches only the last fifth of the one page long enough to want it. At 0.5 it
flickers into existence for the final **3%** of two pages — a control that appears once the
guest has already arrived is worse than no control. 0.75 is the only setting that is generous
where the page is long and silent everywhere else.

These six pages run ~1.4–1.6 screens except phone Home at 2.25, so today only phone Home carries
the button. (An art layer briefly took desktop Home to 1.72 — 0.03 under the threshold — before
being removed; ADR 0012. Worth remembering that a 36px band is enough to move a page across
this line.) That is the rule working, not a page missing a feature: on a page you can reach the
bottom of in one flick, a floating button is an obstruction with a job that does not exist.
Real copy will lengthen these pages and more will qualify — no code changes when they do.

## The collision, and why the footer moves instead of the button
Built and measured at full scroll, before any gutter: the disc landed **directly on top of
"Lummi Commercial Companies"** with **0px** of clearance, and came within **2px** of a footer
link on all three desktop pages. That link is the one the brand rules constrain most tightly —
it is the only place other Lummi companies appear anywhere on the site — so it is the worst
available thing to park a floating control on.

A dodging button was rejected. It needs a docked state, a threshold to enter it, a transition
between the two, and it still covers something the one time the threshold is wrong. Reserving
78px of footer ground is a single declaration with no states, and blank space at the very foot
of a footer costs nothing. After: **52–60px** of clearance on every page, no overlaps.

## Consequences
- The button is `visibility: hidden` when off, not `opacity: 0`. Opacity alone leaves it in the
  tab order and clickable — an invisible control at the bottom-right of every short page.
- `bottom` carries `env(safe-area-inset-bottom)`, or it sits under the home indicator on a
  modern iPhone.
- 46px on a phone, 44px on desktop, both clearing the 44px floor in ADR 0010.
- The scroll listener is `{passive: true}` and rAF-throttled. It runs on every scroll event on
  every page, which is the one place on a static site where a careless handler is felt.
- It is one control shared by every page, so it belongs in the layout, not in a page component.
- **It restores the fuel block for free**, and this was confirmed rather than assumed. Traced
  on the phone Home page: condensed bar and button showing at full scroll → activate → scroll
  position 0, block back to its full card, button hidden itself, focus on the header lockup.
  No code in the button knows about the fuel block; ADR 0005 keys the condense to scroll
  position, so returning the scroll position returns the block. One less coupling to maintain.
