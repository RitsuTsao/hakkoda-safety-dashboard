# Project Brief

Version: 0.3
Status: Project brief adopted
Scope: Concise orientation card for `hakkoda-safety-dashboard`

## Confidence Labels

Use labels only where they add value:

- `Confirmed`: Verified from current files, repo docs, live state, or Ritsu's explicit decision.
- `Inferred`: Reasonable conclusion from context, but not yet confirmed.
- `Needs Ritsu`: Requires Ritsu's product, scope, or risk decision.
- `Stale Risk`: May be outdated and should be rechecked before action.

## 1. Project Identity

- Project name: Hakkoda Safety Dashboard
- Short description: Phone-first, offline-readable Japan travel-safety decision-support PWA for a June 2026 northern Tohoku trip.
- Main workspace / repo / folder: `/Users/rthesage/Documents/New project 3`
- GitHub repo: `https://github.com/RitsuTsao/hakkoda-safety-dashboard`
- Live page: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`
- Last reviewed: 2026-07-04
- Last updated by: Codex
- Last update perspective: repo implementation status and cross-agent handoff orientation
- Update basis: current repo inspection, existing docs, app data, workflow file, and prior Ritsu-confirmed scope decisions

## 2. Project Goal

Provide a small, public-safe, phone-first PWA that helps Ritsu make conservative travel-safety decisions for Hakodate, Aomori / Hakkoda, and Iwate by combining official-source links, offline emergency guidance, scheduled data refreshes, and trip-specific risk summaries.

The project is decision support only. It is not an official alert service, emergency authority, or safety guarantee. Official apps, JMA, local government instructions, hotel staff, transport operators, and emergency broadcasts remain primary.

## 3. Users And Real-World Context

- Primary user: Ritsu, during and after planning a June 2026 northern Tohoku trip.
- Actual usage environment: phone-first GitHub Pages PWA, intended to be installable and readable offline after the app shell and data are cached.
- Important constraints in real use:
  - Public repository and public GitHub Pages deployment.
  - Use official sources and manual confirmation for safety-critical decisions.
  - Local preview requires an HTTP server; direct `file://` opening may block `app/data.json`.
  - The original trip dates have passed, so live trip relevance is now `Stale Risk` unless Ritsu reuses the project for another trip.
- What users should not need to understand: GitHub Actions internals, JMA XML details, app cache mechanics, source parser logic, or Gmail delivery history.

## 4. Current State

- What currently works:
  - Static dependency-free PWA under `app/`.
  - GitHub Pages live page.
  - Offline app shell and cached `app/data.json`.
  - Region tabs for Hakodate, Aomori, and Iwate.
  - Official quick links, emergency first-action guidance, visual event chips, bear information cards, landslide / operation panels, notification-rule display, and experimental weather-risk simulation.
  - GitHub Actions scheduled update workflow runs `node scripts/update-data.mjs` and commits `app/data.json`.
- What is incomplete or unreliable:
  - Safety relevance is tied to official-source availability and parser stability.
  - Some docs still contain historical notification-development details; use current workflow and README for live Gmail status.
  - Current `app/data.json` was generated on 2026-06-24, so data freshness is `Stale Risk` as of 2026-07-04.
- Known issues:
  - Gmail notification delivery is intentionally disabled after the trip; do not treat it as a broken feature to preserve.
  - Historical Gmail secrets may still exist in GitHub settings; README advises rotating or deleting unused app passwords.
- Latest working baseline:
  - Version marker: 1.0.0 complete.
  - Current local branch at brief update: `codex/disable-gmail-notifications`.
  - Service worker cache: `hakkoda-safety-v17`.
  - Workflow: `.github/workflows/update-data.yml` has no `Send Gmail notifications` step.
  - Notification state in `app/data.json`: `deliveryStatus: "disabled"`, `queued: []`.

## 5. Success Criteria

- What should work:
  - The live PWA opens on phone and desktop.
  - The app remains readable offline after installation/caching.
  - Official links and regional summaries remain useful for conservative manual confirmation.
  - Scheduled or manual data refresh updates `app/data.json` without Gmail delivery.
  - Public files do not contain sensitive travel details or secrets.
- How it will be verified:
  - Open the live page or local HTTP preview.
  - Run syntax checks on scripts after code edits.
  - Run `node scripts/update-data.mjs` when validating source refresh behavior.
  - Confirm GitHub Actions `Update dashboard data` runs without a Gmail-send step.
  - Check `app/data.json` parses and notification state remains disabled unless Ritsu explicitly changes scope.
- What requires Ritsu's personal judgment:
  - Whether this remains a completed personal trip tool, becomes a reusable travel-safety template, or is adapted for another trip.
  - Whether any future expansion is worth the maintenance and responsibility burden.

## 6. Scope

Current scope:

- Maintain a public-safe travel-safety decision-support PWA for Hakodate, Aomori / Hakkoda, and Iwate.
- Keep GitHub Pages as the static display layer.
- Keep scheduled official-source refresh through GitHub Actions.
- Preserve offline guidance and official-source quick links.
- Keep notification candidates visible as rule explanations while Gmail auto-delivery remains disabled.
- Keep the experimental weather-risk module clearly labeled as personal simulation, not official forecast.

## 7. Non-Goals

Do not do these unless Ritsu explicitly changes scope:

- Do not position the app as an official disaster-alert service.
- Do not re-enable Gmail delivery by default.
- Do not add sensitive travel details, booking data, room details, full emergency contacts, passwords, app passwords, tokens, or private notes.
- Do not turn trip-operation interruptions into disaster alerts.
- Do not use exact map coordinates or geospatial bear maps inside this PWA.
- Do not broaden to all-Japan disaster coverage without first redesigning the maintenance model and responsibility boundary.

## 8. Constraints And Risks

- Data / privacy: Public repo; keep only low-sensitivity trip context and public official links.
- External accounts or services: GitHub Pages, GitHub Actions, official data sources, historical Gmail repository secrets.
- Public visibility: Assume anything committed can be public.
- Maintenance burden: Source parsers can break when official pages change; expansion increases responsibility and noise risk.
- Time or cost: GitHub Actions cadence is sufficient for this small tool unless future reuse needs faster refresh or private backend behavior.
- Other: Post-trip source data may be stale; do not infer current travel safety from old `app/data.json` without rerunning source checks and official pages.

## 9. Start Here

| File / Link / Place | What it contains | Why inspect it |
| ------------------- | ---------------- | -------------- |
| `docs/handoff.md` | Main historical handoff and implementation notes | Best broad context, but contains some historical/stale notification details |
| `README.md` | Current product framing, live URL, status, non-goals, operational notes | Best concise current orientation |
| `docs/data-sources.md` | Source policy, official links, parser notes, non-authoritative module boundaries | Explains what data is trusted and what must stay manual |
| `docs/implementation-plan.md` | Completed phases and acceptance criteria | Useful for understanding what Version 1 meant |
| `.github/workflows/update-data.yml` | Current scheduled refresh workflow | Confirms Gmail send is no longer called |
| `scripts/update-data.mjs` | Data refresh, source parsing, notifications, weather-risk generation | Main implementation file for updates |
| `app/index.html` | PWA UI and user-facing panels | Main user-facing app surface |
| `app/data.json` | Latest generated dashboard data | Check freshness and current notification state |
| `app/service-worker.js` | Cache version and offline shell behavior | Important for installed PWA refresh behavior |

## 10. Project-Specific Verification

- Local check:
  - `node --check scripts/update-data.mjs`
  - `node --check scripts/send-notifications.mjs` when touching historical notification code
  - `node scripts/update-data.mjs` when validating data refresh
- Visual or user-facing check:
  - Serve the repo through an HTTP server and open `/app/index.html`.
  - Check the live GitHub Pages URL when verifying deployed behavior.
  - On installed PWA changes, confirm service worker cache version is bumped when the app shell changes.
- Data / output check:
  - Confirm `app/data.json` parses as JSON.
  - Confirm `generatedAt` is recent when evaluating live data.
  - Confirm `notifications.deliveryStatus` remains `disabled` and `queued` remains empty unless Ritsu changes scope.
- Deployment or sharing check:
  - GitHub Actions manual `Update dashboard data` should run `Update data` and `Commit updated data`, with no Gmail-send step.
- What should be reported as untested:
  - Live phone PWA behavior if it was not opened on a phone.
  - GitHub Actions behavior if only local scripts were run.
  - Official-source freshness if `node scripts/update-data.mjs` was not rerun.

## 11. Durable Decisions

Only record durable decisions future agents are likely to incorrectly reopen or reverse. Do not store secrets here.

| Date | Decision | Confidence | Notes |
| ---- | -------- | ---------- | ----- |
| 2026-05-03 | Version 1.0.0 completed as a phone-first, offline-readable travel-safety PWA for Hakodate, Aomori, and Iwate. | `Confirmed` | Confirmed in README and implementation docs. |
| 2026-05-03 | The app is decision support, not an official alert replacement. | `Confirmed` | Official alerts, JMA, local instructions, hotel staff, and operators remain primary. |
| 2026-05-03 | Keep the repo public-safe; do not store sensitive travel details or secrets. | `Confirmed` | Public GitHub Pages context. |
| 2026-06-27 | Gmail auto-delivery is intentionally disabled after the trip. | `Confirmed` | Workflow no longer calls `scripts/send-notifications.mjs`; notification candidates remain visible as rule explanations. |
| 2026-06-27 | Do not debug Gmail SMTP credentials as a default path for this project. | `Confirmed` | If delivery is needed later, Ritsu must explicitly reopen scope. |
| 2026-06-27 | Best expansion framing is template-based travel-safety decision support, not broad public safety authority. | `Inferred` | Based on prior strategy discussion; confirm with Ritsu before product expansion. |

## 12. Open Questions

Keep only questions that block or meaningfully shape the next step.

| Question | Why it matters | Owner |
| -------- | -------------- | ----- |
| Should this project remain archived/completed, or become a reusable template for future trips? | Determines whether to invest in cleanup, docs, and template extraction. | Ritsu |
| Should historical Gmail secrets be rotated/deleted in GitHub if not already done? | Reduces account/security risk from unused notification credentials. | Ritsu |
| Should stale historical sections in `docs/handoff.md` be cleaned up? | Avoids future agents reopening disabled Gmail delivery or old notification assumptions. | Ritsu / Agent |

## 13. Next Actions

This is not a backlog. Keep only a small number of active items.

### Worth Doing Now

- Decide whether this repo should be treated as completed/archive, maintenance-only, or a future reusable template. `Needs Ritsu`
- If returning to live use, rerun `node scripts/update-data.mjs` and verify source freshness before trusting dashboard status. `Stale Risk`

### Consider Later

- Clean stale historical notification wording in `docs/handoff.md` if future agents keep getting confused.
- Extract a reusable travel-safety-dashboard template only after Ritsu confirms a future trip or broader reuse.

### Avoid For Now

- Re-enabling Gmail delivery without explicit scope change.
- Adding more notification categories without evidence that value outweighs noise.
- Expanding to all-Japan coverage before defining maintenance, responsibility, and trust boundaries.

## 14. Handoff Notes

- What another agent needs to know:
  - Start from this brief, then read `README.md` and `docs/handoff.md`.
  - Treat Gmail delivery as intentionally disabled, not broken.
  - Treat app data freshness as stale unless source refresh was rerun.
- Temporary role requested for this handoff:
  - Usually repo orientation, maintenance review, product-positioning review, or cautious source/parser update.
- Files or context to inspect:
  - `README.md`, `docs/handoff.md`, `docs/data-sources.md`, `scripts/update-data.mjs`, `app/index.html`, `app/data.json`, `.github/workflows/update-data.yml`.
- Decisions or assumptions that should not be silently reopened:
  - This is not an official alert system.
  - Public-safe data only.
  - Gmail delivery remains disabled unless Ritsu explicitly reopens it.
