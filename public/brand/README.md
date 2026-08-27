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
| `logo-market-on-dark.png` | 336 x 120, **white** wordmark, navy `#1D3D7C` outline, cedar paddle with visible grain | Goes on dark backgrounds — the sticky header |
| `logo-market-on-dark@3x.png` | 1008 x 360, the same art at 3x. Verified: aligned against the 1x it differs only on edge anti-aliasing and finer paddle grain | Served to high-density screens via `srcset`; never referenced on its own |
| `logo-market-on-light.png` | 512 x 512, **navy** `#1D3D7C` wordmark, letterboxed with ~65% empty vertical space | Goes on light backgrounds — home hero, `/rewards` |
| `favicon.ico` | Multi-size ICO: 16, 32 and 48, all 32bpp BMP entries. **The 16 entry is the hand-tuned one** — see below; 32 and 48 are byte-for-byte as supplied | Legacy browsers and the bookmark bar |
| `favicon-16x16.png` | 16 x 16, 760 bytes. **Hand-tuned, not a downscale** — see below | The common tab |
| `favicon-32x32.png` | 32 x 32, 2.0 KB | Retina tab |
| `apple-touch-icon.png` | 180 x 180, 37.9 KB | iOS home screen |
| `android-chrome-192x192.png` | 192 x 192, 42.4 KB | Android, via `/site.webmanifest` |
| `android-chrome-512x512.png` | 512 x 512, **278 KB** | Android splash. Oversized for flat two-colour art — worth re-encoding |

`favicon.svg` and `favicon-96x96.png` were deleted in the same upload. **Losing the SVG costs
nothing**: it was never a vector — an SVG wrapper around one embedded base64 PNG, zero `<path>`
elements. See *Watch for wrapped bitmaps*, below, which is why it was worth checking.

### The set was replaced on 27 Aug 2026 — and it raises a permission question

The old set carried **the full lockup**, a ~3:1 horizontal band squeezed into a square: a smear at
32px and unreadable at 16px. The replacement is **the paddle device alone, white on a navy disc.**
Rendered at true size it reads cleanly at 48, at 32, and is a legible diagonal stroke at 16. As
craft, the problem is solved.

**The problem is that this was the one option ruled out.** The recorded ruling was that *the paddle
alone is not acceptable as a standalone mark* — which is precisely why A11 asked for new art, a
monogram or another device, rather than something lifted from the lockup. The supplied favicon is
the paddle alone. It is also a recolour: the lockup's paddle is cedar with visible grain, and this
is flat white on navy, which `CLAUDE.md` forbids for the logo.

Two readings, and only ownership can say which:

- **The ruling has changed** and the paddle is now approved as the icon mark. Then A11 closes, this
  section becomes history, and `CLAUDE.md`'s logo rule needs a sentence carving out the icon.
- **The ruling stands** and this set was generated without it in view. Then it carries the same
  defect as the old one, in a more dangerous form — the old set looked obviously wrong, this one
  looks right.

**Until that is confirmed, treat A11 as open.** The files are committed and referenced; nothing
is lost either way, and the confirmation is one sentence.

### The 16px is hand-tuned, and only the 16px

A straight downscale of the supplied art gives a paddle that is **8.5% of the disc** — about a
one-pixel stroke once the browser renders it at 16. Anti-aliasing then smears that one pixel into
grey and the icon reads as a navy dot. Alongside a tab of Gmail's solid red *G*, you would find
your tab by position, not by recognising the mark.

The fix, approved 27 Aug 2026: the paddle is **thickened to 16.3% of the disc** for the 16px size
only. It is not redrawn. The shape is the supplied artwork with a dilation applied to the white
mask at 512 and then downsampled — same silhouette, same proportions, more weight.

| | Paddle as % of disc | Effective stroke at 16px |
|---|---|---|
| As supplied, downscaled | 8.5% | ~1.0px |
| **Shipped 16px** | **16.3%** | **~1.6px** |

Heavier weights were built and rejected on evidence: at ~2.1px the blade loses its taper and the
handle starts merging into it; at ~2.6px it is a lozenge with no handle knob left. Scaling the
paddle up 18% instead broke it through the disc edge at both ends.

**This is why 32 and up are untouched.** One thickened master used at every size would wreck the
large icon — the same dilation that rescues 16 destroys 180. Hand-tuning the smallest size is
ordinary practice for icon sets; carrying that weight upward is not.

Regenerating it: dilate the white mask of `android-chrome-512x512.png` by a radius of 10 at 512,
clip to the disc, downsample to 16. The `.ico`'s own 16 entry is rebuilt from the same pixels as
a 32bpp BMP so a browser falling back to `/favicon.ico` gets the tuned one too.

**Note what this does not fix.** On dark browser chrome the navy disc is low-contrast against the
tab background whatever the paddle weight, because the disc is the problem, not the paddle. A
transparent background would solve it and is a separate decision, tied to the same open ruling.

**Watch for wrapped bitmaps.** The deleted `favicon.svg` looked like vector from its extension and was not. To
check any `.svg` in five seconds, open it in a text editor: `<path`, `<polygon` and friends mean
real vector; `<image` with `base64` means a bitmap in an SVG costume, with none of the benefits.

## Decision: the logo ships as PNG

**No SVG is used for the logo.** The supplied vector's paddle rendered pale, with a smooth
gradient and no wood grain, where the approved raster's paddle is saturated cedar with visible
grain. The logo is locked, so that mismatch is disqualifying rather than a matter of taste, and
ownership ruled the vector out. It is archived at `assets/brand-source/logo-market.svg`, which is
never served; nothing here references it. If a corrected vector arrives, revisit this — vector is
the better format when its colours are right.

### The filename names the background, never the ink

`on-dark` holds the **white** wordmark. `on-light` holds the **navy** one. The name answers "what
do I put this on", and never "what colour is it" — those two readings are opposites, and getting
them backwards puts an invisible logo on every page.

| Background | File | Ink | Where |
|---|---|---|---|
| Dark | `logo-market-on-dark.png` | 334 x 109, 3.06:1 | The sticky header, every page |
| Dark, 3x | `logo-market-on-dark@3x.png` | 1002 x 323, 3.10:1 | The same slot, via `srcset` |
| Light | `logo-market-on-light.png` | 503 x 162, 3.10:1 | Home hero, `/rewards` |

### Density variants use the `@Nx` suffix

`@3x` describes pixel density and nothing else — the background is still named by the part before
it, so the suffix cannot be misread the way "reversed" was. A density variant is **never referenced
directly**. It goes in a `srcset` and the browser chooses:

```html
<img src="/brand/logo-market-on-dark.png"
     srcset="/brand/logo-market-on-dark.png 1x,
             /brand/logo-market-on-dark@3x.png 3x"
     width="112" height="40" alt="Lummi Bay Market">
```

Never point `src` at the `@3x` file: that ships 61.6 KB to fill a 112px slot on every device, where
the `srcset` form sends it only to screens that can use it. Any future density variant follows the
same pattern.

This pair was called `logo-market.png` and `logo-market-reversed.png` and got swapped, because
"reversed" and "light" can each be read as either the ink or the ground. If these are ever renamed
again, keep the property that the name states the background.

Neither file can cover for the other. A white wordmark on `--lb-bone` all but vanishes; a navy
wordmark on `--lb-navy` measures 1.6:1 and disappears outright. **Check a rename by opening the
file, not by reading its name.**

### PNG is sufficient at 3x DPR — measured, not assumed

A raster is sufficient when its **ink** width is at least three times the CSS width it renders at.
Rendered evidence and the full table: `docs/proofs/logo-in-use.html`.

| Surface | CSS | 3x wants | File | Ink | Verdict |
|---|---|---|---|---|---|
| Phone header | 95px | 285px | on-dark@3x | 1002px | OK, 3.52x spare |
| Desktop header | 112px | 336px | on-dark@3x | 1002px | OK, 2.98x spare |
| Phone hero | 123px | 369px | on-light | 503px | OK, 1.36x spare |
| Desktop hero | 146px | 438px | on-light | 503px | OK, 1.15x spare |

The `@3x` export closed the one tight spot — the desktop header used to land at 99.4% of a true 3x
sample and now clears it three times over — and gives the on-dark lockup headroom to ~334px CSS at
3x, for uses that do not exist yet. The on-light file has no `@3x` sibling and needs none: 503px of
ink already clears the 146px hero by 1.15x.

What PNG gives up: CSS tinting and `mask-image`, which a locked logo may not be subjected to
anyway; and print or large format above ~500px, which is out of this repo's scope — ownership has
ruled that vector masters stay with the designer rather than living here.

## Still needed

| File | Why |
|---|---|
| A favicon mark — **confirmation, not art** | Supplied 27 Aug and it works. But it is the paddle alone, which was the ruled-out option — see below. A11 stays open until ownership confirms |

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
