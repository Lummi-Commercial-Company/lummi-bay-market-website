# `content/settings/` — seed data, ahead of the build

`site.json` holds values the client has supplied that have nowhere else to live yet. **No code
reads it.** There is no application in this repo (see `docs/roadmap.md`), so this is a holding
place, not a wired configuration — it exists so that answers given on 17 Sep 2026 are in the repo
in roughly the shape they will be used, rather than only in a document that describes them.

When the settings singleton is built in Phase 2 (ADR 0015), these values move into it and this
file goes away. Treat the field names as a sketch: the schema is written against the ADRs, not
against this file.

## What is in it, and what each one still needs

**`rewards.appStoreUrl`** — verified live. *Lummi Bay Market*, seller Lummi Commercial Company.

**`rewards.playStoreUrl`** — **`playStoreUrlNeedsConfirmation` is `true` on purpose.** The client
supplied a Play *search* URL (`/store/search?q=lummi+bay+market`). That page was fetched and
returns twelve unrelated apps; the Lummi Bay Market app is not among them, so shipped as a store
button it would land a customer on other companies' apps. The URL recorded here is the direct
listing found by search — the `com.rovertown.lummi` package, consistent with Rovertown being the
app's platform partner (checklist A21). Whoever has the Play Console can confirm it in one click:
open the listing, copy the address bar. Clear the flag then.

**`footer.careersUrl`** — supplied. Opens in a new tab, marked as leaving the site. Flagged at
checklist A9 for one ownership call: the destination is a sibling Lummi enterprise, and ADR 0001
limits other Lummi companies to the single "Lummi Commercial Companies" footer link. The link as
built names no company — the label is "Careers" — so it reads as a destination rather than a
mention, but that is a judgement ownership should make rather than inherit.

**`social`** — the three accounts supplied, in render order. Facebook and Instagram are tended
accounts; Yelp is a review listing and is ordered last for that reason (ADR 0028, amended). The
empty list renders nothing, which is the behaviour to keep: never a placeholder icon pointing at
`#`.

**`map`** — both fields deliberately empty. The map is not built yet (checklist A19). Empty means
`/contact` renders addresses, hours, phones and Directions links and shows no map section — a page
with one section fewer, not a broken one. `embedCode` takes the `<iframe>` from Google My Maps
(Share → Embed on my site, map set to public); `stillImage` takes a picture of that same finished
map for the click-to-load façade (ADR 0019, ADR 0025).

## What is deliberately not here
Fuel prices (`content/fuel-prices.json`, ADR 0004), Locations, promos, tenants and pages are their
own collections. Nothing about hours, prices or addresses belongs in a settings file.
