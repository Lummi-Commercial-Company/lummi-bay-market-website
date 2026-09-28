# AI Team — setup guide (Windows PC + VS Code)

Connects several AI models into one team inside this project. **Claude Code is the
orchestrator**: it plans the work, picks an agent for each step, checks the result, and
keeps score so it picks better next time.

> **Fastest path — paste this to Claude Code in VS Code:**
> *"Read `docs/ai-team/SETUP-GUIDE.md` and install the AI team on this PC step by step.
> Check my hardware first, pick the model tier that fits, run each command, stop when I
> need to log in or paste a key, and finish with `node scripts/ai-team/team.mjs doctor`."*

Once installed, start any job with **`/ai-team <what you want built>`**.

---

## 0. Words you'll see (2-sentence definitions)

| Term | What it is |
|---|---|
| **Agent** | An AI model that can take actions (read files, run commands), not just chat. Each agent here has one job it's best at. |
| **Orchestrator** | The agent that splits a request into steps and hands each step to the right agent. Here that's Claude Code. |
| **Router** | A fast decision-maker that answers "which agent should do this?". Here that's JEV; if JEV isn't set up, the scoreboard decides. |
| **Claude Code** | Anthropic's coding agent; runs in a terminal or as a VS Code extension. It reads `CLAUDE.md` and this repo's skills. |
| **Codex CLI** | OpenAI's coding agent for the terminal. Used here as a second-opinion reviewer and parallel coder, because a different model catches different mistakes. |
| **Hermes Agent** | Nous Research's free, open-source agent that remembers across sessions and writes its own reusable skills. Used for research and brainstorming. |
| **JEV** | TypeSafe AI's "System One" model: it doesn't write text, it answers typed questions (pick one, score 1–4, yes/no) in milliseconds. Used to route tasks and score risk. |
| **OpenClaw 2.0** | Open-source, local-first personal agent platform (v2026.8.1, Aug 2026). It can browse and automate; used here as a second brainstormer/researcher. |
| **OpenCode** | Open-source terminal coding agent similar to Claude Code that runs any model. It lets free local models edit files like a real agent. |
| **Aider** | Open-source terminal pair-programmer built around git. Strong at precise multi-file edits with local Qwen models. |
| **Ollama** | Free app that downloads and runs AI models on your own PC. Agents talk to it at `http://localhost:11434`. |
| **claude-mem** | A Claude Code plugin that saves what happened in each session and feeds relevant memories into the next one. Stored locally in SQLite on your PC. |
| **MCP** | Model Context Protocol: a standard plug for giving an AI agent new tools. Codex, Hermes and Claude Code all speak it. |
| **Git worktree** | A second working copy of the same repo in another folder. Agents that edit code work there so they can't break your main copy. |

## 1. How the team works

```
                 you ──► /ai-team "request"
                              │
                     Claude Code (orchestrator)
        plan ► route ► dispatch ► VERIFY ► grade ► learn
                 │                                   │
        JEV (router, ms) ◄── scoreboard ◄── ledger.jsonl + learnings.md
                 │
   ┌─────────────┼───────────────┬──────────────────┬──────────────────┐
 Claude subagents   Codex          Hermes / OpenClaw   OpenCode / Aider   Ollama models
 (frontend, backend,(review,       (research,          (local models      (coder, critic,
  design, UX, copy)  build)         brainstorm)         that edit files)   writer, tester)
```

- **Plan** — each step gets a task type and a *machine-checkable* acceptance test.
- **Route** — `team.mjs route` asks JEV to pick; if JEV is unsure (<0.7) or absent, the
  agent with the best graded record wins.
- **Verify** — Claude runs the test itself. An agent saying "done" never counts.
- **Grade** — pass/fail is logged *with evidence* (test output, build log). Ungraded runs
  are ignored. This is the "qualified information" rule: the system only learns from proof.
- **Learn** — a lesson proven twice becomes one line in `learnings.md`, which is sent to
  every outside agent. claude-mem adds Claude's own cross-session memory.

The full rules Claude follows are in `.claude/skills/ai-team/SKILL.md`.

## 2. Editor: stay on VS Code

**Recommendation: keep VS Code.** It's free, it has the official Claude Code extension, and
every tool below works in its terminal. Alternatives, if you ever want one:

| Editor | Cost | Verdict |
|---|---|---|
| **VS Code** | Free | ✅ Recommended. Official Claude Code extension, huge extension library. |
| **Zed** | Free (bring your own keys) | Very fast. Runs Claude Code, Codex and others inside it via ACP (Agent Client Protocol); Claude Code in Zed is still beta. Good second choice. |
| **VSCodium** | Free | VS Code without Microsoft telemetry. Uses the Open VSX store; Claude Code is listed there. Same experience, fewer extensions. |
| Cursor / Windsurf | Paid tiers | Not better *for this setup* — Claude Code is already your agent. |

## 3. Check your PC (decides which local models you can run)

Open **PowerShell** and run:

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object @{n='RAM_GB';e={[math]::Round($_.TotalPhysicalMemory/1GB)}}
Get-CimInstance Win32_VideoController | Select-Object Name, @{n='VRAM_GB';e={[math]::Round($_.AdapterRAM/1GB)}}
```
(`AdapterRAM` under-reports cards above 4 GB; for NVIDIA run `nvidia-smi` for the true number.)

| Tier | Your hardware | Models to pull |
|---|---|---|
| **A — Small** | 16 GB RAM, no/small GPU | `qwen2.5-coder:7b`, `phi4-mini` |
| **B — Medium** | 12–16 GB GPU or 32 GB RAM | Tier A + `gpt-oss:20b`, `deepseek-r1:14b`, `gemma4:12b`, `devstral:24b` |
| **C — Large** | 24 GB+ GPU | Tier B + `qwen3.6:27b`, `qwen3-coder:30b` |

## 4. Base tools (one time)

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id Ollama.Ollama -e
```
Close and reopen VS Code, then check: `git --version; node --version; python --version; ollama --version`.
Node must be **22 or newer** (OpenClaw needs 22; the others need 18–20).

## 5. Claude Code (the orchestrator)

```powershell
irm https://claude.ai/install.ps1 | iex
claude            # log in once
```
In VS Code: Extensions (`Ctrl+Shift+X`) → search **Claude Code** → Install.
Open this project folder, open Claude Code, and it reads `CLAUDE.md` automatically.

### 5a. claude-mem (Claude's long-term memory)

Inside Claude Code, type:
```
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```
Restart Claude Code. It auto-installs Bun and uv if missing. Memories live in
`~/.claude-mem/` on your PC; wrap anything sensitive in `<private>…</private>` and it is not
stored. It exposes search tools (`search`, `timeline`, `get_observations`) that the
`/ai-team` loop uses in its **Recall** step.
*Note:* claude.ai/code web sessions are rebuilt each time, so claude-mem only persists on your PC.
The committed `ledger.jsonl` + `learnings.md` are what carry learning across web sessions.

## 6. Codex CLI (reviewer + parallel coder)

```powershell
npm install -g @openai/codex      # the scoped name — plain "codex" is an unrelated package
codex login                       # sign in with ChatGPT (Plus/Pro/Team) or an API key
codex exec --help                 # confirm it works
```
Codex reads `AGENTS.md` at the repo root (already added — it points Codex at `CLAUDE.md`).
The team runs it as `codex exec --sandbox read-only -` for reviews and
`--sandbox workspace-write` inside a worktree for builds.

## 7. Hermes Agent (researcher with memory)

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
hermes setup        # pick a model provider
hermes doctor       # confirm it works
```
**Free option:** in `hermes model`, choose a custom OpenAI-compatible endpoint and enter
`http://localhost:11434/v1` with a local model such as `gpt-oss:20b`.
Hermes' one-shot command may differ by version — run `hermes --help` and, if it isn't
`hermes chat -q`, tell Claude to update the `hermes` entry in `.claude/ai-team/agents.json`.

## 8. JEV (the router)

1. Create a key at **console.typesafe.ai/keys**.
2. Save it for your user (then restart VS Code):
   ```powershell
   setx TYPESAFE_API_KEY "paste-key-here"
   ```
3. Give Claude the JEV skill (so it knows the API):
   ```powershell
   claude plugin marketplace add typesafe-ai/skills
   claude plugin install typesafe@typesafe-ai
   ```
4. *(Optional)* **jev-gateway** — makes JEV pick tool calls inside Codex/OpenCode/Claude, which
   speeds them up:
   `npm install -g jev-gateway`, then launch with `jev-codex`, `jev-claude` or `jev-opencode`.
   Tune with `JEV_MIN_CONFIDENCE` (default 0.7).

Pricing for JEV isn't published in its docs yet — check the console. Without a key the team
still works; the scoreboard routes instead.

## 9. Local models (free agents, testers, brainstormers)

Ollama starts automatically after install. Pull your tier from step 3, for example:

```powershell
ollama pull qwen2.5-coder:7b     # local-fast   — quick tests and small fixes (any PC)
ollama pull gpt-oss:20b          # local-reasoner — plans, brainstorming
ollama pull deepseek-r1:14b      # local-critic — devil's-advocate reviewer
ollama pull gemma4:12b           # local-writer — copy drafts, reads screenshots
ollama pull devstral:24b         # local-agentic — multi-file repo edits
ollama pull qwen3.6:27b          # local-coder-pro — best local coder (SWE-bench Verified 77.2)
ollama pull qwen3-coder:30b      # local-coder — 256K context coder
ollama list                      # see what you have
```
Each model is rated best in one area; the registry maps it to that area only.

## 10. OpenClaw 2.0 (local-first agent platform)

```powershell
npm install -g openclaw@latest
openclaw onboard                 # 2.0 auto-detects Ollama, keys and subscriptions
```
For a fully local setup pick an `ollama/<model>` model (e.g. `ollama/gpt-oss:20b`) and use
`http://localhost:11434` — **no `/v1`** (OpenClaw's docs say `/v1` breaks tool calling).
⚠️ OpenClaw can control a browser, files and messaging. The team only gives it research and
brainstorm steps, never the repo or secrets. Skip it if you don't need it.

## 11. OpenCode and Aider (let local models edit code)

```powershell
npm install -g opencode-ai
opencode                         # first run: choose Ollama as a provider, pick qwen3.6:27b

python -m pip install aider-install
aider-install
setx OLLAMA_API_BASE "http://127.0.0.1:11434"
setx AIDER_MODEL "ollama_chat/qwen3.6:27b"
```
Also good, not wired in by default: **Cline** (VS Code extension, point it at Ollama) and
**Goose** (Block's open-source agent). Add them to `agents.json` if you want them.

## 12. Verify everything

```powershell
node scripts/ai-team/team.mjs doctor
```
`[ok]` = ready. `[--]` = not installed, with the install command shown. For each installed
CLI it prints the live `--help`, so Claude can correct any flag that changed.

## 13. Use it

| You type | What happens |
|---|---|
| `/ai-team build the Fuel Prices page` | Full loop: plan → route → dispatch → verify → grade → learn → report. |
| `node scripts/ai-team/team.mjs score` | See each agent's pass rate and speed per task type. |
| `node scripts/ai-team/team.mjs route review "check header a11y"` | See who would be picked, and why. |

Everything is committed except raw outputs (`.claude/ai-team/runs/`), so the score and
lessons follow the project to every machine and session.

## 14. Cost summary

| Piece | Cost |
|---|---|
| VS Code, Ollama, local models, Hermes, OpenClaw, OpenCode, Aider, claude-mem | Free |
| Claude Code | Your Claude plan |
| Codex | ChatGPT Plus/Pro/Team plan, or OpenAI API usage |
| JEV | Pricing not published in docs; see console.typesafe.ai |
| Hermes/OpenClaw/OpenCode/Aider on a *cloud* model | That provider's usage fees (free on local models) |

## 15. Why it's designed this way (research basis)

From **IBM — AI agent orchestration** (primary brief), mapped to this build:

| IBM concept | Here |
|---|---|
| Centralized + hierarchical orchestration | Claude on top, specialists below; Claude makes final calls |
| 7 steps: assess → select agents → framework → assign → coordinate → share context → optimize | Steps 3–12 of this guide = the human-driven steps; the `/ai-team` loop = the orchestrator-driven ones |
| Agent selection "based on real-time data and predefined rules" | JEV choice + graded scoreboard; hard-rule overrides in the skill |
| Shared knowledge base | `learnings.md`, `ledger.jsonl`, claude-mem, `AGENTS.md` |
| Continuous optimization (hybrid) | Scoreboard adapts automatically; you approve lessons in commits |
| Risk: agents on the same foundation model share blind spots | Builder and reviewer must be different model families |
| Risk: coordination conflicts | Editing agents work in separate git worktrees; only Claude commits |
| Risk: fault tolerance | Every JEV/agent failure falls back to the scoreboard or a native subagent |
| Risk: security | Read-only sandboxes by default; browsing agents never touch repo or secrets |

Current patterns also applied: **orchestrator–workers**, **routing**, **parallelization**
and **evaluator–optimizer** loops (Anthropic, *Building effective agents*); **MCP** for
tools; a **Reflexion-style** memory that stores only verified lessons; and a smoothed
pass-rate scoreboard (a simple multi-armed-bandit idea) so new agents get a fair trial.

### Sources
- IBM, *What is AI agent orchestration?* — https://www.ibm.com/think/topics/ai-agent-orchestration
- Hermes Agent install — https://hermes-agent.nousresearch.com/docs/getting-started/installation
- TypeSafe JEV quickstart / API / agent skill — https://docs.typesafe.ai/introduction/quickstart · https://docs.typesafe.ai/api · https://docs.typesafe.ai/agent-skill
- jev-gateway — https://github.com/vinilana/jev-gateway
- Codex non-interactive mode — https://learn.chatgpt.com/docs/non-interactive-mode
- claude-mem — https://github.com/thedotmack/claude-mem
- OpenClaw 2.0 release — https://docs.openclaw.ai/releases/2026.8.1 · Ollama provider — https://docs.openclaw.ai/providers/ollama
- Aider scripting — https://aider.chat/docs/scripting.html · OpenCode CLI — https://opencode.ai/docs/cli/
- Ollama model library (tags verified 2026-09-28) — https://ollama.com/library
- Local model rankings — https://www.morphllm.com/best-ollama-models
- Claude Code in Zed via ACP — https://zed.dev/blog/claude-code-via-acp

## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| `'npm' is not recognized` | Reinstall Node LTS (step 4), then restart VS Code. |
| `codex` does nothing | You installed plain `codex`. `npm uninstall -g codex; npm install -g @openai/codex`. |
| `Ollama server: not reachable` | Start the Ollama app from the Start menu, or run `ollama serve`. |
| A local model is very slow | It's too big for your GPU. Use a smaller tier from step 3. |
| A CLI run fails with "unknown option" | Its flags changed. Run `doctor`, then ask Claude to fix that agent's `args`. |
| New `setx` value not seen | `setx` applies to *new* windows — restart VS Code. |
