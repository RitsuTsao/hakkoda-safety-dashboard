# Implementation Plan

## Phase 1: Static PWA Skeleton

- Create a usable mobile-first dashboard in `app/index.html`.
- Add `app/manifest.webmanifest`.
- Add `app/service-worker.js`.
- Add `app/data.json` sample data.
- Keep CSS and JavaScript simple and dependency-free.

Acceptance criteria:

- Opens locally as a static HTML file.
- Shows last update time.
- Shows green / yellow / red risk cards.
- Shows fast official links by region.
- Can cache shell and `data.json` for offline reading.

## Phase 2: GitHub Pages

- Publish `app/` through GitHub Pages.
- Confirm HTTPS URL.
- Test phone home-screen install.

Acceptance criteria:

- Public URL opens on phone.
- Reload works.
- Offline mode shows the last cached data.

## Phase 3: Scheduled Data Update

- Implement `scripts/update-data.mjs`.
- It should fetch official sources where stable.
- It should write `app/data.json`.
- It should preserve the prior known-good data if a fetch fails.

Initial scope:

- JMA XML feed summaries.
- Manual source links and status placeholders.
- Bear source link status, not automated scraping.

Acceptance criteria:

- `node scripts/update-data.mjs` updates `app/data.json`.
- GitHub Actions can run manually.
- GitHub Actions can run every 12 hours.

## Phase 4: Notification Layer

Only after the dashboard is stable:

- Generate notification candidates from high-signal disaster events only.
- Mark 三區域震度5以上地震, 青森 / 岩手津波注意報以上, 三區域土砂災害警戒情報以上, and 熊傷人 as immediate-class candidates.
- Send selected notification candidates through Gmail after GitHub Secrets are configured.
- Use `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ALERT_EMAIL_TO` as GitHub Secrets.
- Keep GitHub Pages as a display layer; do not assume it can background-push by itself.

Acceptance criteria:

- Notifications avoid noise.
- Every notification links back to the dashboard and official source.
- Routine yellow events and trip-operation items do not notify.
