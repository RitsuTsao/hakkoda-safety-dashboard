# Current Handoff

Version: 0.1
Status: Draft ready for use
Scope: One-time handoff packet for `hakkoda-safety-dashboard`

## Handoff Metadata

- Project: Hakkoda Safety Dashboard
- Handoff created: 2026-07-04
- Last updated: 2026-07-04
- Prepared by: Codex
- Prepared from: `docs/project-brief.md`, `README.md`, `docs/handoff.md`, workflow file, service worker, `app/data.json`, and current repo status
- Target tool / agent: ChatGPT, Sakana Fugu, Codex, or another AI agent
- Status: `draft`

## 1. Handoff Purpose

- Give another agent enough current context to review, continue, or advise on the Hakkoda Safety Dashboard without reopening settled scope or treating old notification details as current behavior.

## 2. Temporary Role Requested

- Temporary role: repo orientation, maintenance review, product-positioning review, or cautious source/parser update advisor
- Allowed action level: `review only / recommend changes`

## 3. Project Anchor

- Project brief: `docs/project-brief.md`
- Repo / folder / workspace: `/Users/rthesage/Documents/New project 3`
- GitHub repo: `https://github.com/RitsuTsao/hakkoda-safety-dashboard`
- Relevant branch / version / baseline:
  - Local branch at handoff creation: `codex/disable-gmail-notifications`
  - Version marker: 1.0.0 complete
  - Service worker cache: `hakkoda-safety-v17`
  - Notification delivery: Gmail auto-delivery disabled
- Related live URL or output: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`

## 4. Current Task Or Question

- Help Ritsu decide what, if anything, should happen next: keep the repo completed/archive, maintain it lightly, clean stale docs, or eventually extract a reusable travel-safety-dashboard template.

## 5. Current State Snapshot

- What is already done:
  - Phone-first GitHub Pages PWA exists for Hakodate, Aomori / Hakkoda, and Iwate.
  - Scheduled GitHub Actions data refresh exists.
  - Offline app shell, official links, emergency guidance, visual events, bear information, landslide/operation panels, notification-rule display, and experimental weather-risk simulation exist.
  - `docs/project-brief.md` has been updated to current project-card format.
- What is uncertain:
  - Whether Ritsu wants this repo archived, maintained, or turned into a reusable template.
  - Whether old Gmail repository secrets have been rotated or deleted.
- What is blocked:
  - Product direction for future reuse or cleanup.
- What was last verified:
  - Current workflow has no `Send Gmail notifications` step.
  - `app/service-worker.js` uses `hakkoda-safety-v17`.
  - `app/data.json` records `notifications.deliveryStatus: "disabled"` and `queued: []`.
- What is untested:
  - Live page behavior was not opened during this handoff.
  - Source freshness was not verified by rerunning `node scripts/update-data.mjs`.

## 6. Start Here

| File / Link / Context | Why it matters |
| --------------------- | -------------- |
| `docs/project-brief.md` | Current concise orientation and durable decisions |
| `README.md` | Current product framing, live URL, status, and operational notes |
| `docs/handoff.md` | Long historical handoff; useful but contains stale notification-development details |
| `.github/workflows/update-data.yml` | Confirms scheduled update no longer sends Gmail |
| `scripts/update-data.mjs` | Main source refresh, notification-rule, and weather-risk logic |
| `app/index.html` | Main user-facing PWA |
| `app/data.json` | Current generated data and notification state |
| `app/service-worker.js` | Offline/cache baseline |

## 7. Do Not Reopen Silently

- Protected decisions:
  - This is a travel-safety decision-support PWA, not an official alert system.
  - Public-safe data only; do not add sensitive travel details or secrets.
  - Gmail auto-delivery remains disabled unless Ritsu explicitly reopens scope.
  - Do not debug Gmail SMTP credentials as the default response to notification history.
- Challengeable assumptions:
  - Whether this should become a reusable template for future trips.
  - Whether stale sections in `docs/handoff.md` should be cleaned now or only if they cause confusion.
  - Whether GitHub Actions cadence remains enough for future reuse.

## 8. Requested Output

- Format: concise review or recommendation
- Level of detail: short, prioritized, and practical
- Must include:
  - Any recommended next step
  - Whether action is needed now or can wait
  - Any risk that requires Ritsu's confirmation
- Should avoid:
  - Reintroducing Gmail delivery
  - Treating old app data as current safety status
  - Proposing broad all-Japan expansion without maintenance framing
- Handoff success criterion:
  - The receiving agent returns a clear recommendation for archive / maintain / clean up / template extraction, without reopening protected decisions.

## 9. Risks Or Human Confirmation Needed

- Ritsu must decide whether this repo is completed/archive, maintenance-only, or a future template.
- Ritsu should confirm whether unused Gmail app-password secrets were rotated or deleted if that has not already happened.
- Any public deployment, workflow change, credential-related action, or expansion beyond the original regions needs explicit confirmation.

## 10. Notes For Return Handoff

If returning work, include:

- What files or live pages were reviewed.
- What was not inspected.
- What was verified versus left untested.
- Any assumptions about future reuse or product positioning.
- Any decision Ritsu must confirm before implementation.

