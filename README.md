# Hakkoda Safety Dashboard

Offline-first regional safety dashboard for a June 2026 trip through northern Tohoku, focused on Hakodate, Aomori, and Iwate.

This project is intentionally small and practical. It is not an emergency alert replacement. Official mobile alerts and local instructions remain the primary safety channel.

## Disclosure

This repository's initial planning documents, PWA scaffold, sample data structure, and GitHub Actions placeholder were generated with OpenAI Codex, GPT-5, in Codex desktop on 2026-04-25.

The project direction, requirements, and publication decision were reviewed and approved by Ritsu.

## Goals

- Provide a phone-friendly PWA that can be added to the home screen.
- Keep the latest risk summary available offline.
- Surface fast links to official disaster, weather, transport, bear, and evacuation information by region.
- Run a scheduled update about every 12 hours during travel preparation and the trip.
- Preserve project context so another Codex session can continue from the repo alone.

## Non-goals

- Do not replace JMA, Safety tips, Yahoo! Bousai, local government alerts, hotel instructions, or emergency broadcasts.
- Do not store sensitive travel details in a public repository.
- Do not scrape third-party sites unless the source is stable, permitted, and necessary.

## Current Recommendation

Version 1.0.0 runs on GitHub Pages and GitHub Actions.

Later, consider Cloudflare Pages + Workers Cron if private deployment, KV storage, webhook notifications, or cleaner scheduled updates become important.

## Current Status

- Project status: Version 1.0.0 complete.
- Live PWA: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`
- GitHub Pages serves the static app from `main`.
- The phone PWA can be installed and read offline.
- GitHub Actions updates `app/data.json` every 12 hours and can be run manually.
- JMA XML updater v1 fetches JMA long-term Atom feeds and summarizes relevant entries for Hakodate, Aomori, and Iwate.
- Visual Map v1 shows high-attention disaster events and links to human-readable official pages.
- Bear information uses `くまログあおもり` as the primary Aomori source, with official/manual sources and conservative text extraction where stable.
- Offline Emergency Mode v1 keeps first-action guidance readable from the app shell.
- Data Source v2 and Precision Sources v1 keep phone links focused on official, trip-relevant checks.
- Notification Layer v1 is live: it queues high-signal disaster notifications, sends through Gmail from GitHub Actions, and records successful delivery to avoid same-event repeats within 24 hours.
- Data Source Update 03.1 adds Aomori `くまログあおもり` previous-day and Hakkoda-focus bear rules, and stabilizes long-running Iwate bear-injury dedupe.
- Mountain Weather Simulation v0.1 adds an experimental personal weather-risk module for fixed trip locations, using JMA forecast data, AMeDAS observations, approximate altitude, and terrain weighting. It is not an official forecast and does not feed notifications.
- Gmail delivery has been verified with `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ALERT_EMAIL_TO` repository secrets.

## Safety Model

Use three layers:

1. Immediate alerts: phone apps such as Safety tips and Yahoo! Bousai.
2. Dashboard: offline-readable regional risk summary and official quick links.
3. Manual confirmation: hotel staff, local government pages, JMA, road and rail operators.

## Version 1 Scope

- Phone-first regional dashboard for Hakodate, Aomori, and Iwate.
- Offline-readable app shell, last known data, and emergency first actions.
- Scheduled official-source refresh through GitHub Actions.
- Visual Map event filtering for high-attention disaster signals.
- Focused manual source links for JMA, tsunami, landslide, bear, transport, evacuation, and trip-operation checks.
- Gmail notification delivery for high-signal disaster events only.
- Experimental personal weather simulation for 12 / 24 / 48 / 72 hour low / medium / high risk hints by fixed location.

## Operational Notes

- Manual refresh: GitHub Actions -> `Update dashboard data` -> `Run workflow` on `main`.
- Scheduled refresh: UTC `00:00` and `12:00`, currently Taiwan / Japan time `09:00` and `21:00`.
- If Gmail notification testing is needed, check the `Send Gmail notifications` step. All three env values should display as `***`.
- Do not commit private travel details, booking numbers, full emergency contacts, room details, or passwords.
- After the trip, rotate or delete the Google App Password used by `GMAIL_APP_PASSWORD` if the notification channel is no longer needed.

## Future Work

- Monitor live data quality during scheduled runs.
- Tune event-noise thresholds only after a clear false positive or false negative appears.
- Consider a higher update frequency during the trip if Gmail notifications need shorter latency.
- Consider Cloudflare Workers or another backend only if GitHub Actions cadence becomes insufficient.

## Handoff

Future Codex sessions should start with `docs/handoff.md`.
