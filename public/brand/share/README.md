# Social share cards

The image a platform shows when somebody pastes a link to this site. Size, safe area and the
rules are ADR 0022; the designer-facing version is section 06 of `docs/design-spec-sheet.html`.

| File | Size | Weight | Use |
|---|---|---|---|
| `share-default-2026-09.jpg` | 1200 x 630 | 33 KB | The sitewide default. `shareImage` on the settings singleton points here |

## What is on it, and what is deliberately not
Opaque `--lb-navy` `#1C4E8F`, the supplied on-dark lockup, and the waterline across the foot.

**No words.** `og:title` and `og:description` are live text the platform prints beside the
image, so anything set in the artwork appears twice. Two further reasons the default card stays
wordless:

- **A name on a card outlives a change to it.** A card is cached by third parties for weeks
  after the file changes, so the default card carries no Location name. The names themselves
  are now settled (A15, 16 Sep 2026 — "Minimart", "Fisherman's Cove"), but the caching
  argument stands on its own.
- Nothing time-sensitive may go on a card at all — no price, phone number or hours — for the
  same reason.

**The waterline fades out towards the right.** The token layer defines it as `--lb-teal` fading
to `--lb-navy`, and the card's ground *is* navy, so the right-hand end resolves to the ground
colour. That is the gradient behaving as specified, not a rendering fault — do not "fix" it by
inventing a colour.

The lockup renders 500px wide, inside the 570px title-safe width, so the centred square crop
that chat clients apply keeps a margin either side. It is scaled from
`logo-market-on-dark@3x.png` (1002px of ink) in a single pass and is otherwise untouched: no
recolour, no redraw. The card is a lockup slot, so the paddle icon carve-out does not apply here.

## Regenerating, and why the filename carries a date
`python3 scripts/make-share-card.py public/brand/share/<new-name>.jpg` (needs Pillow; it is a
build-time tool, not a site dependency).

**Never overwrite a card that has shipped.** Platforms cache an unfurl against the page URL, so
replacing the file leaves every link already shared showing the old image — Facebook needs a
manual re-scrape and some clients never re-scrape at all. Render the replacement under a new
dated name and repoint `shareImage`. New shares pick it up at once; old ones keep what they
cached, which is why nothing on a card may go stale.

## Still to come
Per-page cards for the three Locations and `/truck-stop` — the links people actually paste.
The A15 naming decision is in, so a card may now carry a name; the remaining dependency is
photography (A3).
