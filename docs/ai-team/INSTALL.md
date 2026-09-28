# Install the AI team on your PC

A step-by-step checklist for a Windows PC. Tick each box as you go. Most of the work is done by
one script; you only do the logins. For *why* each piece exists, see
[`SETUP-GUIDE.md`](SETUP-GUIDE.md).

**Time:** about 30–60 minutes, plus model downloads.
**Disk space:** ~5 GB for tools, plus models: tier A ≈ 16 GB · tier B ≈ 80 GB · tier C ≈ 155 GB.
**You'll need:** your Claude login, a ChatGPT plan or OpenAI API key (for Codex), and a GitHub
login that can see this repo. A JEV key is optional.

---

## Part 1 — Get the project onto your PC (5 min)

- [ ] **1.** Open **PowerShell** (Start menu → type `PowerShell` → Enter).
- [ ] **2.** Install Git if you don't have it:
  ```powershell
  winget install --id Git.Git -e
  ```
  Close PowerShell and open it again.
- [ ] **3.** Download the project and switch to the branch that has the AI team:
  ```powershell
  cd $HOME\Documents
  git clone https://github.com/lummi-commercial-company/lummi-bay-market-website
  cd lummi-bay-market-website
  git checkout claude/serene-einstein-vt1u9t
  ```
  A browser window may ask you to log in to GitHub. That's normal.
  *(Once this branch is merged into `main`, skip the `git checkout` line.)*

## Part 2 — Run the installer (15 min + downloads)

- [ ] **4.** Preview what it will do. Nothing is changed:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\ai-team\install.ps1 -DryRun
  ```
- [ ] **5.** Run it for real:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\ai-team\install.ps1
  ```
  - It checks your RAM and graphics card and picks a model tier. To choose one yourself, add
    `-Tier A`, `-Tier B` or `-Tier C`. To install tools now and download models later, add `-NoModels`.
  - To leave something out, add `-Skip` and the step name, for example `-Skip openclaw`.
    Step names: `git node python uv ollama claude codex hermes opencode aider openclaw jev
    graphify jev-skill ponytail-codex env hermes-profile`.
  - Windows may ask "Do you want to allow this app to make changes?" for Git, Node, Python or
    Ollama. Click **Yes**.
- [ ] **6.** Read the **Summary** at the end.
  - `installed` or `already there` → done.
  - `FAILED` → the line below the table says why. Fix it (usually: close and reopen PowerShell,
    or check your internet), then run step 5 again. Finished steps are skipped automatically.

**What the script installs:** Git, Node.js 24, Python 3.12, uv, Ollama, Claude Code, Codex,
Hermes, OpenCode, Aider, OpenClaw, JEV gateway, Graphify, the JEV skill for Claude, Ponytail
for Codex, Aider's local-model settings, a locked-down Hermes profile, and your tier's models.

## Part 3 — Logins and plugins only you can do (15 min)

The script prints this same list at the end, numbered. Do them in order.

- [ ] **7.** Close and reopen **VS Code**, then open the project folder (**File → Open Folder** →
      `Documents\lummi-bay-market-website`).
- [ ] **8.** In VS Code: **Extensions** (`Ctrl+Shift+X`) → search **Claude Code** → **Install**.
- [ ] **9.** Open VS Code's terminal (`` Ctrl+` ``) and log in to each tool:
  ```powershell
  claude            # log in, then type /exit
  codex login
  hermes setup      # free option: custom endpoint http://localhost:11434/v1, model gpt-oss-64k
  opencode          # pick Ollama as the provider, then quit
  openclaw onboard  # skip if you skipped OpenClaw
  openclaw security audit
  ```
- [ ] **10.** *(Optional)* JEV router key: create one at **console.typesafe.ai/keys**, then:
  ```powershell
  setx TYPESAFE_API_KEY "paste-your-key"
  ```
  Close and reopen VS Code afterwards. Without a key, the team routes by its scoreboard instead.
- [ ] **11.** Open **Claude Code** in VS Code and type these one line at a time:
  ```
  /plugin marketplace add thedotmack/claude-mem
  /plugin install claude-mem
  /plugin marketplace add DietrichGebert/ponytail
  /plugin install ponytail@ponytail
  /ponytail full
  /plugin marketplace add pbakaus/impeccable
  /plugin
  ```
  In the `/plugin` menu, pick **impeccable** and install it. Then restart Claude Code.
- [ ] **12.** Build the project map once. In Claude Code:
  ```
  /graphify .
  ```

## Part 4 — Check it works (5 min)

- [ ] **13.** In the VS Code terminal:
  ```powershell
  node scripts/ai-team/team.mjs doctor
  ```
  Every tool you installed should show `[ok]`. For each command-line agent it also prints that
  agent's live `--help`. If a flag changed in a newer version, tell Claude: *"doctor shows a flag
  mismatch for <agent>; fix agents.json"*.
- [ ] **14.** First real job. In Claude Code:
  ```
  /ai-team review the setup: run doctor, route one small test task to each installed agent, grade the results, and show me the scoreboard
  ```
  This does a practice run with every agent and starts the scoreboard with real results.
- [ ] **15.** Commit what the practice run learned (Claude will offer): `ledger.jsonl`,
      `learnings.md` and `graph.json`. That way every future session starts with them.

## Let Claude do it instead

Paste this into Claude Code on your PC after Part 1:

> Read `docs/ai-team/INSTALL.md`. Run Part 2 for me, show me the summary, fix any FAILED step,
> then walk me through Part 3 one step at a time, and finish with Part 4.

## If something goes wrong

| Problem | Fix |
|---|---|
| `running scripts is disabled on this system` | Use the exact command in step 5; `-ExecutionPolicy Bypass` allows just this one run. |
| `winget is not recognized` | Install **App Installer** from the Microsoft Store, then retry. |
| A tool "is not recognized" right after installing | Close and reopen PowerShell / VS Code, then re-run step 5. |
| A model download stops partway | Re-run step 5. Ollama resumes where it stopped. |
| Hermes step says `needs you` | Your Hermes config already had settings. Copy the block from SETUP-GUIDE.md step 7 into it by hand. |
| Anything else | See the Troubleshooting table at the end of `SETUP-GUIDE.md`, or ask Claude. |

**Uninstall:** each tool uninstalls normally from **Settings → Apps**. Remove npm tools with
`npm uninstall -g <name>`, and models with `ollama rm <model>`.
