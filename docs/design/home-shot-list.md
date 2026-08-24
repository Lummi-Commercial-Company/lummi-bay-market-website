# Home page — photography shot list

Home ships with seven image slots. Every slot is rendered by `<PhotoSlot />`, drawn as
a dashed frame labelled "Stock photo" so nothing unfinished can be mistaken for final
art. Dropping real files in is a content change, not a rebuild.

**Why slots and not images:** no photography of any kind exists for this brand yet
(PRODUCT.md, "Evidence on hand"), and licensed stock cannot be bought from the build
environment. Publishing unlicensed images would be a real exposure for a tribal
enterprise, so the layout ships with the slots and this list instead.

## What to buy or shoot

| # | Slot name (matches the code) | Where | Ratio | Notes |
|---|------------------------------|-------|-------|-------|
| 1 | Truck stop at night — diesel canopy and parked rigs | Home feature tile | 16:7 desktop, 4:3 mobile | The one wide hero. Needs to read at 1200px. Night lighting, rigs parked, canopy lit. |
| 2 | Drive-thru window from a driver's seat | Home tile | 4:3 | Shot from inside a vehicle so the benefit is instantly legible. |
| 3 | Coffee being poured at a self-serve counter | Home tile | 4:3 | Hands and cup, not a wide interior. |
| 4 | Hot food counter with a served plate | Home tile | 4:3 | For the Cove Kitchen. Food in focus. |
| 5 | Exit 260 — forecourt and storefront | Locations row | 4:3 | Daylight, canopy and signage visible. |
| 6 | Mini Mart — forecourt and storefront | Locations row | 4:3 | Same treatment as 5 so the three read as a set. |
| 7 | Fisherman's Cove — forecourt and storefront | Locations row | 4:3 | Same treatment as 5 and 6. |

## Rules for whatever lands here

- **Captions sit over the bottom of every image.** The navy scrim handles contrast, but
  keep the bottom third of the frame free of important detail.
- **Slots 5–7 must match each other** in time of day, height and distance. They sit
  side by side and any mismatch shows.
- **Licence before publish.** Record the licence for each file. Stock that forbids
  commercial or franchise use is not usable here.
- **Real alt text on the way in.** `<PhotoSlot />` is `aria-hidden` because a labelled
  placeholder is decorative; a real photograph is not. Give each one alt text
  describing what it shows when you swap in `next/image`.
- **Placeholder motifs are separate.** Coast Salish art placeholders carry
  `TODO: replace with approved Lummi art` and must be authentic or tribe-approved
  before launch. Photography does not substitute for that art.
