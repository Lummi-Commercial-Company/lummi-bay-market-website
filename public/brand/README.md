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

## Decision: the logo ships as PNG

**No SVG is used for the logo.** The supplied vector's paddle rendered pale, with a smooth
gradient and no wood grain, where the approved raster's paddle is saturated cedar with visible
grain. The logo is locked, so that mismatch is disqualifying rather than a matter of taste, and
ownership ruled the vector out. It is archived at `assets/brand-source/logo-market.svg`, which is
never served; nothing here references it. If a corrected vector arrives, revisit this — vector is
the better format when its colours are right.

Which file a surface takes is decided by its **background**, and by nothing else:

| Ground | File | Ink |
|---|---|---|
| Navy / dark — the sticky header, every page | `logo-market-reversed.png` | 334 x 109, 3.06:1 |
| Light — home hero, `/rewards`, print | `logo-market.png` | 503 x 162, 3.10:1 |

Neither file can cover for the other. A white wordmark on `--lb-bone` all but vanishes; a navy
wordmark on `--lb-navy` measures 1.6:1 and disappears outright.

### PNG is sufficient at 3x DPR — measured, not assumed

A raster is sufficient when its **ink** width is at least three times the CSS width it renders at.
Rendered evidence and the full table: `docs/proofs/header-logo-proof.html`.

| Surface | CSS | 3x wants | File | Ink | Verdict |
|---|---|---|---|---|---|
| Phone header | 95px | 285px | reversed | 334px | OK, 1.17x spare |
| Desktop header | 112px | 336px | reversed | 334px | OK, 99.4% |
| Phone hero | 123px | 369px | navy | 503px | OK, 1.36x spare |
| Desktop hero | 146px | 438px | navy | 503px | OK, 1.15x spare |

Two things to know rather than fix. The desktop header lands at 99.4% of a true 3x sample — a 0.6%
shortfall no eye resolves. And the reversed file has no headroom past that: any future reversed use
wider than ~111px CSS (a dark hero, a footer lockup, an OG image) would upscale. Cheap insurance is
one more export of the same art at **1008 x 360**.

What PNG gives up: print and large format above ~500px, which is what `assets/brand-source/` is
for; and CSS tinting or `mask-image`, which the locked logo may not be subjected to anyway.

## Still needed

| File | Why |
|---|---|
| A favicon set built from the **mark alone** | The present set carries the full lockup and is illegible at tab size. Needs an approved standalone mark first |
| `logo-market-reversed.png` at **1008 x 360** | Optional. Gives the reversed lockup headroom above ~111px CSS at 3x |
| The `.ai` / `.eps` masters in `assets/brand-source/` | Still empty apart from the rejected vector. Print and signage need them |
| A corrected vector, eventually | Not blocking anything. Would let the PNG decision above be revisited |

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

*Applies to any future vector. The logo itself now ships as PNG, so nothing shipping today depends
on this — but the rule is what made the supplied vector checkable, and it caught nothing wrong
there: that file's text was properly outlined.*

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
