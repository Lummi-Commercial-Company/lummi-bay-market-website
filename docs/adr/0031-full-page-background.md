# 0031 — Full-page background

Status: Accepted. Owner's direction, 6 Oct 2026. Sits beside **ADR 0020** (the side watermark);
it does not replace it.

## Decision
**Site Settings → Full-page background** puts one image behind every page: on/off, the image,
how it fills the page (tile, tile across, tile down, cover, contain), a tile-size slider (10–200%
of the image's own size, default 40%) and a faintness slider (0–100%). It sits under the
watermark; both can be on at once. Unlike the watermark it shows on phones too. It is hidden
under `prefers-contrast: more` and in print.

A tile is sized against the image's own size, which only the browser knows, so the component
(`components/layout/PageBackground.tsx`) reads it once and draws nothing until it has. Rules in
`lib/page-background.ts`, with tests.

## Placeholder
The salmon pattern (`public/uploads/backgrounds/placeholder-salmon-pattern.png`) is a placeholder.
TODO: replace with approved Lummi art. Uploading art does not approve it — the cultural rule in
CLAUDE.md holds.
