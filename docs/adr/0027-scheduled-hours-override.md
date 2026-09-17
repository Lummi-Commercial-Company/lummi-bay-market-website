# 0027 — A second hours line, on a date window

Status: Accepted. Client decision, 17 Sep 2026. Reuses the date-window engine from ADR 0018
and sits alongside — not inside — the emergency notice of ADR 0017.
Changes the Location schema in `location-content-model`. Closes checklist ★B of
`docs/information-needed.md`.

Terms (Location, Truck Stop): `CONTEXT.md`.

## Context
The question put to the client was whether any Location's hours vary by day, season or holiday,
because hours are stored today as **one string** — `6am–9pm`, `Open daily, 24 hours` — and one
"closed Christmas Day" turns that field from a value into a structure. The answer:

> *"Store hours can change - most likely would be an alert bar mention and not changed very
> often. If you want to build in a second 'one line of text' variable for any changes, that would
> be smart. That way on New Year's Eve the hours can be scheduled to change automatically to the
> second line for one day and then scheduled to change back to the first line the day after — if
> needed, probably rarely used."*

That is the right shape, and it is a shape this build already has. A promo is a document with a
date window whose liveness is computed per visitor rather than flipped by a scheduler (ADR 0018).
An hours override is the same idea with one line of text instead of a picture. **Nothing new gets
built; an existing mechanism gets a second use.**

The alternative — a full opening-hours structure, seven days plus exceptions — is what most
booking sites carry and would be wrong here. All three Locations keep the same hours every day of
the week. A structure that models a variation nobody has costs the editor a grid to fill in, and
the one real case (a holiday) is the case the grid handles worst.

## Decision

### The field
`hours` stays exactly as it is: one line, the normal hours, always present, never empty.
Each Location gains **`hoursOverrides`** — a list, usually empty:

| Field | Purpose |
|---|---|
| `hours` | The replacement line. Same kind of string as the normal one — `6am–6pm`, `Closed` |
| `reason` | Two or three words for *why*, shown on the detail page only — `New Year's Eve` |
| `startsAt` | First day it applies. A **date**, not a timestamp |
| `endsAt` | Last day it applies. A date, and **required** — see below |

An override is live when today falls inside `startsAt … endsAt`. When none is live, `hours`
renders, which is every ordinary day of the year.

### Four rules the mechanism does not survive without

**1. `endsAt` is required.** A promo may omit its end date and run until switched off (ADR 0018);
an hours override may not. The whole value of this field is that the hours *go back on their own*.
An override with no end is a permanently wrong hours line waiting to happen — and the failure is
silent, because the page still renders a perfectly plausible time. The CMS makes the field
required rather than trusting the editor to remember.

**2. Dates are whole days, inclusive, in `America/Los_Angeles`.** Both halves matter and both are
bugs we have already reasoned about once. Evaluating in UTC flips a Pacific override at 4pm or
5pm the previous afternoon — the same trap ADR 0018 pinned for promo expiry. And treating
`endsAt: 2026-12-31` as *midnight at the start* of 31 December means the New Year's Eve override
never shows on New Year's Eve. The window runs from 00:00 on `startsAt` to 23:59:59 on `endsAt`,
Pacific.

**3. When two overrides overlap, the shorter window wins** — soonest `endsAt`, ties broken by
latest `startsAt`. A one-day holiday sitting inside a two-week seasonal override is the specific
case beating the general one, which is what the person who typed them meant.

**4. Fewer than two lines is not a state.** `hours` is never empty and never becomes an override.
An editor who wants to change the hours permanently edits `hours`; the override is for the
temporary case only. The two fields are not interchangeable and the CMS labels say so.

### Where it renders
Hours appear in four places, and they all read the same value, so they all change together:
the Location card's `cardLine`, the Locations index, the Location detail page, and `/contact`.
There is no fifth place, and the override never reaches the fuel price band, which carries no
hours at all.

**On the card, the override simply replaces the hours half of `cardLine`.** That line truncates
rather than wrapping, and the measured slack past the longest current string is 33px at 320px —
about five characters (`location-content-model`). So the override line is held to the same budget
as the hours it replaces: `6am–6pm`, not `6am–6pm on New Year's Eve`. The CMS shows a character
counter, advisory the way the promo headline's is. `reason` exists precisely so the *why* has
somewhere to live that is not the card.

**On the detail page and `/contact` there is room, so both lines show:**

> **Today: 6am–6pm** — New Year's Eve
> Regular hours 6am–9pm

That second line is not decoration. A guest who sees only `6am–6pm` has no way to know it is
unusual, and the one thing a temporarily-different opening time must communicate is that it is
temporary.

### The Truck Stop keeps its own
`truckStop` carries its own `hours` and therefore its own `hoursOverrides`. The Location's
override never applies to it. This follows the rule already in `location-content-model` — the
store's hours, phone and amenities are never merged with the truck side's — and it is the case
that will actually arise: the store closing early on a holiday while the diesel lanes stay open
all night is the normal outcome, not an edge case.

### This is a field on the Location, not a collection
A holiday usually affects all three Locations, which means typing the override three times. That
is accepted: the client's own estimate is *"probably rarely used"*, and three edits a year is
cheaper than a fourth collection for editors to learn. If it turns out to be used often, promoting
`hoursOverrides` to a collection with a `locations` reference list is an additive change that
breaks nothing — the same shape `promos` already has.

## It does not replace the alert bar; they do different jobs
The client's instinct was that an hours change is *"most likely an alert bar mention"*. Both
exist, and the split is clean:

| | `siteAlert` (ADR 0017) | `hoursOverrides` (here) |
|---|---|---|
| Scope | Sitewide — every page, every Location | One Location |
| Timing | **Now**, live in under a second | **Scheduled**, ahead of time |
| Reverting | Somebody remembers to switch it off | Automatic, on the end date |
| For | The unplanned — snow, a power cut, a road closure | The planned — a holiday, a season |
| Where it shows | A bar in the sticky header | The hours line itself, everywhere it renders |

The alert bar says *something is happening*; the override makes the hours **correct**. A snowstorm
closure uses the alert, because nobody schedules a snowstorm and somebody is awake to post it.
New Year's Eve uses the override, because it is known in November and nobody should be relied on
to remember at 6pm on the 31st. Using the alert for a holiday leaves a wrong hours line sitting
underneath it on four pages.

## Consequences
- **The hours line joins the set evaluated per request.** The page already computes live promos
  per visitor (ADR 0018) and fuel prices against the content API (ADR 0024), so this costs nothing
  new — but it is now a **third** reason the build can never be `output: 'export'`. Export would
  not fail; the override would simply never fire, and the wrongness would show up on the one day
  of the year it mattered.
- No scheduler, no cron, no rebuild at midnight. There is nothing to fail to fire, which is the
  property ADR 0018 chose this mechanism for in the first place.
- An override can be written weeks ahead and forgotten, which is the point. It can also be tested
  before it is due by giving it today's date, which is the cheap way to check the wording fits the
  card.
- `cardLine`'s length budget now has a second consumer. If a Location ever needs a genuinely
  longer override line, the street form is shortened first — the layout is not touched.
- A permanent change of hours is still a plain edit to `hours`. Nothing here makes that harder,
  and the CMS help text points at it, because an editor reaching for an override to make a
  permanent change is the one way to misuse this field.
