# 0002 — TinaCMS for content editing (not Decap + Netlify Identity)

Status: Accepted (supersedes the initial Decap default). Framework implications: see ADR 0003.

## Context
Editors are non-technical staff who must update content — especially fuel prices —
without touching code or holding GitHub accounts. The initial scaffold assumed Decap
CMS with Netlify Identity + Git Gateway.

As of mid-2026, Netlify's **Git Gateway is deprecated** — that was the piece letting
non-GitHub editors save content. Remaining Decap paths are DecapBridge (a small
independent free service) or GitHub OAuth (requires a GitHub account per editor). When
weighed on security and reliability, GitHub OAuth is strongest, TinaCMS is a close
second from an established vendor, and DecapBridge is the least institutionally proven.

## Decision
Use **TinaCMS**. It is git-based (edits commit to the repo; the live static site keeps
serving even if the editing service is down), offers email logins so non-technical staff
need no GitHub account, is backed by a funded company with support and uptime
commitments, and has a free tier suited to this project's size.

## Consequences
- Content model is defined as TinaCMS collections; `/admin` is the Tina editor.
- Fuel prices and location data live in the repo (still a single source of truth); the
  live site is unaffected by any editing-service outage.
- Slightly heavier setup than the old Decap default, accepted for the security,
  reliability, and staff-friendly login it buys.
- Reversible only via a CMS migration, hence this record.
