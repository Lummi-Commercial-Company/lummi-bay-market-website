# Issue tracker: GitHub

Issues and PRDs for this repo live as **GitHub issues** on `Sky-SRCR/lummi-bay-market-website`.

## Which GitHub interface to use

Pick by what the session actually has — check once, at the start:

1. **GitHub MCP tools** (`mcp__github__*`) — the default in Claude Code on the web and in
   any remote/cloud session. Schemas load on demand: `ToolSearch` with
   `select:mcp__github__issue_read,mcp__github__issue_write` (etc.).
2. **`gh` CLI** — only when `which gh` succeeds (a local machine with the CLI installed
   and authenticated). Remote sessions do **not** have `gh`; do not reach for it there.

Every operation below lists the MCP form first and the `gh` equivalent second. If neither
is available, say so and stop — do not fabricate issue numbers.

## Conventions

| Operation | MCP tool | `gh` equivalent |
| --- | --- | --- |
| Create an issue | `issue_write` with `method: "create"`, `title`, `body`, `labels` | `gh issue create --title "..." --body "..."` (heredoc for multi-line) |
| Read an issue | `issue_read` with `method: "get"`; `method: "get_comments"` for the thread; `method: "get_labels"` for labels | `gh issue view <n> --comments` |
| List issues | `list_issues` with `state`, `labels`, and `fields` (omit `body` when you only need titles) | `gh issue list --state open --json number,title,body,labels` |
| Search issues | `search_issues` with a `query` like `repo:Sky-SRCR/lummi-bay-market-website is:open ...` | `gh issue list --search "..."` |
| Comment | `add_issue_comment` | `gh issue comment <n> --body "..."` |
| Add / remove labels | `issue_write` with `method: "update"` and the full `labels` array | `gh issue edit <n> --add-label "..."` / `--remove-label "..."` |
| Close | `issue_write` with `method: "update"`, `state: "closed"`, `state_reason` | `gh issue close <n> --comment "..."` |

Always set `state_reason` when closing. Paginate in batches of 5–10.

The five triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`) already exist on the repo — see `triage-labels.md`. **Creating a new label has no
MCP tool**: add it in the GitHub UI (Issues → Labels) or via `gh label create` locally, then
record it in `triage-labels.md`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo starts treating external PRs as
feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues:

- **Read a PR**: `pull_request_read` with `method: "get"`, then `"get_diff"`,
  `"get_comments"`, `"get_reviews"`. (`gh pr view <n> --comments`, `gh pr diff <n>`.)
- **List external PRs**: `list_pull_requests` with `state: "open"`, then keep only authors
  whose association is `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` — drop
  `OWNER`/`MEMBER`/`COLLABORATOR`.
- **Comment / label / close**: `add_issue_comment` (PR conversation shares the issue
  comment API), `update_pull_request` for labels and state.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either —
resolve with `pull_request_read` and fall back to `issue_read`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue (`issue_write` / `method: "create"`).

## When a skill says "fetch the relevant ticket"

`issue_read` with `method: "get"`, plus `method: "get_comments"`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog
  body. Create with `issue_write` + `labels: ["wayfinder:map"]`.
- **Child ticket**: an issue linked to the map as a GitHub **sub-issue** —
  `sub_issue_write` with `method: "add"`, the map as `issue_number` and the child's
  numeric **database id** as `sub_issue_id` (from `issue_read` → `id`, *not* the
  `#number` or `node_id`). Labels: `wayfinder:<type>` (`research` / `prototype` /
  `grilling` / `task`). Once claimed, assign the ticket to the driving dev.
- **Blocking**: GitHub's native issue dependencies are the canonical representation, but
  there is **no MCP tool for them**. In a remote session, record edges as a
  `Blocked by: #<n>, #<n>` line at the top of the child body — that is the supported
  fallback and `/wayfinder` reads it. Locally with `gh`, prefer the native edge:
  `gh api --method POST repos/Sky-SRCR/lummi-bay-market-website/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`.
  A ticket is unblocked when every blocker is closed.
- **Frontier query**: `list_issues` with `state: "OPEN"`, scoped to the map's sub-issues,
  dropping any ticket with an open blocker or an existing assignee; first in map order wins.
- **Claim**: `issue_write` / `method: "update"` adding yourself as assignee — the
  session's first write.
- **Resolve**: `add_issue_comment` with the answer, close the issue with a
  `state_reason`, then append a context pointer to the map's Decisions-so-far.
