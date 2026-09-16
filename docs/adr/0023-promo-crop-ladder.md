# 0023 — The promo crop ladder: five slot ratios, one master, and a capped text block

Status: **Accepted** (2026-09-16), **amended the same day** — the field set went from four
fields on desktop and three on a phone to **three fields everywhere**, and the 30-character body
cap went with the field. The five ratios, the master and the 28-character headline cap are
unchanged. The superseded rule is recorded at the end of the decision it replaced, because it was
signed off and someone will look for it.

Terms (Location, Truck Stop): `CONTEXT.md`. Colour tokens: skill `brand-system` (LOCKED).
Cultural guardrail: skill `pnw-tribal-art` — and note that tribal motifs are barred from the
promo region entirely. The promo region and its placement field: ADR 0007. Rows, the date
window and re-division: ADR 0018. Info pages, which promos link to: ADR 0015 and ADR 0018.
Delivered sizes for every other image slot: `docs/design-spec-sheet.html` §05 and §07. The
measured working behind every number here: `docs/proofs/promo-crop-ladder.html`.

## Context
ADR 0007 locked the promo region's column ladder — rows of one, two, three or four promos
drawn from a twelve-column grid, 14px gutters, 1200px content width — and a 150px minimum slot
height. It did not say what shape the artwork is, how much text may sit on it, or how many
files a promo needs.

That gap blocks real work: nobody can brief a photographer, and staff cannot be given a text
field without knowing what it will do to the layout. ADR 0018 makes it sharper. Because twelve
divides evenly by 1, 2, 3, 4 and 6, a row **re-divides when a promo's date window closes** — a
promo supplied for a quarter-width slot can be displayed as a half or full width, with no
re-supply and nobody notified. So every rule here has to hold at the *narrowest* slot a promo
can ever reach, and the artwork has to survive being re-cropped without anyone looking at it.

The proof page measured the alternatives in a real browser rather than deriving them on paper.
Five findings decided this ADR; more than one design was reversed because the measurement
disagreed with the argument.

## Decision

### Five slot ratios, one per rung of the ladder
| Row layout | Columns | Slot | Ratio |
|---|---|---|---|
| 1 across — full width | 12 | 1200 × 240 | 5:1 |
| 2 across — wide half | 8 | 795 × 265 | 3:1 |
| 2 across — halves | 6 | 593 × 198 | 3:1 |
| 3 across — thirds | 4 | 391 × 196 | 2:1 |
| 4 across — quarters | 3 | 290 × 163 | 16:9 |
| any row, on a phone | — | 351 × 197 | 16:9 |

**No single ratio can serve the whole ladder.** 290 ÷ 150 = 1.93:1 is the widest a quarter may
be before it breaks the locked 150px floor; applying that ratio at 1200px would force a
full-width promo 622px tall. Five ratios is the consequence of one locked floor, not a
preference. They hold every row height inside a consistent 163–265px band.

### One master per promo: 2400 × 1350, subject inside the centre 2400 × 480
16:9 is the tallest ratio on the ladder and 5:1 the widest, so **a 16:9 master is never cropped
horizontally** — every slot takes a full-width cut of it and trims only the top and bottom.

A single supplied file therefore serves all five desktop slots and the phone. This **replaces
the earlier instruction to supply a desktop crop and a phone crop**: the phone slot is 16:9, so
the master already is the phone crop.

The centre 2400 × 480 strip is what the full-width 5:1 slot shows. Anything that has to be seen
belongs inside it; everything above and below is breathing room the narrower slots use.

### Three text fields, everywhere
The live fields are **eyebrow, headline, button**. There is no body field, on any slot or any
device. The block measures **89px in every slot on every device** — one rule, one number.

| Slot | Text block | Picture left clear |
|---|---|---|
| Full width 1200 × 240 | 89px · 37% | 63% |
| Wide half 795 × 265 | 89px · 34% | 66% |
| Half 593 × 198 | 89px · 45% | 55% |
| Third 391 × 196 | 89px · 45% | 55% |
| Quarter 290 × 163 | **89px · 55%** | **45%** |
| Phone 351 × 197 | 89px · 45% | 55% |

The quarter is still the slot art must be composed for, because any promo can be re-divided
into it — but it now keeps **45% of the frame clear** rather than 31%, so the subject has the
bottom half rather than the bottom third.

*Superseded, same day:* the field set first signed was four fields on desktop — eyebrow,
headline, body, button — and three on a phone, where the body line dropped out. All four did
fit every slot (113px of block against a 163px quarter); the reason for dropping the body field
was not fit. It bought about five words, cost a flat 24px of picture in *every* slot before a
word was typed — which at the quarter is the difference between 45% of the frame clear and 31% —
needed a second character counter, and keyed its rule to device rather than slot width, putting
*more* text in the narrower frame: the phone slot is 351px wide and the desktop quarter is
290px.

### Headline capped at 28 characters
Set in the CMS as a character counter on the one field. The 30-character body cap is withdrawn
with the field it counted.

At this cap **nothing wraps on real copy**. Every card sits at its 89px floor, one line per
field, identical at every width on the ladder. The one case that adds a line is 28 characters of
wide capitals in the quarter, the narrowest slot — measured at 109px against 163px available,
still 54px clear. Every other slot holds 89px even then, and so does the quarter on an
unbreakable 28-character word.

**The cap is a style rule, not a safety rule.** With the body field gone the measured ceiling
before the quarter overflows is about 124 characters of headline alone; 28 is under a quarter of
it. The counter exists to keep promo copy punchy and the geometry uniform, not to stop the
layout breaking.

The consequence worth having is that **a re-divided promo changes size but never shape**. The
card is geometrically identical at every slot width, so there is no spill condition left to
design for.

### The button label is editable
It is a field, defaulting to “See details”, not a hardcoded string.

## Consequences
- **`docs/proofs/promo-system.html` now matches this decision exactly.** It had the CTA
  hardcoded as “See details”, which left the approved card with two editable fields; each promo
  in the template now carries its own label and falls back to “See details” only when one is
  left blank. It already rendered three text fields, so with that fix the template is correct as
  it stands — and it is what the Next.js component will be built from.
- **The CMS field config now matches** — `promos` gained a character counter on the headline (28)
  and an editable `cta` button label, and lost `body` and its second image crop. The counter is
  advisory to the editor; nothing enforces it at render time, and nothing needs to. The field
  list is written once, in **ADR 0018 §2**; ADR 0007 and `docs/backend-setup.md` point at it.
- **The designer spec sheet carries the same numbers** — `docs/design-spec-sheet.html` §05 and
  §07. If the two ever disagree, this ADR is the record.
- **There is no responsive text rule left to build or explain.** The component renders the same
  three fields at every width, so there is no media query, no second character counter, and no
  “my body text doesn't show on my phone” for staff to report. Adding the field back later is a
  one-line change in the component plus a counter in the CMS; **this is the cheap part of the
  decision, and the ratios and the master are not.**
- **Still open:** every measurement was taken against stand-in photography. Re-run the proof
  page once real promo art exists — a busy image may need the text block's scrim darkened, which
  changes contrast, not geometry.
