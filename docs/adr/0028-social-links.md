# 0028 — Social links in the footer: links only, never embeds

Status: Accepted. Client decision, 17 Sep 2026. Constrained by ADR 0025 (the site sets no
cookies) and ADR 0010 (touch targets). Adds checklist item **A22**.

Terms (Location): `CONTEXT.md`.

## Context
The client's answer to the structure questions:

> *"Social site links should be added to the bottom of the page, within or below the footer
> links."*

Straightforward as an ask, and it lands on the one part of the footer that carries a promise the
build has to keep. The base row says **"No cookies. Visits counted anonymously."** — a checkable
factual claim, not decoration (ADR 0025). Social platforms are the most common way a site like
this acquires cookies it never decided to set.

The distinction that matters is not *whether* to link out. It is the difference between a **link**
and an **embed**, and they arrive under the same request.

## Decision

### Links, and nothing else
The footer carries an **anchor per platform**: an icon, an accessible name, an `href` to the
account. That is the entire mechanism. A plain `<a>` to facebook.com sets nothing, loads nothing
third-party, and is invisible to the platform until somebody clicks it.

**Never**, on any page:

- Embedded feeds or timelines — a Facebook page plugin or Instagram widget loads a third-party
  iframe and script, and both set cookies on arrival, before any interaction.
- Follow buttons and like buttons, which are the same thing wearing a button.
- Share buttons that use the platforms' official widgets. If sharing is ever wanted, a plain
  intent URL is an ordinary link and is allowed; the widget is not.
- Follower counts, which cannot be fetched without calling the platform.

**This is the constraint ADR 0025 exists to create.** The no-cookie claim was written knowing it
would have to be defended against a future embed, and this is the first one to arrive. The rule
has a plain test that needs no legal reading: *does anything load from the platform's servers
before the visitor clicks?* If yes, it does not ship. The one existing exception is `/contact`'s
map, which loads only on a click and was amended into ADR 0019 for exactly this reason.

### Where it sits
**Its own row, between the footer's link columns and the base row** — "within or below the footer
links", as asked, and below rather than inside, because the columns are text links in a grid and
a strip of icons in one of those cells reads as a fifth column that lost its heading.

The base row stays as it is. It already carries the copyright, the no-cookies sentence, the
Privacy Policy link (ADR 0026) and the Lummi Commercial Companies link; a set of icons in there
would be the fifth thing on a row that is deliberately quiet.

### The accounts are content, not markup
A `social` list on the settings singleton: `platform`, `url`, and nothing else. Adding an account
is a CMS edit; so is removing one when it goes dormant.

**An empty list renders nothing** — no row, no empty container, no placeholder icons linking to
`#`. Same rule as the tenants collection (ADR 0016): a capability that is not in use is invisible,
not stubbed. This matters here because the accounts are not yet known (A22) and a placeholder icon
row is exactly the kind of thing that survives to launch.

### The footer carries the brand's accounts, not each Location's
If the three Locations run separate pages, the footer would be nine icons and a guest would have
to know which one they want. The footer is sitewide, so it carries the sitewide accounts. A
Location with its own account links to it **from its own detail page**, where the context makes it
obvious which place it belongs to. This is the same split as the phone numbers: one per place,
shown where that place is.

### How they are drawn
- **Icon plus an accessible name.** The visible label is the icon; the link's name is the
  platform, so a screen reader announces "Facebook", not "link". Never a bare icon with no name.
- **44px touch targets** (ADR 0010). The glyph is around 20px; the padding around it does the
  work, the same way the footer's text links already get a 44px hit area.
- **One colour, from the brand palette** — the platform glyph in bone on the navy footer, not each
  platform's own brand colour. Five different corporate colours in a row at the bottom of the page
  pull harder than anything above them, and the footer is the quietest part of the site on purpose.
- **Opens in a new tab**, with `rel="noopener noreferrer"`. This is the one place on the site where
  a new tab is right: the guest is leaving for a platform they will keep scrolling, and the fuel
  prices they came for should still be behind it.
- **Platform glyphs are used under the platforms' own brand guidelines**, which permit the icon for
  linking to your own account. They are not covered by the `markApproved` gate in ADR 0016 — that
  gate is for tenants' logos, where no such standing permission exists.

## Consequences
- Every future social request is answered by this ADR rather than re-litigated: linking out is
  ordinary content, bringing the platform's code onto the page is not.
- The footer's own "No cookies" sentence stays true without anyone having to re-check it.
- **A22 is a content question with a real answer needed**: which accounts exist, who controls them,
  and whether any are per-Location. Until it is answered the row does not render, so nothing is
  blocked and nothing broken ships.
- A dormant account linked from every page is worse than no link — a guest who clicks through to a
  page last posted to in 2022 learns something about the business that the site did not intend to
  say. Whoever supplies the list should be asked which ones are actually tended.
- If a campaign ever genuinely needs a feed on the page, that is a decision to reopen ADR 0025
  with, not a component to add quietly. The cost of the embed is the sentence in the footer.
