---
name: strix-staging-only
description: >
  Use when running Strix pentests from Cursor. Restricts scans to owned
  local/staging targets, forbids unattended Slack automations, and limits
  this agent to applying patches (not writing exploit PoCs).
---

# Strix — staging only

## Allowed
- Local CLI or managed app.strix.ai against systems we own (this repo / staging).
- Hard budget cap. After findings, patch and open a PR.

## Forbidden
- Production, live player data, third-party vendors.
- Unattended Slack / Cursor Automations that launch Strix.
- Exploit PoCs or attack procedures in chat or the repo.
