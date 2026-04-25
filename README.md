# Hakkoda Safety Dashboard

Offline-first regional safety dashboard for a June 2026 trip through northern Tohoku, focused on Hakodate, Aomori, and Iwate.

This project is intentionally small and practical. It is not an emergency alert replacement. Official mobile alerts and local instructions remain the primary safety channel.

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

Start with GitHub Pages and GitHub Actions because the user already has a GitHub account and does not yet use Cloudflare.

Later, consider Cloudflare Pages + Workers Cron if private deployment, KV storage, webhook notifications, or cleaner scheduled updates become important.

## Safety Model

Use three layers:

1. Immediate alerts: phone apps such as Safety tips and Yahoo! Bousai.
2. Dashboard: offline-readable regional risk summary and official quick links.
3. Manual confirmation: hotel staff, local government pages, JMA, road and rail operators.

## Next Steps

1. Build the first dashboard UI in `app/`.
2. Fill `app/data.json` with realistic sample data.
3. Implement `scripts/update-data.mjs` to fetch official sources and write `app/data.json`.
4. Enable GitHub Pages.
5. Enable GitHub Actions workflow in `.github/workflows/update-data.yml`.
6. Test installation on phone as a PWA.
