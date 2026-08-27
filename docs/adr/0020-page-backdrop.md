# 0020 — The page backdrop: a sasquatch on the ground, and the switch that turns him off

Status: **Accepted** (2026-08-27). Supersedes one line of ADR 0012 — see *The rule this
breaks*, below.

Terms (Location, Truck Stop): `CONTEXT.md`. Colour tokens: skill `brand-system` (LOCKED).
Cultural guardrail and the mascot's standing: skill `pnw-tribal-art` and ADR 0012. Contrast
method and the cedar rule: ADR 0014. Instant publishing: ADR 0017.

## Context
The ask was a subtle sasquatch silhouette on the left, facing right, cropped by the page's left
edge so only the front of him shows, at low opacity, held in place while the body scrolls past —
"a nod to the Sasquatch icon that they use." Then, immediately after: *can I update or disable
it at any time?*

The second question is the one that decides the design. A decoration that needs an engineer to
remove is a decoration nobody will ever remove, and a mascot that turns out to be wrong on a
Tuesday afternoon needs to be gone that afternoon.

## Decision

### It is content, not CSS
The backdrop is a **field group on the settings singleton**, not a stylesheet rule. Fields:

| Field | What it does |
|---|---|
| `image` | The artwork. Upload replaces it — no deploy, no engineer. |
| `enabled` | Off is one checkbox. This is the whole point. |
| `opacity` | A number. **Not clamped — the owner sets it.** The schema shows the measured WCAG line and warns past it; see below. |
| `side` | `left` or `right`. Left is the default. |
| `height` | A percentage of the viewport. |
| `crop` | How much of the figure runs off the edge. 0 when the art is pre-cropped, as the supplied narrow file is. |

Plus a per-page `noBackdrop` checkbox, so a page that needs a clean ground (a dense table, a
map) opts out without touching the site setting.

Turning it off, swapping the art or dropping the opacity publishes the way the emergency notice
does (ADR 0017) — on-demand revalidation, live in under a second, no rebuild. That is what makes
"disable it at any time" a true statement rather than a hopeful one.

### The opacity line is 10% for the real art, and it was measured
The backdrop is a wash under text, so it eats contrast off every token that sits on the ground.

The first measurement was taken against a flat `--lb-navy` fill, because the placeholder was a
flat silhouette. **The supplied artwork is not flat** — it is a rendered figure whose fur carries
shadow far darker than any single brand token, so the wash it casts is darker at the same opacity.
Re-measured against `--lb-ground` (#FBF9F4), worst case being the **darkest pixel the figure
composites onto the ground** (text may sit anywhere over it, so an average would be dishonest):

| Opacity | Dim label #6B6455 over the supplied photo | over the drawn placeholder |
|---|---|---|
| 0% | 5.58 | 5.58 |
| 8% | 4.77 | 4.92 |
| **10%** | **4.58 — the line** | 4.76 |
| 12% | 4.40 — fails | 4.61 |
| 14% | 4.21 — fails | **4.46 — fails** |

**The dim label is the binding constraint, not navy** — navy still holds 6.21 at 12%. Both photo
files, narrow and wide, measure identically: they are the same render, so they share a darkest pixel.

**The number is not clamped in the schema.** An earlier draft of this ADR hard-capped it; that was
overridden — the opacity is the owner's call, and a field they cannot move is not a field. What the
schema does instead is show the measured contrast live at the chosen value and mark where 4.5:1
stops being met, so the choice is made with the cost visible rather than blind. The same control is
wired into `main-page-switcher.html` to review it against the real page.

Cedar does not constrain it. ADR 0014 moved every small label off cedar, so cedar carries no text
on the ground at all — its only remaining uses sit on opaque paper, which the backdrop never
touches. Re-checked against all six proof templates when the real art landed: the only cedar text
anywhere is the review-aid `ART` marker, and it sits on white paper. Cedar would fail 3:1 over any
wash at any opacity — it has only 0.24 of headroom at 0% — so this stays true only as long as no
cedar text is ever put on the ground. **Putting cedar text on the ground is what would break this**,
not raising the opacity.

### He is fixed, not parallaxed
`position: fixed`, so the page scrolls past a figure that does not move. No scroll listener, no
transform-per-frame, nothing to jank on a phone. The ask was "stays in the same spot" — fixed
*is* that, at zero cost. A true parallax (moving slower than the page) would be a scroll handler
for an effect nobody asked for.

### Cropped by a fraction of his own width
`translateX(-32%)` on the art, not a pixel offset on the container. A percentage of the figure's
own width holds the same crop at every viewport and every `height` setting; a pixel value has to
be re-tuned every time either changes.

### Phone gets none of it
At 390px the page is wall-to-wall cards. There is no ground for him to show on, and a wash you
cannot see still costs contrast on the text you can. `display:none` below the breakpoint. This is
a layout fact, not a preference — if the phone layout ever opens up, it is one rule.

### It is decorative and says nothing
`aria-hidden="true"`, `pointer-events:none`, and hidden entirely under
`@media (prefers-contrast: more)`. A guest who has asked their OS for more contrast does not get
a wash behind their text.

## The rule this breaks
ADR 0012's placement table says **"Behind any body copy — never: motifs are accents, never
backgrounds under text."** This is that, deliberately, and the exception is narrow enough to
state precisely:

- It applies to **the mascot only**. The sasquatch is the company's own and is explicitly outside
  the Coast Salish guardrail (ADR 0012, skill `pnw-tribal-art`). **No motif from the tribal
  library ever becomes a backdrop.** Canoe, salmon, orca, crab, paddle, eagle stay accents.
- It survives only because the cost is measured and capped. The rule was never "no wash" in the
  abstract — it was "no wash that eats the text." At 12% the text is still above every threshold.

The rest of ADR 0012's placement table stands.

## The art (updated — the real files arrived)
The drawn silhouette was **only ever a stand-in to judge placement, scale and opacity.** It has
been superseded. The company's own artwork now lives at:

| File | Size | Notes |
|---|---|---|
| `public/brand/elements/sasquatch-narrow-bg.png` | 503 × 2948, 1.85 MB | Pre-cropped in the art itself: the back half is already gone, only his front is on canvas, facing right. Matches the original brief exactly and needs no CSS crop. |
| `public/brand/elements/sasquatch-bg.png` | 866 × 2948, 3.22 MB | The same figure uncropped. Reads far more clearly as a figure, but shows his whole back — it is a different look, not the briefed one. |

Both are wired into `main-page-switcher.html` behind an art selector so they can be compared on
the real page. The drawn placeholder is kept in that one file as the thing being replaced, and
nowhere else once the choice is made.

**The art is never recoloured.** No tint, no `filter`, no `currentColor`. It renders exactly as
supplied and opacity is the only thing applied to it. The `color` property left on `.sasq` feeds
the drawn placeholder's `currentColor` and nothing else.

**These PNGs must never be served raw.** 1.85 MB for a decorative wash is indefensible; at native
resolution the same image is **128 KB as WebP** — a 93% saving. `next/image` does this conversion
and the responsive sizing at build time, which is why the PNG is the right thing to commit and the
wrong thing to ship. A raw `<img src=".png">` anywhere is a bug.

## Consequences
- One more field group for staff to understand, mitigated by the fact that the only field most
  people will ever touch is the checkbox.
- The 10% line has to be re-measured if the ground token, the dim label token, **or the artwork**
  changes. Swapping the art is the easy one to forget: the whole reason the line moved from 12% to
  10% is that new art arrived with darker pixels in it than the placeholder had. Any `image`
  upload invalidates the table above.
- The narrow file renders about 108px wide at 94% viewport height, the wide about 186px. Narrow is
  the briefed look and reads as a shadow at the page edge; wide reads as a recognisable figure.
  This is a taste call and it is the owner's — both are live in the switcher.
- Pages that are dense with opaque cards — the Home page as it stands — show almost none of him.
  That is correct behaviour for a ground-level wash, not a bug, and it is why the interior
  templates are where this earns its keep.
