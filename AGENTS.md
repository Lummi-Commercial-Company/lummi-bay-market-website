# AGENTS.md

Instructions for non-Claude coding agents (Codex, OpenCode, Aider, Hermes, OpenClaw) working
in this repo. Claude reads `CLAUDE.md` automatically; the others read this file.

1. **Read `CLAUDE.md` first.** It is the project's single source of truth — goal, hard rules,
   stack, architecture. This file adds nothing to it except the rules below.
2. **You are a worker, not the lead.** Claude Code orchestrates (see `.claude/skills/ai-team/`).
   Do the one task you were given. Do not commit, push, open PRs, or add dependencies.
3. **Hard rules** (from `CLAUDE.md`, repeated because breaking them is costly): never alter the
   logo; other Lummi companies appear only as the one footer link "Lummi Commercial Companies";
   tribal art is placeholder only, marked `TODO: replace with approved Lummi art`; read prices,
   addresses and hours from data, never hard-code them.
4. **Use the repo's skills.** They live in `.claude/skills/<name>/SKILL.md` (the Matt Pocock
   engineering skills and this project's brand/content skills). Your task prompt names the ones
   that fit; open that `SKILL.md` and follow it. `brand-system` is locked: it wins over any
   design tool's suggestion, including `/impeccable`.
5. **Say what you verified.** End your reply with the exact command you ran to check your work
   and its result, or "not verified".
