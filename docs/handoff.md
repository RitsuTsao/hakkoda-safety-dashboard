# Handoff Notes for Future Codex Sessions

This is the primary handoff file. If a new conversation starts, read these files in order:

1. `docs/handoff.md`
2. `README.md`
3. `docs/project-brief.md`
4. `docs/data-sources.md`
5. `docs/implementation-plan.md`

## User Context

Ritsu is planning a June 2026 northern Tohoku trip. The dashboard is organized by region instead of by daily itinerary:

- Hakodate
- Aomori
- Iwate

The product is a phone-first PWA for decision support during disruption. It is not an emergency alert authority. Official phone alerts, JMA, local government instructions, hotel staff, transport operators, and emergency broadcasts remain primary.

## Repo And Deployment

- GitHub repo: `RitsuTsao/hakkoda-safety-dashboard`
- Live page: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`
- GitHub Pages source: `main` branch, `/(root)`.
- Root `index.html` redirects to `app/index.html`.
- The app is intentionally dependency-free: static HTML, CSS, JS, JSON, service worker.

## Current Implementation

Implemented:

- Mobile-first PWA shell in `app/index.html`.
- PWA manifest in `app/manifest.webmanifest`.
- Service worker in `app/service-worker.js`.
- Offline cache for the app shell and `app/data.json`.
- Region tabs for Hakodate, Aomori, Iwate.
- Overall green / yellow / red status.
- Region-specific quick links and red-condition decision prompts.
- JMA XML summaries per region.
- Visual Map v1:
  - A simple grid map for Hakodate, Aomori, Iwate.
  - Critical event chips generated from `app/data.json`.
  - Tapping a visual event opens a human-readable JMA page, not raw XML.
- Visual Map v1.1:
  - Map events now use an explicit priority model: red first, then tsunami, earthquake, volcano, landslide, heavy rain / flood, storm, and snow / avalanche.
  - Low-impact dry-air / frost / agricultural advisories are kept in JMA summaries but hidden from the visual map.
  - Visual event rows expose both the human-readable JMA page and the raw XML source.
- Bear Info v1:
  - Aomori and Iwate region pages now render a dedicated `bearWorkflow` card.
  - The card shows official-priority bear sources, a short checking order, and compact cancel / downgrade rules.
  - Aomori prioritizes `くまログあおもり`, Aomori Prefecture bear notices, and local hotel / operator notices.
  - Iwate prioritizes the user's configured Iwate `Bears（ベアーズ）` LINE / App flow and Iwaizumi Town `ツキノワグマ出没等情報マップ`; Kumamap remains auxiliary.
- GitHub Actions scheduled update in `.github/workflows/update-data.yml`.
- Workflow runs manually and on a 12-hour schedule.
- Workflow actions have been upgraded to Node 24-compatible versions:
  - `actions/checkout@v6`
  - `actions/setup-node@v6`
  - `stefanzweifel/git-auto-commit-action@v7`

## Data Update Pipeline

Main updater:

- File: `scripts/update-data.mjs`
- Output: `app/data.json`
- Current version: JMA XML updater v1 plus Visual Map v1.1 event generation.

Current JMA feeds:

- `https://www.data.jma.go.jp/developer/xml/feed/extra_l.xml`
- `https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml`

Updater behavior:

- Fetches JMA long-term Atom feeds.
- Parses entry title, updated time, author, content summary, and XML URL.
- Matches entries to Hakodate, Aomori, and Iwate by conservative Japanese keywords.
- Keeps the newest three matched JMA items per region.
- Classifies status as green / yellow / red.
- Red classification is based on actual content, not generic JMA titles.
- Generates `criticalEvents` for the visual map.
- `criticalEvents` are filtered and sorted by map priority, so routine advisories do not crowd the map.
- Visual events keep the raw XML URL as `xmlUrl`, but `url` points to a human-readable JMA page:
  - tsunami: `https://www.jma.go.jp/bosai/map.html#contents=tsunami`
  - earthquake: `https://www.jma.go.jp/bosai/map.html#contents=earthquake_map`
  - volcano / ashfall: `https://www.jma.go.jp/bosai/map.html#contents=volcano`
  - other warnings: `https://www.jma.go.jp/bosai/map.html#contents=warning`

## Important Decisions

- Use GitHub Pages and GitHub Actions for MVP.
- Avoid Cloudflare until a clear need appears.
- Keep the repo public-safe: no passport numbers, full emergency contacts, booking numbers, room details, or private notes.
- Prefer official sources over aggregators.
- Use Kumamap only as a manual auxiliary link unless a stable public API or clear permission is found.
- Iwate bear information should prioritize the official Iwate `Bears（ベアーズ）` LINE flow and Iwaizumi Town information.
- For phone use, Visual Map event taps should open human-readable official pages, not raw XML.

## Known Limitations

- JMA XML matching is keyword-based and intentionally conservative.
- Visual Map event placement is approximate by region, not geographic coordinates.
- General JMA warning entries can create yellow events that are useful but noisy.
- Bear sources are currently manual links and official app / LINE setup, not automated feeds.
- Bear Info v1 is manual workflow guidance only; it does not scrape or automate official bear sighting data.
- The app has not yet implemented Notion Inbox notifications.
- The app is public GitHub Pages; privacy assumptions must stay conservative.

## Suggested Next Iterations

1. Continue Visual Map v1.1 QA and refinements.
   - Confirm the priority model with live data during a few scheduled updates.
   - Consider whether snow / avalanche should stay visible in shoulder-season prep mode or be hidden outside winter mountain travel.
   - Add source-specific links for landslide / river / road events when the signal quality is good enough.

2. Data Source v2: add better human-readable official links.
   - MLIT river / road disaster pages.
   - Aomori landslide warning page.
   - Iwate road and municipal pages.
   - Transport operator status links.

3. Bear Info v1 follow-up QA.
   - Confirm the Aomori and Iwate official bear links still open cleanly on phone.
   - Confirm wording is short enough in installed PWA mode.
   - Consider adding offline emergency bear behavior only if it stays concise.

4. Offline Emergency Mode.
   - Add a compact section for signal-poor moments:
     - what to check first,
     - what to check after a strong earthquake,
     - what to do for tsunami,
     - what to do for landslide / road disruption,
     - what to do for bear reports.
   - Include JMA earthquake information as a core check, especially because the 2026-04-20 Sanriku offshore earthquake and the JMA `北海道・三陸沖後発地震注意情報` make follow-on earthquake awareness relevant for this route.

5. Notification Layer.
   - Only after dashboard signal quality improves.
   - Consider Notion Inbox digest for red or high-confidence yellow events.
   - Avoid noisy notifications.

## Suggested Prompt For New Project

Use this prompt in the new Project conversation:

> Please continue development of `RitsuTsao/hakkoda-safety-dashboard`. First read `docs/handoff.md`, then inspect the current repo state. The app is already deployed as a GitHub Pages PWA at `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`. Continue from the current implementation; do not restart from scratch. The next likely task is Visual Map v1.1 noise reduction and source-link refinement.

## Quick Verification Checklist

Before making further changes, a new Codex session should check:

- `app/index.html` contains `renderVisualMap`.
- `scripts/update-data.mjs` contains `buildCriticalEvents` and `humanReadableUrlForItem`.
- `.github/workflows/update-data.yml` uses Node 24-compatible action versions.
- `app/service-worker.js` cache version is current enough to force PWA refresh after UI changes.
- The live site still opens on desktop and phone.
