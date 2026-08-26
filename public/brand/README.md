# public/brand — the shipped logo files

Files here are **served publicly** at `/brand/<filename>` on the live site. Only put
web-ready, approved art in this folder. Working files (AI, EPS, PSD, PDF) go in
`assets/brand-source/` instead — that folder is not served.

The logo is **locked** (CLAUDE.md): use the art as-is. Never redraw, recolour, distort or
re-typeset it. Do not "fix" the navy-on-navy header problem by knocking the wordmark out
to white yourself — that needs an approved reversed lockup from the brand owner.

## What is here now

| File | What it actually is | Status |
|---|---|---|
| `logo-market.png` | 512 x 512, the Market lockup in navy `#1D3D7C` on transparency, letterboxed in a square with ~65% empty vertical space | Primary raster. Uploaded as `icon.png`; renamed, because it is the lockup, not an icon |
| `logo-market-reversed.png` | 336 x 120, the **reversed** lockup — white wordmark, navy outline, cedar paddle, on transparency | The reversed art. Uploaded as `logo-market.png.png`; renamed, because it is the reversed lockup and had a doubled extension |

Both are the correct Market lockup and both include the `MARKET` line. Neither is vector.

## Still needed

| File | Why |
|---|---|
| `logo-market.svg` | The header, hero and every other on-page use want vector. Raster is a fallback, not the primary |
| `logo-market-reversed.svg` | Same, for the navy header — this is the one the layout shell is waiting on |
| `favicon.svg` + `icon.png` (512 x 512) | A real icon, built from the **mark alone** (the paddle) or a monogram. The full lockup is a 3:1 horizontal band — at 16-32px in a browser tab it is an illegible smear. This is a design decision, not an export setting |

Masters (`.ai`, `.eps`) belong in `assets/brand-source/`, which is empty.

## Measured facts about the supplied art

- **Art ratio is ~3.07:1**, measured from the opaque bounding box of both files (3.06 and 3.10).
  ADR 0006 assumes **2.8:1** and sets the header height from it. At 112px wide the art is 36px
  tall, not 40px. Someone owns re-checking the header height against this — see ADR 0006's
  note that the phone header went 47px -> 52px *because* of a ratio correction.
- **The reversed wordmark measures 8.28:1 against `--lb-navy`.** The navy wordmark measures
  8.00:1 against `--lb-bone`. Either ground works on contrast alone.
- The navy inside the art is **`#1D3D7C`**, not the `#000F9F` recorded in skill `brand-system`.
  Neither is a UI colour; the UI navy stays `--lb-navy` `#1C4E8F`.

## Export requirement: text must be outlined

An SVG that keeps the wordmark as live `<text>` renders wrong anywhere the brand font is
not installed — the renderer substitutes a font with different glyph widths and the lockup
reflows. Letters shift, "MARKET" slides off the paddle. This has already happened once.

Before exporting to this folder: **Type -> Create Outlines** (Illustrator, shift-cmd-O), then
**Object -> Path -> Outline Stroke**. On export choose Styling *Presentation Attributes*,
Font *Convert to outline*, Images *Embed*, and leave **Responsive unchecked** so the root
keeps `width`/`height` next to its `viewBox`.

Outlining is not re-typesetting and does not breach the locked-logo rule: every glyph keeps
the exact shape it already had. Retyping the wordmark in a lookalike font *would* breach it.
Keep the live-text version as the master in `assets/brand-source/`.

To check a file: open it in a text editor and search for `<text` or `font-family`. Either
one means it is not ready for this folder. Also confirm the root element has a `viewBox`.

## The navy-on-navy question is answered

ADR 0006 recorded the header as blocked: the supplied wordmark was navy, the sticky header is
`--lb-navy`, and the logo may not be recoloured to fix it. Two ways out were offered, both the
client's call — an approved reversed lockup, or a light header ground.

**A reversed lockup now exists** (`logo-market-reversed.png`), so the header keeps its navy
ground and the second option is not needed. The wordmark measures 8.28:1 against `--lb-navy`.

What remains is the vector: the shipped header should reference `logo-market-reversed.svg`, not
a 336px-wide PNG that will soften on a 2x display. Phase 0 item 1 is still open; item 2 is
effectively closed and ADR 0006 wants amending to say so.
