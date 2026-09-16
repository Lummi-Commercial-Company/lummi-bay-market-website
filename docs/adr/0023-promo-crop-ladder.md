# 0023 — The promo crop ladder: five slot ratios, one master, and a capped text block

Status: **Accepted** (2026-09-16).

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

### Four text fields on desktop, three on a phone
The live fields are **eyebrow, headline, body, button**. The body field is shown on desktop and
**hidden on a phone**, leaving eyebrow, headline and button.

All four fit every slot — the measurement, not an estimate: a four-field block needs 113px and
the smallest slot is 163px tall. What is constrained is copy *length*, not field count.

| Slot | Three fields | Four fields | Picture left clear |
|---|---|---|---|
| Full width 1200 × 240 | 89px · 37% | 113px · 47% | 53% |
| Wide half 795 × 265 | 89px · 34% | 113px · 43% | 57% |
| Half 593 × 198 | 89px · 45% | 113px · 57% | 43% |
| Third 391 × 196 | 89px · 45% | 113px · 58% | 42% |
| Quarter 290 × 163 | 89px · 55% | **113px · 69%** | **31%** |
| Phone 351 × 197 | **89px · 45%** | — | **55%** |

The quarter is where this bites: at four fields the text covers 69% of the frame and leaves
roughly the bottom third clear. That is the slot art must be composed for, because any promo
can be re-divided into it.

### Headline capped at 28 characters, body at 30
Set in the CMS as character counters on the two fields.

At these caps **nothing wraps in any slot**. Every card sits at its floor — 89px with three
fields, 113px with four, one line per field, identical at every width. Worst case at the
quarter (28 wide capitals plus a 30-character body) measures 152px against 163px available,
with 11px to spare.

**These caps are a style rule, not a safety rule.** The measured ceiling before the quarter
overflows is about 115 characters across the text block; 28 + 30 = 58 is half of it. The
counters exist to keep promo copy punchy and the geometry uniform, not to stop the layout
breaking — the layout will carry roughly twice what has been signed off.

The consequence worth having is that **a re-divided promo changes size but never shape**. The
card is geometrically identical at every slot width, so there is no spill condition left to
design for.

### The button label is editable
It is a field, defaulting to “See details”, not a hardcoded string.

## Consequences
- **`docs/proofs/promo-system.html` must change.** It renders three fields, not four, and
  hardcodes the CTA as “See details” — so the approved card currently has two editable fields,
  not four. The template is what is wrong, and it is what the Next.js component will be built
  from.
- **The CMS needs three additions** to the `promos` collection: a character counter on the
  headline (28), a counter on the body (30), and a button-label field. Counters are advisory to
  the editor; nothing enforces them at render time, and nothing needs to.
- **The designer spec sheet carries the same numbers** — `docs/design-spec-sheet.html` §05 and
  §07. If the two ever disagree, this ADR is the record.
- **The phone rule shows the body field in the narrower of two slots.** The phone slot is 351px
  wide and the desktop quarter is 290px, so “four on desktop, three on a phone” puts *more* text
  in the *smaller* frame. It is defensible as a reading rule — a phone reader is closer to the
  screen and scrolling one column — but if it ever looks wrong, the alternative is a slot-width
  threshold: body at the third and wider, none at the quarter or on the phone. Both fit at
  28/30, and it is a one-line change in the component. **This is the cheap part of the decision
  to revisit; the ratios and the master are not.**
- **Still open:** every measurement was taken against stand-in photography. Re-run the proof
  page once real promo art exists — a busy image may need the text block's scrim darkened, which
  changes contrast, not geometry.
