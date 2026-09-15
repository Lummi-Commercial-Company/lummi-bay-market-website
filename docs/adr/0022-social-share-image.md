# 0022 — The social share card: 1200 × 630, one sitewide default plus per-page overrides

Status: **Accepted** (2026-09-15).

Terms (Location, Truck Stop): `CONTEXT.md`. Colour tokens: skill `brand-system` (LOCKED).
Logo files and the icon carve-out: `public/brand/README.md`. Cultural guardrail: skill
`pnw-tribal-art`. Page collections and the settings singleton: ADR 0015. Promo art rules:
ADR 0018. Instant publishing: ADR 0017 — and see *Caching*, below, for why it does not reach
this asset.

## Context
Nothing in the project specified a social share image. Every link pasted into Facebook,
LinkedIn, Slack, iMessage, WhatsApp or X would be unfurled with whatever image the platform
happened to scrape off the page — on a Location page that is a 26px motif, on `/fuel-prices`
there is no image at all. The result is a card with a broken-looking thumbnail or none, for the
most-shared links the business has.

This ADR fixes the size, the safe area, where the file lives, which pages get their own, and
what may never be drawn on one.

## Decision

### 1200 × 630, and this is the one asset on the site that is not supplied at 2×
Every other image in `docs/design-spec-sheet.html` is specified in CSS pixels and supplied at
twice that. **The share card is not.** 1200 × 630 is the delivered pixel size: platforms
re-encode it to their own dimensions and a 2400 × 1260 file buys nothing but bytes.

1200 × 630 is 1.905:1. The floor matters more than the target: **below 600 × 315 the large card
silently degrades to a small square thumbnail** beside the text. There is no warning, and it
looks like a mistake by whoever shared the link.

### The safe area, because three different crops are in the wild
The same file is displayed at three aspect ratios depending on who unfurls it:

| Where | Ratio | What it does to 1200 × 630 |
|---|---|---|
| Facebook feed, LinkedIn, Slack unfurl | 1.91:1 | Shown whole |
| X `summary_large_image` | 2:1 | Centre-crops to 1200 × 600 — 15px off the top and bottom |
| WhatsApp and several mobile chat thumbnails | 1:1 | Centre-crops to **630 × 630 — 285px off each side** |

The square crop is the binding one. So:

- **Outer margin: 60px.** Nothing of consequence within 60px of any edge.
- **Title-safe box: 570 × 510, centred** (x 315–885, y 60–570). That is the square crop inset by
  30px each side and the canvas inset by 60px top and bottom. The lockup and any words live
  strictly inside it.
- Everything outside the title-safe box is ground, texture or photography that can be lost
  without the card failing.

### The lockup, at a maximum of 570px wide
The card is a lockup slot, so **the icon carve-out does not apply here**: the bare paddle never
stands in for the lockup on a share card, whatever the crop does. `public/brand/README.md`.

The on-dark lockup at 3× is 1008 × 360, and the title-safe box caps the lockup at 570px wide, so
it is always being downsampled and always sharp. Drawing it larger than 1008px would upsample
supplied art — which is also a redraw, and the logo is locked.

### Opaque navy ground, JPG, never a PNG with alpha
The card is composited onto a chat background the brand does not control — white in one client,
near-black in another. It must be self-contained: an opaque `--lb-navy` `#1C4E8F` ground, or
full-bleed photography, and never transparency. Several clients composite alpha onto black, which
puts a navy wordmark on a black field.

JPG, quality 75–82, sRGB, EXIF stripped, **under 200 KB**. JPG has no alpha at all, which is the
point.

### One required sitewide default, with optional per-page overrides
Two fields, following ADR 0015's pattern:

| Field | Where | Notes |
|---|---|---|
| `shareImage` | settings singleton (`content/settings/site.json`) | **Required.** The site must never render a page with no `og:image`. |
| `shareImageAlt` | settings singleton | Becomes `og:image:alt`. |
| `shareImage`, `shareImageAlt` | optional on any page document | Overrides the default for that page only. |

Resolution is page → settings default, and the default is not nullable. An empty value is not a
neutral state: it hands the choice back to the scraper.

At launch the sitewide default is the only one that must exist. The recommended first overrides,
in order of how often the link is actually pasted, are the **three Location pages** and
**`/truck-stop`**. `infoPages` inherit the default unless a campaign supplies its own.

### Where the files live, and why it is not the CMS
The sitewide default is brand furniture, not content: it ships in **`public/brand/share/`**,
committed to the repo. That keeps it out of TinaCloud's 100 MB asset budget, which the free tier
caps for the life of the site. Per-page overrides that staff upload do count against that budget —
one more reason the default covers most pages.

### The tags the build emits
`og:image` must be an **absolute URL** — `https://lummibay.com/brand/share/…`. A root-relative
path produces no card on most platforms and no error anywhere. Alongside it: `og:image:width`
1200, `og:image:height` 630, `og:image:alt`, `og:title`, `og:description`, `og:type`, `og:url`,
and `twitter:card` = `summary_large_image`.

`og:title` and `og:description` are live text from the document and are rendered by the platform
next to the image. **The artwork must not repeat the page title** — it would appear twice.

### What must never be drawn on a share card
- **No fuel prices, and no price of any kind.** See *Caching*: the card outlives the price.
- **No phone number, no hours, no address.** Same reason.
- **No Coast Salish motif until approved art exists.** The card is the single most-reproduced
  image of the brand off-site, it is cached by third parties, and it cannot be recalled. Interim
  motifs elsewhere on the site can be swapped before launch; ones that have been scraped cannot.
  The waterline is the one exception — an abstract gradient wave band rather than formline — and
  that is a judgement call recorded here rather than a rule inherited from the skill.
- **No promo artwork reused as-is.** Promo art is composed for a wide letterbox that survives
  re-division (ADR 0018); it has nothing in the centred square.

Baked-in text is otherwise **allowed** here, unlike in a promo, because nothing is overlaid on
this image — but keep it to a short standing line at most.

## Caching — the one place ADR 0017 does not reach
Every other publishing path on this site is live in under a second. This one is not, and the gap
is not small.

Platforms cache an unfurl keyed on the **page URL**, for days to indefinitely. Replacing the file
at the same filename does not update links that have already been shared: Facebook needs a manual
re-scrape through its Sharing Debugger, and several clients never re-scrape at all.

So: **ship a new card at a new filename** — `share-default-2026-09.jpg`, not `share-default.jpg`
overwritten — and change `shareImage` to point at it. New shares pick it up immediately; old ones
keep the card they cached, which is correct behaviour and the reason no time-sensitive fact may
be drawn on one.

## Consequences
- One required field on settings that cannot be left blank, and an optional one on every page
  type. Staff who ignore it entirely still get a correct card.
- Four pieces of artwork to commission at launch — one default plus three Locations — or one, if
  the Locations are deferred. The `/truck-stop` card is the next most valuable.
- The 60px margin and the 570 × 510 title-safe box have to hold in every card produced later,
  including ones made by a campaign designer who never reads this file. They are on the designer
  spec sheet for that reason.
- A change of brand ground colour or lockup file invalidates existing cards only for new shares.
  Old ones will keep showing the previous brand until they age out of every platform's cache.
