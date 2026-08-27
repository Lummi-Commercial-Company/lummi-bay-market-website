# Proofs — the evidence behind the measured claims

The ADRs in `docs/adr/` cite specific numbers: "condenses at 56px of scroll on a 110px card",
"0% wrong at ±30px of aim error", "398px each in an 810px column". **This directory holds the
artefacts those numbers came from**, so a later reader can re-run them rather than take them on
trust — or catch them when a change makes them stale.

## What is here

| File | What it is |
|---|---|
| `fuel-strip-proof.html` | The interaction proof sheet. Six live frames — Home, Exit 260 and Truck Stop, at desktop and phone — plus the findings and the open decision register. |
| `logo-in-use.html` | The logo specimen. The Market lockup on every surface it lands on — header at both widths, hero, footer, favicon at true tab sizes — with the file each takes and what it measures. Loads the real art from `public/brand/`, so it goes stale when the art does. |
| `launch-plan.html` | The client briefing: state of the project, launch requirements, and the content-update model. |
| `scripts/*.mjs` | The Playwright measurement scripts. Each one answers a specific question and prints JSON. |

## These are proofs, not the site
**No part of `fuel-strip-proof.html` ships.** Its CSS was written so that one file could
demonstrate six frames at two widths; the React components get written fresh against the ADRs.
The file exists to settle behaviour and to record what was measured — treat it as a lab notebook,
not a starting point.

## Running the scripts
They drive Chromium through Playwright against the local file:

```
node scripts/verifyJ2.mjs      # condense point, page shift, edge alignment
node scripts/v-ts.mjs          # row/column membership per state, all six frames
node scripts/m-collide.mjs     # Back-to-top clearance from footer links
node scripts/m-touch.mjs       # aim-error simulation for the footer
node scripts/m-hdrtouch.mjs    # the same for the header nav
node scripts/m-headroom.mjs    # card-line copy budget at 375 / 360 / 320px
```

Paths inside the scripts assume they run from the directory holding `fuel-strip-proof.html`, so
copy the ones you need up a level, or adjust the path.

## Why the scripts are kept
Several ADR numbers are only defensible because they were measured rather than reasoned about,
and more than one design was reversed *because* the measurement disagreed with the argument —
three-across location cards (ADR 0009), the Back-to-top threshold (ADR 0011), the promo position
(ADR 0007). Keeping the harness means the next person can do the same instead of arguing.
