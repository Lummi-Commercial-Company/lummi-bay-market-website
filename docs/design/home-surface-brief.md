# Home — surface brief

The brief this page was built to, kept so the next change can be judged against the
same intent. Produced by `/impeccable shape home` and confirmed before any code.

## Mode

**Persuade.** The reader is a traveler already on I-5, deciding right now. They want
three facts before the off-ramp: what fuel costs, whether it is open, and what is
actually there. Home either answers those above the fold or it has failed.

## The shape

- **A compact price panel that never makes them hunt.** Exit 260 above Truck Stop,
  tiny grade labels over big tabular numbers. Top-right on desktop, directly under the
  header on mobile. The truck lanes are priced independently of the car lanes.
- **A photo-tile mosaic with captions overlaid** — one full-width feature tile, then an
  even row. It carries the truck stop, the drive-thru, coffee and the Cove Kitchen.
- **Promotions** as an editable band, read from data.
- **Three locations** as an even row of tiles, hours on the face of each.
- **All prices in full** further down, then the Rewards app.
- **A navy footer** with per-location hours and phones, and the single mandatory
  Lummi Commercial Companies link.
- **No wave band.** The waterline was cut on instruction — see "Open" below.

Prices for Exit 260 and the truck stop in the header; everything else one tap away.

## Decisions taken

| Decision | Where it landed |
|---|---|
| No car wash | The tile is a coffee tile instead. |
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
