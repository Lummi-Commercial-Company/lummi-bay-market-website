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

**`rewards.playStoreUrl`** — **confirmed by the client, 17 Sep 2026.** The flag
`playStoreUrlNeedsConfirmation` has been removed; this is the address the store button uses.

Why it was ever in doubt is worth keeping, because it is the failure this field exists to prevent:
the URL first supplied was a Play *search* URL (`/store/search?q=lummi+bay+market`). That page was
fetched and returns twelve unrelated apps — the Lummi Bay Market app is not among them — so shipped
as a store button it would have landed a customer on other companies' apps. A search URL looks like
a store link and behaves like a directory. **Whatever goes in this field is opened and checked, not
pasted on trust.**

**`footer.links`** — every link in the footer's four columns, in order (30 Sep 2026, ADR 0029
amended). Each row is link text, an address, and one of the four columns (About, Visit, Rewards,
Work with us). Pre-filled with the footer as approved. A column with no rows is not shown — except
Visit, which then lists the Locations automatically. Two kinds of row are **not shown**, and the
build log says why: text that names another Lummi business (Silver Reef, Loomis Trail, Salish
Village, LCC — the hard rule allows only the single "Lummi Commercial Companies" link), and an
address that is not a page here (starting `/`) or an `https://`, `mailto:` or `tel:` link. The rule
reads the *text*, not the address. This replaces the old `careersUrl` and `extraLinks`; a file that
still has those instead of `links` produces the same footer as before.

**The Careers row** was **settled by the client 17 Sep 2026**: it reads **"Careers"** and goes
straight to the careers page it points at; no `/careers` page is built on this site. A label naming
no company is a destination, not a mention of another Lummi company (ADR 0001, amended) — so keep
the text free of any company name, logo or "at Silver Reef".

**`footer.privacyLabel`, `footer.privacyUrl`** — the Privacy Policy link in the bottom row. Blank
means "Privacy Policy" → `/privacy`. It cannot be removed. Changing the address moves the link, not
the page: `/privacy` itself never moves, because both app stores link to it (ADR 0026).

**`footer.lummiCommercialCompaniesUrl`** — where the one sanctioned link to the wider group goes.
Its text is fixed.

**`social`** — the three accounts supplied, in render order. Facebook and Instagram are tended
accounts; Yelp is a review listing and is ordered last for that reason (ADR 0028, amended). The
empty list renders nothing, which is the behaviour to keep: never a placeholder icon pointing at
`#`.

**`map`** — both fields deliberately empty. The map is not built yet (checklist A19). Empty means
`/contact` renders addresses, hours, phones and Directions links and shows no map section — a page
with one section fewer, not a broken one. `embedCode` takes the `<iframe>` from Google My Maps
(Share → Embed on my site, map set to public); `stillImage` takes a picture of that same finished
map for the click-to-load façade (ADR 0019, ADR 0025).

**The still has to be uploaded, not linked.** It must be a file on this site — a path like
`/uploads/locations-map.png`. An address starting with `http` or `//` points at somebody else's
server, which is the one thing the façade exists to avoid, so it is rejected and the map section
does not render. That is deliberate: a rejected still gives a page one section shorter, where
accepting it would give a broken picture with a working button under it.

**`liveMainPage`** — which home page visitors see: `content/main-pages/home.mdx`, set 29 Sep
2026 when Home stopped being typed into the code and became a document staff can edit (ADR 0015).
More than one version may live in `content/main-pages/`; this one field switches between them, so
a redesign is built in full and turned on in one change (ADR 0018). If it is blank or points at a
file that no longer exists, the site shows the first version it finds and logs the fault — a bad
setting never leaves the site without a home page.

**`promoRows`** — how promotions are laid out on every page that does not set its own, added
30 Sep 2026 (ADR 0018, Amendment). A list of `{ "layout": "…" }` rows, one of `1`, `2`, `3`, `4`
(that many across), `wn` / `nw` (wide + narrow, narrow + wide) or `l3` (a lead and two). Up to six
rows; live promotions fill them in order and a row with nothing to hold does not render. **Absent
here on purpose:** with no rows set the site uses one full-width row, then two halves, so a
promotion published before anyone thinks about rows still shows. A general page or a home page
version can carry its own `promoRows` in its frontmatter, which wins over this one.

**Dates, everywhere, are MM/DD/YYYY** (owner's direction, 30 Sep 2026) — promotions, temporary
hours, fuel price stamps: `10/05/2026`, and where a time is allowed, `10/05/2026 12:00 PM`. The CMS
checks each date field as it is typed. Dates saved earlier as `2026-10-05` still read the same,
but write new ones as MM/DD/YYYY. **If you edit a file by hand, quote a date in the old form** —
`endsAt: '2026-10-05'` — because unquoted YAML reads it as a date rather than text and the CMS
build refuses the whole file; MM/DD/YYYY is plain text to YAML either way. Every date box in the CMS has a **Calendar** button beside it: pick the day there, or keep typing. The calendar fills the box in the same MM/DD/YYYY form and keeps a time already typed after it.

**`headerMotifs`** — `show` switches the header motif band on or off; `groups` is the list of
motif groups, each holding its motifs in order and its strength, scale, spacing and ink, with
`live: true` on the one in use (the first, if several). ADR 0021, amended 30 Sep 2026. An older
file with `group` pointing into `content/motif-groups/` is still read. Motif files live in `public/uploads/motifs/` and
are uploaded through the motif box in the CMS, which checks each one first. A settings file with
no `headerMotifs` keeps the band on, but with no group in use nothing is drawn and the build log
says so.

## What is deliberately not here
Fuel prices (`content/fuel-prices.json`, ADR 0004), Locations, promos, tenants and pages are their
own collections. Nothing about hours, prices or addresses belongs in a settings file.
