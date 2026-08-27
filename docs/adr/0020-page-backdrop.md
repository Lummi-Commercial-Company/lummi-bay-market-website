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
| `opacity` | A number, **hard-capped at 12%** in the schema — see below. |
| `side` | `left` or `right`. Left is the default. |
| `height` | A percentage of the viewport. |
| `crop` | How much of the figure runs off the edge. 32% by default. |

Plus a per-page `noBackdrop` checkbox, so a page that needs a clean ground (a dense table, a
map) opts out without touching the site setting.

Turning it off, swapping the art or dropping the opacity publishes the way the emergency notice
does (ADR 0017) — on-demand revalidation, live in under a second, no rebuild. That is what makes
"disable it at any time" a true statement rather than a hopeful one.

### The opacity ceiling is 12%, and it was measured
The backdrop is a wash under text, so it eats contrast off every token that sits on the ground.
Measured against `--lb-ground` (#FBF9F4) with the figure in `--lb-navy`:

| Opacity | Wash | Navy #1C4E8F (need 4.5) | Ink #2A2820 | Dim label #6B6455 (need 4.5) |
|---|---|---|---|---|
| 0% | #FBF9F4 | 7.87 | 14.03 | 5.58 |
| 10% | #E5E8EA | 6.73 | 11.99 | 4.77 |
| **12%** | **#E0E4E8** | **6.48** | **11.55** | **4.59** |
| 14% | #DCE1E6 | 6.29 | 11.21 | **4.46 — fails** |

**The dim label is the binding constraint, not navy.** Navy still has 6.48 at the cap. The cap
is in the schema, not in a comment, because the field is editable by non-technical staff and
"looks better a bit darker" is the obvious next thought.

Cedar does not constrain it. ADR 0014 moved every small label off cedar, so cedar carries no text
on the ground at all — its only remaining uses sit on opaque paper, which the backdrop never
touches.

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

## What is still a placeholder
The silhouette currently in the proofs is **drawn to judge placement, scale and opacity, and
nothing else.** It is not a proposal for the mascot's look. The company's own sasquatch art
replaces it, which is exactly what the `image` field is for.

ADR 0012's warning applies with full force here: *placeholders have a way of surviving to
launch.* A backdrop is the easiest thing on a page to stop seeing.

## Consequences
- One more field group for staff to understand, mitigated by the fact that the only field most
  people will ever touch is the checkbox.
- The 12% cap has to be re-measured if the ground token or the dim label token ever changes.
  `docs/proofs/scripts/contrast.mjs` is the tool; the table above is the expected output.
- Pages that are dense with opaque cards — the Home page as it stands — show almost none of him.
  That is correct behaviour for a ground-level wash, not a bug, and it is why the interior
  templates are where this earns its keep.
