# Implementation Plan

Status: Version 1.0.0 is complete as of 2026-05-03.

## Phase 1: Static PWA Skeleton

- Complete.
- The app remains a dependency-free static PWA under `app/`.
- `app/service-worker.js` caches the app shell and `app/data.json` for offline use.

Acceptance criteria:

- Opens from GitHub Pages and as a local static app.
- Shows last update time, green / yellow / red state, and official links by region.
- Can cache shell and `data.json` for offline reading.

## Phase 2: GitHub Pages

- Complete.
- Live URL: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`.
- GitHub Pages source is `main` branch, root.

Acceptance criteria:

- Public URL opens on desktop and phone.
- Reload works.
- Offline mode shows the last cached data.

## Phase 3: Scheduled Data Update

- Complete.
- `scripts/update-data.mjs` fetches stable official sources and writes `app/data.json`.
- GitHub Actions runs on manual dispatch and a 12-hour schedule.
- Current schedule is UTC `00:00` and `12:00`.
- Current Taiwan / Japan wall-clock schedule is `09:00` and `21:00`.

Acceptance criteria:

- `node scripts/update-data.mjs` updates `app/data.json`.
- GitHub Actions can run manually.
- GitHub Actions can run every 12 hours.
- Workflow commits updated `app/data.json` back to `main`.

Implemented scope:

- JMA XML feed summaries.
- Human-readable official JMA links for visual events.
- Bear source manual workflows plus conservative official-page summaries.
- Trip-operation panels for Hakkoda Ropeway, JR Bus Tohoku, and Ryusendo.
- Landslide / debris-flow official manual-check panels.

## Phase 4: Notification Layer

- Complete.

- Generates notification candidates from high-signal disaster events only.
- Marks 三區域震度5以上地震, 青森 / 岩手津波注意報以上, 三區域土砂災害警戒情報以上, and 熊傷人 as immediate-class candidates.
- Sends selected notification candidates through Gmail after GitHub Secrets are configured.
- Uses `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ALERT_EMAIL_TO` as GitHub repository secrets.
- Keeps GitHub Pages as a display layer; GitHub Pages itself does not background-push.
- `scripts/send-notifications.mjs` records successful Gmail delivery in `app/data.json`.
- Same-event delivery is limited by the stored 24-hour state.

Acceptance criteria:

- Notifications avoid noise.
- Every notification links back to the dashboard and official source.
- Routine yellow events and trip-operation items do not notify.
- Gmail delivery has been verified from GitHub Actions.

## Version 1 Maintenance

- Keep this repo public-safe.
- Keep official apps and local instructions primary.
- Use manual `Run workflow` only when an immediate refresh is needed.
- Do not add more notification categories unless the value clearly outweighs noise.
- After the trip, rotate or delete the Google App Password used by `GMAIL_APP_PASSWORD` if Gmail notifications are no longer needed.
