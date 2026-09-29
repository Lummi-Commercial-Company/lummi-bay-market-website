# 0003 — Next.js (not Astro) to enable TinaCMS visual editing

Status: Accepted (supersedes the Astro choice in the initial scaffold)

## Context
The owner requires a WordPress-like editing experience: staff must never touch HTML.
The strongest form of that is **visual editing** — click text on the live page, edit it
in a sidebar, watch the preview update.

TinaCMS provides this, but its visual editing is implemented through a React hook
(`useTina`) and requires a React frontend. Astro support for it is experimental. On
Astro, staff would get only a form-based admin panel — good, but not click-to-edit.

A second requirement shaped the decision: Claude must be able to make content updates
through chat. That is only simple when content is stored as files in the git repo.
Database-backed CMSes (Payload, Storyblok, Sanity) put content behind an API, splitting
staff edits and Claude edits across two systems and requiring API tokens and scripts.

## Options considered
- **Next.js + TinaCMS** — visual editing + git-based files. Chosen.
- Astro + TinaCMS forms only — simplest, but no on-page editing.
- Astro + Storyblok/Payload — visual editing without React, but content leaves git.
- Payload CMS — most feature-rich (granular roles, media library, relationships,
  versioning), but database-backed and self-hosted; Payload Cloud paused new sign-ups
  after the Figma acquisition, so hosting and DB ops fall on the owner.
- WordPress — explicitly rejected by the owner.

## Decision
Build on **Next.js (App Router) + React**, with **TinaCMS** wired for visual editing.
Tina **free tier, 2 editor logins**. Deploy to **Vercel**.

## Consequences
- Pages and components are React; frontend-engineer works in Next.js, not Astro.
- Components carrying editable content need `"use client"` + `useTina`.
- Content stays as Markdown/JSON files in the repo → Claude can update the site through
  chat with a normal commit and push; Vercel rebuilds automatically.
- Accepted trade-off: no granular role-based permissions, no built-in media library or
  document version history. With 2 trusted editors and git history as the audit trail,
  this is acceptable. Revisit only if editor count or workflow complexity grows.
- Growth path if staff expands: **Team $24/mo covers 3 editors, Team Plus $41/mo covers 5.**

  *Corrected 17 Sep 2026.* This line previously read "Tina Team tier ($29/mo) covers up to 5
  editors" — one tier that does not exist at a price that is not charged, and it made the jump
  from 2 editors to 5 look like a single $29 step when it is two steps ending at $41. The figures
  above are the ones verified against tina.io in Aug 2026 and locked in `CLAUDE.md`. A wrong
  growth-path price is the kind of error that only surfaces in a budget conversation, which is the
  worst moment to find it.
