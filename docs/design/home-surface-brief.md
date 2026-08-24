# Home — surface brief

The brief this page was built to, kept so the next change can be judged against the
same intent. Produced by `/impeccable shape home` and confirmed before any code.

## Mode

**Persuade.** The reader is a traveler already on I-5, deciding right now. They want
three facts before the off-ramp: what fuel costs, whether it is open, and what is
actually there. Home either answers those above the fold or it has failed.

## The shape

- **A pinned price widget that never makes them hunt.** All four price groups —
  Exit 260, Mini Mart, The Cove, Truck Stop — with unleaded and diesel at each
  location and diesel and DEF at the truck lanes, which are priced independently of
  the car lanes at the same site. Tiny grade labels over big tabular numbers.
- **The header stays put.** Nav and prices are sticky, so the numbers are on screen at
  every point of the visit. The utility bar scrolls away; everything below it pins.
- **No second price table on Home.** The pinned widget already follows the reader
  down, so a table at the bottom would only repeat it. `/fuel-prices` carries the full
  grade list — midgrade, premium and ethanol-free included.
- **On a phone: logo, then nav, then prices.** Navigation reads above the widget, and
  the widget is condensed to four columns across so the pinned block stays shallow.
- **A photo-tile mosaic with captions overlaid** — one full-width feature tile, then an
  even row. It carries the truck stop, the drive-thru, coffee and the Cove Kitchen.
- **Promotions** as an editable band, read from data.
- **Three locations** as an even row of tiles, hours on the face of each.
- **The Rewards app**, then a navy footer with per-location hours and phones, and the
  single mandatory Lummi Commercial Companies link.
- **No wave band.** The waterline was cut on instruction — see "Open" below.

## Decisions taken

| Decision | Where it landed |
|---|---|
| No car wash | The tile is a coffee tile instead. |
| Nav and prices are sticky | The `<header>` itself pins, offset by the utility bar's height. |
| The widget shows unleaded and diesel only | `only` narrows the display; the data keeps every grade, and the full views still show them. |
| "Unleaded", not "Regular" | Display label only — the data key stays `regular`. |
| No price table at the bottom of Home | Removed; the pinned widget covers it. |
| DEF is real, at the truck stop only | A fuel grade in the data model and the validator. |
| Stock photography for launch | Seven marked slots plus `home-shot-list.md`. |
| No earning-rate claim for Rewards | Copy reads "Get the Rewards app". |
| Locked four-item nav kept | Home · Locations · Truck Stop · Fuel Prices; Rewards in the utility slot. |
| No Legal page, no social icons | Neither has content or URLs yet. |
| LCC footer link kept | Hard rule, ADR 0001. |

## Open

- **The waterline.** Home has none, on instruction ("remove the blue waterline, it's
  weird looking"). But `CLAUDE.md`, `brand-system`, `pnw-tribal-art` and issue #6 all
  still call it the brand's recurring signature on every page. Those four documents
  were left untouched: whether the cut is Home-only or sitewide is a brand decision,
  not a build one, and it needs settling before another page is built.
- **Rewards programme terms**, before any earning claim is published.
- **Whether a `/legal` page exists**, and what it contains.
- **Social accounts** — whether they exist, and their URLs.
- **Whether midgrade, premium and ethanol-free should disappear everywhere,** not just
  from the pinned widget. They are still sold, so they were left on `/fuel-prices` and
  the location pages; say the word and they come out of the data too.
