# 0029 — Where the approved templates and the spec sheet disagreed

Status: Accepted. Client decisions, 29 Sep 2026, each asked and answered separately. Amends
**ADR 0008** (the phone nav) and **ADR 0010** (the phone header it measured). Constrained by
**ADR 0001** (other Lummi companies) and **ADR 0010** (44px touch targets).

Terms (Location, Truck Stop): `CONTEXT.md`.

## Context
Comparing the built site against the page templates the owner approved
(`docs/proofs/contact-page-template.html`, `home-review.html`) sorted every difference into
three groups: drift (fixed), decisions taken after the templates (no action), and four places
where **two approved sources disagreed and the build had followed one of them**. Those four
were not the build's to settle, so each went to the owner as its own question.

One measurement drove the first two. The phone header — lockup, three nav links, the Get the
App pill — needs about **430px**. Checked at true device widths, the pill was clipped at 320,
360, 375, 384, 390, 393, 402 and 414px. That is nearly every phone in use: StatCounter's
worldwide mobile figures for August 2026 put five of the six most common sizes under 400px
(360×800, 390×844, 393×873, 384×832, 360×780 — about 29% of traffic together), and 402px is
the current iPhone 17. Only the Plus and Pro Max sizes cleared it. ADR 0010 had measured the
header fitting at 375 / 360 / 320 in August; it no longer did.

## Decisions

**1. On a phone the nav goes behind a ☰ menu** — as the approved template draws it. Below
768px the three links leave the header; a 44×44 ☰ button sits at the right, after the pill,
and opens the same three items (Home · Locations · Truck Stop) in a panel under the header.
The nav is still three items (ADR 0008); only where a phone shows them has changed. The
header now fits at every width down to 320px.

The template draws the button, not what it opens, so the panel is the minimum that works: the
header's own colours, 48px rows, the current page marked as on desktop. It closes on Escape
(returning focus to the button), on a tap outside, and on navigation.

**2. The logo stays the spec sheet's size** — 95×34 on a phone, 112×40 on desktop — not the
smaller 28px / 34px-tall lockup the templates draw. With the nav off the phone header, the
larger lockup fits.

**3. The footer is the template's four headed columns** — About · Visit · Rewards · Work with
us — not the single row of links `CLAUDE.md` described. The single row was written on 25 Aug;
the four columns were built into the template on 26 Aug and carried through to approval, and
no decision ever flattened them. Three items the template draws are left out, each for a
recorded reason:

- **"Salish Village" under About.** Salish Village is an LCC development, one of LCC's other
  businesses (`CONTEXT.md`). Other Lummi companies appear only as the single "Lummi
  Commercial Companies" link — a hard rule (ADR 0001). ADR 0016 avoided the name for the
  tenants page for the same reason.
- **"All fuel prices" under Rewards.** Dropped 18 Sep (ADR 0008, amended).
- **"No cookies. Visits counted anonymously."** Moved to `/privacy` on 29 Sep (ADR 0025,
  amended).

The social row (ADR 0028), which the template predates, sits between the columns and the base
row. "Visit" is derived from the Location records, never typed.

**4. Small text matches the templates** — labels, badges and button text at the 9–12px the
templates draw, not the spec sheet's 14px floor. **Touch targets do not shrink with the
text:** every tappable thing stays 44px tall on a phone (ADR 0010). The templates draw footer
links touching one another; that is a drawing shortcut, not a spec, and the rows keep their
44px.

## Consequences
- ADR 0008's line "three items sit comfortably on a phone without a hamburger" is superseded.
  The three-item rule itself stands.
- ADR 0010's phone header measurements (nav items 53–58px wide, the width budget at
  375 / 360 / 320) describe a header that no longer carries the nav. Its footer rule — two
  columns, 44px rows — stands, and the new footer keeps it.
- The spec sheet's 14px type floor no longer describes labels and badges. Where the two differ,
  the approved templates win for small text and the spec sheet wins for the logo.
- The "Get the App" pill still switches to "★ App" below 375px (ADR 0010). With the nav gone
  the full label would now fit there too; that is a separate, smaller call.

## Rejected
- **Keeping the links visible and shrinking the pill to "★ App" on every phone.** Keeps ADR
  0008's one-tap nav, but was never measured to fit at 360px, and the Rewards pill is the one
  product control in the header.
- **The template's smaller logo as the fix.** It frees about 17px, which fixes 414px and up
  and none of the common phones below it.

## Amendment — staff can add footer links, 30 Sep 2026

Asked how footer links are added later, the owner chose an editable list over routing every new
link through an engineer. **Site settings → Footer links → Extra footer links**: each row is link
text, an address and a column, and appears after that column's own links. The four columns and
their fixed links are unchanged.

An open list is the one place staff can put arbitrary text in the footer, which puts the hard rule
on other Lummi companies within an editor's reach. So the site enforces it rather than the form
merely warning: a row whose **text** names another Lummi business (Silver Reef, Loomis Trail,
Salish Village, LCC) is not shown, and the build log says why. It reads the text, never the
address, because the rule governs mentions, not destinations (ADR 0001, amended 17 Sep 2026) — the
same reason "Careers" may point at silverreefcasino.com. Addresses are limited to a page on this
site or an `https://`, `mailto:` or `tel:` link, so a pasted `javascript:` link cannot run. Both
checks live in `lib/footer-links.ts`, with tests.
