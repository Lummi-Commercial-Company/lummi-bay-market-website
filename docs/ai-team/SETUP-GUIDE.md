# AI Team — setup guide (Windows PC + VS Code)

Connects several AI models into one team inside this project. **Claude Code is the
orchestrator**: it plans the work, picks an agent for each step, checks the result, and
keeps score so it picks better next time.

> **To install, follow [`INSTALL.md`](INSTALL.md)**: a 15-step checklist plus a script
> (`scripts/ai-team/install.ps1`) that installs everything below except the logins. This guide
> is the reference: what each piece is, why it's there, and how to configure it by hand.

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
| **A — Small** | 16 GB RAM, no/small GPU | `ministral-3:8b`, `gemma4:e4b` |
| **B — Medium** | 12–16 GB GPU or 32 GB RAM | Tier A + `gpt-oss:20b`, `phi4-reasoning:14b`, `glm-4.7-flash`, `north-mini-code-1.0:q4` |
| **C — Large** | 24 GB+ GPU (or 64 GB RAM, slower) | Tier B + `qwen3.8:27b`, `devstral-small-2:24b`, `gemma4:26b`, `qwen3.6:35b` |

## 4. Base tools (one time)

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id Ollama.Ollama -e
```
Close and reopen VS Code, then check: `git --version; node --version; python --version; ollama --version`.
Node must be **24.16 or newer** — OpenClaw 2.0 refuses Node 22, 23 and 25 (Node 26 is its recommended runtime); the other tools are fine on 24.

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

## 7. Hermes Agent (researcher)

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
hermes setup                     # pick a model provider
hermes profile create aiteam     # a separate profile just for team runs
hermes doctor
```
**Why a separate profile:** Hermes' docs warn never to point two agent processes at the same
Hermes home. The team always runs `hermes -p aiteam …`, so your own Hermes chats keep their memory clean.

**Lock down the `aiteam` profile.** Open `%LOCALAPPDATA%\hermes\profiles\aiteam\config.yaml`
(`~/.hermes/profiles/aiteam/config.yaml` on WSL) and set:
```yaml
approvals:
  mode: smart
  single_query_mode: deny       # a one-shot run can never approve a dangerous command
  unattended_mode: deny
skills:
  write_approval: true
  external_dirs:
    - C:/path/to/lummi-bay-market-website/.claude/skills   # share this repo's skills with Hermes
```
Claude's skills are the same `SKILL.md` format Hermes uses (agentskills.io), so Hermes follows
the same brand and content rules.

**Free local model (optional).** Hermes needs a **64K context**; Ollama defaults to 2K. Make a
64K copy of a model, then point the profile at it:
```powershell
"FROM gpt-oss:20b`nPARAMETER num_ctx 64000" | Out-File -Encoding ascii Modelfile
ollama create gpt-oss-64k -f Modelfile
```
```yaml
model:
  default: "gpt-oss-64k"
  provider: "custom"
  base_url: "http://localhost:11434/v1"     # API key: leave empty or type no-key
```
On a slow PC add `HERMES_API_TIMEOUT=1800` to the profile's `.env`. The docs note that models under
about 30B sometimes *say* they saved a memory without doing it, which is another reason the team
only trusts graded results.

**How the team calls it:** `hermes -p aiteam chat -Q --oneshot --source tool -t web --query-file -`
(the prompt goes in on stdin, quiet output, web tools only, and it runs in an empty scratch folder).
One-shot runs **cannot create skills**, so Hermes' self-learning happens in your own chats and
`hermes cron` jobs. The team's learning lives in `ledger.jsonl` + `learnings.md`.

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

Ollama starts automatically after install. Every model below was checked on 2026-09-28: the
Ollama tag exists and the license **allows commercial use**, which matters because this is a
business website. Each one is used only for the area it rates best in.

| Agent id | Pull command | Maker | Best at | Evidence | License |
|---|---|---|---|---|---|
| local-coder-pro | `ollama pull qwen3.8:27b` | Alibaba | Coding | SWE-bench Pro 61.7, LiveCodeBench v6 90.3 | Apache-2.0 |
| local-agentic | `ollama pull devstral-small-2:24b` | Mistral | Multi-file repo edits | SWE-bench Verified 68.0 | Apache-2.0 |
| local-agent-moe | `ollama pull qwen3.6:35b` | Alibaba | Tool use (fast, 3B active) | SWE-bench Verified 73.4 | Apache-2.0 |
| local-fast-coder | `ollama pull glm-4.7-flash` | Zhipu (Z.ai) | Fast coding | SWE-bench Verified 59.2 | MIT |
| local-alt-coder | `ollama pull north-mini-code-1.0:q4` | Cohere | Second-opinion coding | AA Coding Index 33.4 | Apache-2.0 + Cohere AUP |
| local-reasoner | `ollama pull gpt-oss:20b` | OpenAI | Planning, brainstorming | AIME25 91.7 | Apache-2.0 |
| local-critic | `ollama pull phi4-reasoning:14b` | Microsoft | Devil's-advocate review | AIME25 62.9 | MIT |
| local-vision | `ollama pull gemma4:26b` | Google | Copy drafts, screenshot QA | AIME26 88.3, reads images | Apache-2.0 |
| local-fast | `ollama pull ministral-3:8b` | Mistral | Quick drafts, triage | small and fast | Apache-2.0 |
| local-tiny | `ollama pull gemma4:e4b` | Google | Low-end PCs | MMLU-Pro 69.4 | Apache-2.0 |
| local-kat *(optional)* | `ollama pull hf.co/bartowski/Kwaipilot_KAT-Coder-V2.5-Dev-GGUF:Q4_K_M` | Kuaishou (StreamLake) | Agentic coding | SWE-bench Verified 69.4 | Apache-2.0 |

Benchmarks are the makers' own numbers, and each maker tests differently, so treat them as
a rough guide. The team's own scoreboard (step 13) is what actually decides who gets work.
Run `ollama list` to see what you have installed.

**Optional, for later:** `ollama pull snowflake-arctic-embed2:568m` (Snowflake, Apache-2.0) is an
*embedding* model. An embedding model turns text into numbers so a computer can find
similar-meaning text. It's useful if the site later gets search, or if the team's memory grows
too large to read in full. It isn't wired into the team yet.

### Models to avoid (their licenses forbid or limit commercial use)
| Model | Why |
|---|---|
| `codestral:22b` (Mistral) | Non-Production license: no commercial use |
| `command-r7b`, `aya-expanse` (Cohere) | CC-BY-NC: no commercial use |
| `solar:10.7b` (Upstage) | CC-BY-NC: no commercial use |
| `lfm2.5:*` (Liquid AI) | Free only for businesses under $10M a year in revenue; confirm before using |
| Together `Tev1` | No license stated |

### Free cloud backups (when your PC is too slow)
- **Groq**: a free plan with rate limits.
- **Cloudflare Workers AI**: 10,000 free "Neurons" (Cloudflare's usage units) per day.

Both serve open models over the internet. Point Hermes, OpenCode or Aider at one if a local model is too slow.

### Every company in the provider list, sorted
- **Makes open models you can run (best ones are in the table above):** Alibaba (Qwen),
  Mistral, Google (Gemma), OpenAI (gpt-oss), Microsoft (Phi), Zhipu (Z.ai), Cohere,
  DeepSeek (`deepseek-r1:8b` is a good low-end reasoner), Kuaishou (StreamLake), Meta (Llama,
  now outscored by the models above), Snowflake (embeddings).
- **Open models, available only as GGUF files** (a single-file model format that LM Studio and
  llama.cpp can load) **and untested with Ollama:** Arcee (Trinity Mini), InclusionAI (Ling),
  Kimi (Kimi-VL), Xiaomi (MiMo 9B), Zyphra (ZAYA1), Multiverse (Pulsar), Sarvam, Reka (Flash 3.1),
  Apodex, AI9Stars, LongCat (Flash-Lite needs 64 GB RAM).
- **Open models too large for a PC** (100B–1T parameters): MiniMax, StepFun, Thinking Machines,
  xAI Grok, plus the flagship models of DeepSeek, Kimi, Zhipu, Xiaomi and LongCat.
- **Closed models only:** Anthropic (you already use Claude), Inception, Celeris, Blackbox AI, Amazon (Nova).
- **Cloud hosts that run other companies' models (nothing to install):** Azure, Baseten, Bitdeer,
  Cerebras, Cloudflare, CoreWeave, Crusoe, Databricks, DeepInfra, DigitalOcean, Fireworks,
  FriendliAI, GMI, Groq, Hyperbolic, Inco, LithosAI, Makora, Modal, Modular, Nebius, Novita,
  Parasail, PrimaLabs, Public AI, Replicate, SambaNova, Scaleway, SiliconFlow, Systalyze,
  Together AI, Upstage (its newer models are large or custom-licensed), Wafer.

## 10. OpenClaw 2.0 (local-first agent platform)

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex      # needs Node 24.16+ (step 4)
openclaw onboard          # 2.0 auto-detects Ollama, API keys and subscriptions
openclaw doctor
openclaw security audit   # run this once and fix anything it flags
```
For a fully local setup pick an `ollama/<model>` model (e.g. `ollama/gpt-oss:20b`) and use
`http://localhost:11434` with **no `/v1`**. OpenClaw's docs say `/v1` breaks tool calling;
this is the opposite of Hermes, which needs `/v1`. WSL2 is the most compatible option if native Windows misbehaves.

**How the team calls it:** `openclaw agent exec --message-file - --json --cwd <empty scratch folder>`.
`agent exec` is OpenClaw's documented headless mode for automation: it needs no running Gateway,
limits file tools to `--cwd`, and returns a JSON envelope (`ok`, `status`, `final`, `costUsd`).
The script reads `final` and treats `ok:false` as a failed run.

⚠️ **Security defaults to know:** OpenClaw's sandbox is **off by default**, and one Gateway is one
trust boundary. The team therefore only gives it research and brainstorm steps, in an empty folder,
never the repo or secrets. Skip OpenClaw entirely if you don't need a second researcher.

**Optional extras (not needed for the team):**
- **Task Flow / Lobster:** OpenClaw's Task Flow is a durable record of multi-step work, stored in
  SQLite and able to survive restarts. The steps and human-approval gates themselves are written as
  **Lobster** workflow files (`openclaw plugins install @openclaw/lobster`). Flows are inspected
  with `openclaw tasks flow list --json` and cannot be launched from the CLI. Use it for recurring
  chores OpenClaw owns end to end, such as a weekly broken-link check with an approval gate. The
  team's own durability comes from the committed ledger, so it doesn't depend on Task Flow.
- **`openclaw mcp serve`:** lets Claude Code connect to OpenClaw as a tool server, if you'd rather
  drive it as MCP tools than through the script.

## 11. OpenCode and Aider (let local models edit code)

```powershell
npm install -g opencode-ai
opencode                         # first run: choose Ollama as a provider, pick qwen3.8:27b (or devstral-small-2:24b)

python -m pip install aider-install
aider-install
setx OLLAMA_API_BASE "http://127.0.0.1:11434"
setx AIDER_MODEL "ollama_chat/qwen3.8:27b"
```
Also good, not wired in by default: **Cline** (VS Code extension, point it at Ollama) and
**Goose** (Block's open-source agent). Add them to `agents.json` if you want them.

## 11b. Shared skills and plugins (make every agent better)

A **skill** is a folder with a `SKILL.md` instruction file that teaches an agent one job.
A **plugin** bundles skills and commands so they can be installed in one step.

| Tool | What it does for the team | Install |
|---|---|---|
| **Matt Pocock skills** | Engineering habits: `tdd`, `code-review`, `to-spec`, `diagnosing-bugs`, `grilling`… Newly added: `wizard` (Claude writes a click-through script for steps only you can do, like logins and API keys), `to-questionnaire`, `wait-what`, `writing-for-agents`. | **Already in this repo** (`.claude/skills/`). Nothing to install. Codex, OpenCode, Aider and OpenClaw read them through `AGENTS.md`; Hermes reads them through `skills.external_dirs` (step 7). |
| **Ponytail** | Makes agents write less code: skip it, reuse it, use the standard library, and only then write new code. The maker's benchmark reports ~54% fewer lines and ~22% fewer tokens. Adds `/ponytail-review` and `/ponytail-audit`. MIT license. | Claude Code: `/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`. Codex: `codex plugin marketplace add DietrichGebert/ponytail` then `codex plugin add ponytail@ponytail`. |
| **Impeccable** | Design quality: 61 automatic checks plus `/impeccable audit`, `polish`, `typeset`, `layout`. | Claude Code: `/plugin marketplace add pbakaus/impeccable`, then `/plugin` and install it. Other agents: `npx skills add pbakaus/impeccable`. |
| **Graphify** | Turns the repo (code, docs, ADRs) into a map that agents can query, so they read only the files that matter. That means fewer tokens and faster runs. Code is parsed on your PC and nothing leaves it; docs use your assistant's model. Apache-2.0/MIT. | `uv tool install graphifyy` (install `uv` with `pip install uv` if you don't have it), then `graphify install`. In Claude Code, type `/graphify .` once to build the map. |

**Settings that matter for this project:**
- **Ponytail mode:** start with `/ponytail full`. Use `lite` if it cuts too aggressively, and never
  `ultra` on fuel-price or CMS code, where clarity beats brevity.
- **Impeccable vs. the brand:** Impeccable reads a `DESIGN.md` file if one exists. Our brand rules
  live in the `brand-system` skill and are **locked**, so Impeccable's color and "make it bolder"
  suggestions never override them. Claude rejects any suggestion that touches the logo, the locked
  tokens or the tribal art. Don't run `/impeccable colorize` on this site.
- **Graphify files:** commit `graph.json`, which the docs say can be version-controlled, so every
  session starts with the map. Rebuild with `/graphify .` after big changes.
  `GRAPH_REPORT.md` is a handy tour for you as well.

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
- Hermes Agent install / CLI / security / Ollama / skills — https://hermes-agent.nousresearch.com/docs/ (full dump: https://hermes-agent.nousresearch.com/llms-full.txt)
- TypeSafe JEV quickstart / API / agent skill — https://docs.typesafe.ai/introduction/quickstart · https://docs.typesafe.ai/api · https://docs.typesafe.ai/agent-skill
- jev-gateway — https://github.com/vinilana/jev-gateway
- Codex non-interactive mode — https://learn.chatgpt.com/docs/non-interactive-mode
- claude-mem — https://github.com/thedotmack/claude-mem
- OpenClaw 2.0 release — https://docs.openclaw.ai/releases/2026.8.1 · `agent` CLI — https://docs.openclaw.ai/cli/agent · Task Flow — https://docs.openclaw.ai/automation/taskflow · Lobster — https://docs.openclaw.ai/tools/lobster · security — https://docs.openclaw.ai/gateway/security · Node — https://docs.openclaw.ai/install/node · Ollama — https://docs.openclaw.ai/providers/ollama
- Ponytail — https://github.com/dietrichgebert/ponytail · Impeccable — https://impeccable.style/ · Graphify — https://github.com/Graphify-Labs/graphify · Matt Pocock skills — https://github.com/mattpocock/skills
- Aider scripting — https://aider.chat/docs/scripting.html · OpenCode CLI — https://opencode.ai/docs/cli/
- Ollama model library (tags verified 2026-09-28) — https://ollama.com/library
- Local model rankings — https://www.morphllm.com/best-ollama-models
- Model licenses and benchmark figures: each model's Hugging Face card (huggingface.co/<maker>/<model>) and its Ollama page, checked 2026-09-28
- Free tiers — https://developers.cloudflare.com/workers-ai/platform/pricing · https://console.groq.com/docs/rate-limits
- Claude Code in Zed via ACP — https://zed.dev/blog/claude-code-via-acp

## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| `'npm' is not recognized` | Reinstall Node LTS (step 4), then restart VS Code. |
| `hermes` answers with a banner or hangs | Make sure the `aiteam` profile exists (`hermes profile list`) and that the run uses `-Q --oneshot`. |
| OpenClaw `exec` refuses to run | A Gateway owns its state folder. Stop the Gateway (see `openclaw gateway --help`), or run without `--state-dir` so exec uses temporary state (the team already does). |
| `codex` does nothing | You installed plain `codex`. `npm uninstall -g codex; npm install -g @openai/codex`. |
| `Ollama server: not reachable` | Start the Ollama app from the Start menu, or run `ollama serve`. |
| A local model is very slow | It's too big for your GPU. Use a smaller tier from step 3. |
| A CLI run fails with "unknown option" | Its flags changed. Run `doctor`, then ask Claude to fix that agent's `args`. |
| New `setx` value not seen | `setx` applies to *new* windows — restart VS Code. |
