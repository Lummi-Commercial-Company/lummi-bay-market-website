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

## Amendment — the Careers link, and where the boundary actually falls, 17 Sep 2026

Checklist item **A9** put the first real test to this ADR. The Careers link's destination is
`https://www.silverreefcasino.com/careers` — Silver Reef Casino & Resort, named in the Context
above as one of the sibling LCC businesses this ADR keeps off the site. Flagged for ownership
rather than decided here, because it touches the standing rule rather than a preference.

**Ownership decided, 17 Sep 2026:**

> *"Should read as 'Careers' and link to the provided link I gave, not a /careers page on this
> website."*

So the footer carries one link, labelled **Careers**, pointing straight out to that address. The
alternative that was on the table — a `/careers` page on this site that explains where to apply —
is **rejected**, and should not be re-proposed.

**What this clarifies about the rule**, which is the reason it is written down rather than just
actioned: the standing rule is about *mentions*, not about *destinations*. A link whose text names
another Lummi company, or carries its logo, or explains the relationship, is that company appearing
on this site — which is what the rule forbids outside the single footer link. A link labelled with
the job it does, pointing wherever the jobs are actually listed, is a signpost.

The consequence for the build is a small one and easy to lose: **the link text stays "Careers."**
Not "Careers at Silver Reef", not "Careers · Silver Reef Casino", no logo, no parenthetical about
the parent company, no tooltip naming the destination. The moment the label names the company, this
stops being a signpost and becomes the mention the rule is about. The same reasoning would apply to
any future outbound link to a sibling enterprise; the label is the whole test.

The link still behaves as an external one — new tab, `rel="noopener noreferrer"`, marked as leaving
the site the way an external tenant card is (ADR 0016) — because that is honesty about where a
click goes, which is a different concern from this rule and is not in tension with it.
