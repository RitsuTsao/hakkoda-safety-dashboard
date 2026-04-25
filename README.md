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

The current MVP runs on GitHub Pages and GitHub Actions.

Later, consider Cloudflare Pages + Workers Cron if private deployment, KV storage, webhook notifications, or cleaner scheduled updates become important.

## Current Status

- Live PWA: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`
- GitHub Pages serves the static app from `main`.
- The phone PWA can be installed and read offline.
- GitHub Actions updates `app/data.json` every 12 hours and can be run manually.
- JMA XML updater v1 fetches JMA long-term Atom feeds and summarizes relevant entries for Hakodate, Aomori, and Iwate.
- Visual Map v1 shows high-attention events and links to human-readable JMA pages.
- Bear information is currently handled through official/manual sources, not automated scraping.

## Safety Model

Use three layers:

1. Immediate alerts: phone apps such as Safety tips and Yahoo! Bousai.
2. Dashboard: offline-readable regional risk summary and official quick links.
3. Manual confirmation: hotel staff, local government pages, JMA, road and rail operators.

## Next Steps

1. Visual Map v1.1: reduce low-impact warning noise and improve event priority.
2. Data Source v2: add better human-readable links for landslide, road, river, and transport status.
3. Bear Info v1: document official Aomori and Iwate bear-check workflow inside the dashboard.
4. Offline Emergency Mode: add a compact signal-poor checklist for tsunami, landslide, road disruption, and bear reports.
5. Notification Layer: later, add Notion Inbox or similar digest only for high-signal events.

## Handoff

Future Codex sessions should start with `docs/handoff.md`.
