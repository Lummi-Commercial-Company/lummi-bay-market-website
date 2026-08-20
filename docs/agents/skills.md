# Where the skills live, and why some don't show up

## They are repo files, not account settings

Every skill lives in `.claude/skills/<name>/SKILL.md`, **committed to this repository**.
That is deliberate and it is the only arrangement that survives.

A Claude Code web session runs in a fresh, throwaway container: the repo is cloned at the
**default branch** when the container starts, and the home directory (`~/.claude/`) is built
from scratch every time. So:

- Skills installed at the **user level** (`~/.claude/skills/`) exist for exactly one
  session. The next session starts with an empty home directory and they are gone. This is
  why a previous "installed at the user level" setup appeared to vanish.
- Skills committed to `.claude/skills/` on the **default branch** are present in every
  session, on the web, in the desktop app, and locally — no install step, no per-machine
  setup, no re-syncing.

Corollary: skills sitting on a feature branch are invisible to a new session, because a new
session clones the default branch. Merging is what publishes a skill.

## Two kinds of invocation

Open any `SKILL.md` and look at the frontmatter:

- **No `disable-model-invocation` line** → Claude may load the skill on its own when the
  work matches, *and* you can type `/<name>`. These appear in Claude's own list of
  available skills. In this repo: `grilling`, `tdd`, `code-review`, `codebase-design`,
  `diagnosing-bugs`, `domain-modeling`, `prototype`, `research`,
  `resolving-merge-conflicts`, plus the four project skills (`brand-system`,
  `pnw-tribal-art`, `location-content-model`, `fuel-price-update`).
- **`disable-model-invocation: true`** → **you** invoke it by typing `/<name>`. Claude will
  not start it unprompted. These intentionally do **not** appear in Claude's available-skills
  list — that is the flag working, not a broken install. In this repo: `ask-matt`,
  `grill-me`, `grill-with-docs`, `handoff`, `implement`,
  `improve-codebase-architecture`, `setup-matt-pocock-skills`, `teach`, `to-spec`,
  `to-tickets`, `triage`, `wayfinder`, `writing-great-skills`.

So `/to-tickets` working while Claude never mentions `to-tickets` on its own is correct
behaviour. If `/to-tickets` does not autocomplete at all, the branch you are on does not
have the file — check `ls .claude/skills/`.

Unsure which skill fits a situation? Type `/ask-matt` — it routes you.

## Checking a session has them

```bash
ls .claude/skills/          # 26 directories expected
git branch --show-current   # skills must be on the default branch to be here at all
```

## Config the skills read

- `issue-tracker.md` — how to create, read, label, and close tickets (GitHub MCP tools;
  `gh` CLI only where it exists).
- `triage-labels.md` — the five canonical triage labels, all of which exist on the repo.
- `domain.md` — where `CONTEXT.md` and the ADRs live.
