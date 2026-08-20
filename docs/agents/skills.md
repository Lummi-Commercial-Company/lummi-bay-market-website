# Why a skill doesn't show up in the list

## Two kinds of invocation

Most reports of "the skill isn't installed" are this. Open any `SKILL.md` and look at the
frontmatter:

- **No `disable-model-invocation` line** → Claude may load the skill on its own when the
  work matches, *and* you can type `/<name>`. These appear in Claude's list of available
  skills: `grilling`, `tdd`, `code-review`, `codebase-design`, `diagnosing-bugs`,
  `domain-modeling`, `prototype`, `research`, `resolving-merge-conflicts`, plus the four
  project skills (`brand-system`, `pnw-tribal-art`, `location-content-model`,
  `fuel-price-update`).
- **`disable-model-invocation: true`** → **you** invoke it by typing `/<name>`. Claude will
  not start it unprompted, and it is deliberately **absent from Claude's available-skills
  list**. That is the flag working, not a broken install: `ask-matt`, `grill-me`,
  `grill-with-docs`, `handoff`, `implement`, `improve-codebase-architecture`,
  `setup-matt-pocock-skills`, `teach`, `to-spec`, `to-tickets`, `triage`, `wayfinder`,
  `writing-great-skills`.

Nearly the whole documented flow — `/grill-with-docs` → `/to-spec` → `/to-tickets` →
`/implement` — sits in the second group. So a session where Claude never mentions
`to-tickets` and `/to-tickets` still runs perfectly is behaving correctly. Type the name;
don't wait to be offered it.

Unsure which skill fits a situation? Type `/ask-matt` — it routes you.

## They are repo files, not account settings

Every skill lives in `.claude/skills/<name>/SKILL.md`, **committed to this repository on the
default branch**. That is the only arrangement that survives.

A Claude Code web session runs in a fresh, throwaway container: the repo is cloned at the
default branch when the container starts, and the home directory (`~/.claude/`) is built
from scratch every time. So:

- Skills installed at the **user level** (`~/.claude/skills/`) exist for exactly one
  session. The next session starts with an empty home directory and they are gone. Never
  set the skills up that way.
- Skills committed to `.claude/skills/` on the **default branch** are present in every
  session — on the web, in the desktop app, and locally — with no install step.

Corollary: a skill added on a feature branch is invisible to a new session, because a new
session clones the default branch. Merging is what publishes it.

## Checking a session has them

```bash
ls .claude/skills/          # 26 directories expected
git branch --show-current   # a new session starts on the default branch
```

If a `/name` doesn't autocomplete, check that list before assuming anything else.

## Config the skills read

- `issue-tracker.md` — how to create, read, label, and close tickets (GitHub MCP tools;
  `gh` CLI only where it exists).
- `triage-labels.md` — the five canonical triage labels, all of which exist on the repo.
- `domain.md` — where `CONTEXT.md` and the ADRs live.
