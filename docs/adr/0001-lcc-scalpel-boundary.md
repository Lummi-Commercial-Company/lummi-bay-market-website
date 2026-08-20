# 0001 — Scalpel merge of lcc-lummi.com, not a full merge

Status: Accepted

## Context
The original brief listed three source sites to "merge," including lcc-lummi.com.
On inspection, lcc-lummi.com is the **Lummi Commercial Company (LCC)** — the parent
tribal enterprise wholly owned by Lummi Nation, whose portfolio includes the Lummi Bay
Markets brand **and** the Silver Reef Casino & Resort, Loomis Trail Golf, the Salish
Village development, and billboard leasing. Its site hosts the three market location
pages alongside all of that other-company content.

The client's standing rule: any reference to other Lummi tribal companies must appear
only as a single footer link, "Lummi Commercial Companies."

## Decision
Merge only the three Lummi Bay Market location pages (Exit 260, Minimart, Fisherman's
Cove) from lcc-lummi.com. Leave LCC corporate, casino, golf, billboards, and the Salish
Village development where they are. The footer "Lummi Commercial Companies" link points
to lcc-lummi.com.

## Consequences
- The new site stays purely the three-location retail brand; navigation stays clean.
- "Merge lcc-lummi.com" is deliberately partial — this ADR explains why, so no one later
  re-imports casino/golf/development content.
- If LCC later wants those businesses surfaced, that is a separate site, not this one.
