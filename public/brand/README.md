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
| `logo-market.svg` | **Real vector** — 32 paths, 8 polygons, 6 gradients, zero font references, zero embedded bitmaps. Canvas `336 x 120`, with both `width`/`height` and a `viewBox`. It is the **reversed** lockup (white wordmark), so it is the counterpart of `logo-market-reversed.png`, not of `logo-market.png` | The header's file. Caveats below |
| `logo-market.png` | 512 x 512, the Market lockup in navy `#1D3D7C` on transparency, letterboxed with ~65% empty vertical space | Primary raster for light grounds. Uploaded as `icon.png`; renamed, because it is the lockup, not an icon |
| `logo-market-reversed.png` | 336 x 120, the **reversed** lockup — white wordmark, navy outline, saturated cedar paddle with visible grain | The reversed raster. Uploaded as `logo-market.png.png`; renamed |
| `favicon.svg` | **Not a vector.** An SVG wrapper around one embedded base64 PNG — zero `<path>` elements. The payload is byte-identical to `logo-market.png` (sha256 `ff999899…`, 27,566 bytes) | Works, but does not scale |
| `favicon.ico` | Multi-size ICO, 48px and 32px | Fine as a file |
| `favicon-96x96.png` | 96 x 96 | Fine as a file |

The three favicons are RealFaviconGenerator output and they carry **the full lockup**, a ~3:1
horizontal band. Rendered down to a browser tab it is a smear at 32px and unreadable at 16px. The
files are correctly formed; the artwork inside them is the wrong crop for the job. A favicon needs
the **mark alone** — the paddle, or a monogram — and skill `brand-system` names the Market lockup
as the master mark without authorising the paddle as a standalone, so ownership must approve one
before it ships.

**Watch for wrapped bitmaps.** `favicon.svg` looks like vector from its extension and is not. To
check any `.svg` in five seconds, open it in a text editor: `<path`, `<polygon` and friends mean
real vector; `<image` with `base64` means a bitmap in an SVG costume, with none of the benefits.

## Caveats on `logo-market.svg`

Verified in Chromium 141. Rendered evidence: `docs/proofs/header-logo-proof.html`.

- **Its box is not its art.** The canvas is 2.8:1, but the ink occupies only the top of it and
  leaves **21.8 of 120 units empty at the bottom**; the ink itself is 3.68:1. The reversed PNG
  leaves 4. Sized to the same width the SVG therefore reads visibly smaller and sits higher —
  30.2px of ink at a 112px box against the PNG's 36px — and vertically centring the box does not
  vertically centre the logo. **Ask for a re-export with the artboard trimmed to the art.** Until
  then any header CSS carries a magic number.
- **Its paddle does not match the raster's.** The vector's paddle is pale with a smooth gradient
  and no wood grain; the raster's is saturated cedar with visible grain. The logo is locked, so
  this is not a preference: one of the two misrepresents the approved art, and ownership has to
  say which is authoritative.
- **It cannot serve light grounds.** White wordmark — on `--lb-bone` it all but vanishes. The home
  hero and `/rewards` still need the navy vector.
- **No inlining hazard.** The file uses `mix-blend-mode` (6 uses) with `isolation`. Rendered inline
  in a page and via `<img src>` on the same navy ground, output is identical — the blend modes are
  properly isolated and either usage is safe.

## Still needed

| File | Why |
|---|---|
| A **navy** vector, for light grounds | `logo-market.svg` is the reversed lockup. The home hero, `/rewards` and print sit on light ground and have no vector at all |
| `logo-market.svg` re-exported, artboard trimmed to the art | Removes the 21.8-unit bottom gap so the header can size the logo without a magic number |
| A ruling on the paddle | Vector and raster disagree: pale and ungrained versus saturated cedar with grain |
| A favicon set built from the **mark alone** | The present set carries the full lockup and is illegible at tab size |

Masters (`.ai`, `.eps`) belong in `assets/brand-source/`, which is empty.

## Measured facts about the supplied art

- **ADR 0006's 2.8:1 is right about the canvas** — both 336 x 120 files match it exactly. It is
  the *ink* that disagrees between files: 3.06:1 in the reversed raster, 3.68:1 in the vector,
  3.10:1 in the 512px raster. So the header height does not need re-opening on the strength of a
  ratio; it needs one authoritative export to measure. (This supersedes an earlier note here that
  put the art at 3.07:1 flat — that figure came from the rasters alone.)
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
