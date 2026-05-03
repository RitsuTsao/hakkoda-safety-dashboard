# Changelog

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
