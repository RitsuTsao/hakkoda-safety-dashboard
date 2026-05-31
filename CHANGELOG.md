# Changelog

## Unreleased - Final PWA cleanup

- Fixes 48 / 72 hour weather simulation metrics so expired short-range JMA values are not reused. Longer horizons now use available JMA weekly representative-area temperature and precipitation data.
- Adds Mountain Weather Simulation v0.1 with JMA forecast data, AMeDAS observations, approximate altitude correction, terrain weighting, and 12 / 24 / 48 / 72 hour personal-risk hints.
- Keeps the experimental weather module separate from official alerts, Visual Map events, and Gmail notifications.
- Collapses the full weather module by default, with a second collapsed layer for each fixed location.
- Shows a clear fallback message when the PWA is opened directly with `file://` and dynamic `data.json` loading is blocked.
- Clarifies that Gmail delivery is handled by GitHub Actions instead of showing the notification channel as pending setup.
- Labels previously delivered notification candidates as suppressed, with the suppression reason, instead of making them look newly queued.
- Bumps the installed-PWA cache to `hakkoda-safety-v16`.

## Unreleased - Data Source Update 03.1

- Makes Aomori bear automation use `くまログあおもり` sightings as the primary source.
- Adds a red Aomori bear rule when the previous full Japan-time day has more than 15 `ツキノワグマ` records.
- Adds a red Sukayu / Hakkoda activity-area rule using the approved term list only.
- Keeps PWA map output as HTML / grid-map presentation without exact map coordinates.
- Stabilizes Iwate bear-injury notification dedupe for long-running official source pages.

## Version 1.0.0 - 2026-05-03

First complete operational version of the Hakkoda Safety Dashboard.

- Publishes the phone-first PWA from GitHub Pages.
- Updates `app/data.json` through GitHub Actions on a 12-hour schedule and manual workflow dispatch.
- Summarizes official JMA XML feeds for Hakodate, Aomori, and Iwate.
- Provides Visual Map v1 high-attention event chips with human-readable official links.
- Includes Bear Info v1 / v1.1 manual workflows and conservative official-page summaries.
- Includes Offline Emergency Mode v1 in the app shell.
- Includes Data Source v2 and Precision Sources v1 focused official links.
- Includes Notification Layer v1 with Gmail delivery through GitHub Actions.
- Verifies Gmail notification delivery using repository secrets `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ALERT_EMAIL_TO`.

Operational note: this app is decision support only. Official phone alerts, JMA, local authorities, hotel staff, transport operators, and emergency broadcasts remain primary.
