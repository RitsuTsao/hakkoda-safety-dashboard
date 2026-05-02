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
- Visual Map v1.2:
  - Event priority was tuned after live-data QA: bear injury and volcano remain high-attention, while routine yellow wind / wave / fog / thunder advisories no longer crowd the visual map unless the text contains stronger escalation language such as `警戒`, `警報`, or `暴風`.
  - Yellow snow / avalanche events are hidden from the visual map outside winter months, currently December through March. Red snow events are still allowed through so an exceptional major hazard is not suppressed.
  - Source-link policy stayed conservative: JMA-derived visual events continue to open human-readable JMA pages with the XML source available as a secondary link. More precise landslide / river / road links should be added only after live data shows a stable signal that can be mapped to the right official source.
- Bear Info v1:
  - Aomori and Iwate region pages now render a dedicated `bearWorkflow` card.
  - The card shows official-priority bear sources, a short checking order, and compact cancel / downgrade rules.
  - Aomori prioritizes `くまログあおもり`, Aomori Prefecture bear notices, and local hotel / operator notices.
  - Iwate prioritizes the user's configured Iwate `Bears（ベアーズ）` LINE / App flow and Iwaizumi Town `ツキノワグマ出没等情報マップ`; Kumamap remains auxiliary.
- Bear Info v1.1:
  - `scripts/update-data.mjs` now extracts official text summaries from Aomori and Iwate bear pages.
  - Region bear cards render a `最新摘要` section before the manual workflow buttons.
  - Sources currently parsed: `くまログあおもり`, Aomori Prefecture bear warning page, Aomori City bear information page, Sukayu Onsen surrounding-information page, Iwate Prefecture warning page, Iwate Prefecture human-injury / sighting page, and Iwaizumi Town bird / wildlife damage category listing.
  - Human-injury bear terms create a red `bear-injury` visual map event, without attempting precise map coordinates.
  - Bear summary text intentionally keeps the original Japanese source language so it can be read directly or shown to local staff.
  - A bear-injury event can appear as a red visual-map chip, but a single historical injury item should not automatically make the entire Iwate tab red unless it is relevant to the trip focus area.
  - Visual-map event chips use icons by type: bear `🐻`, tsunami `🌊`, earthquake `🫨`, and other major events `⚠️`. Multiple chips in the same region use alternate slots to avoid overlap.
- Offline Emergency Mode v1:
  - `app/index.html` now includes a static, collapsed-by-default `離線緊急判斷` panel immediately below the overview.
  - The section is part of the app shell, so it remains readable even if `app/data.json` cannot refresh.
  - It covers the first action for post-earthquake, tsunami, landslide / road disruption, and direct bear-encounter situations.
  - JMA earthquake and tsunami links are included as core checks, with Safety tips, JARTIC, Environment Ministry bear guidance, and Aomori Prefecture bear guidance for manual confirmation when signal returns.
  - `app/service-worker.js` cache is bumped to `hakkoda-safety-v10` so installed PWAs refresh the app shell.
- Data Source v2:
  - Quick-link cards now show a compact source category badge so official source types are easier to scan on phone.
  - Quick-link cards are grouped by source type, with distinct backgrounds for earthquake / tsunami, bear, and weather / river-rain sources.
  - Quick links were pruned for phone use: total overview now has 4 buttons; Hakodate has 5; Aomori has 7; Iwate has 8.
  - The remaining quick links prioritize JMA / tsunami, bear, weather / river-rain, landslide / road, and a few trip-critical operators such as Hakkoda Ropeway, JR Bus Oirase, Ryusendo, JR Hokkaido, and Hakodate Airport.
  - Secondary or duplicate sources such as broad prefectural portals, duplicate road pages, generic rail status, Kumamap Iwate, Sanriku Railway, and local notice pages were removed from the phone quick-link grid for this iteration.
  - Iwate bear source buttons were also pruned to official Bears and Iwaizumi Town bear map only; Kumamap remains documented as an auxiliary source but is not surfaced as a primary phone button.
  - Iwate now includes a static `宮古 津波避難點陣` panel with selected Miyako City tsunami evacuation buildings, lightweight local landmarks, high-ground / sea-side orientation, and an official Miyako evacuation-list link.
  - The Miyako dot diagram is approximate and non-navigational; it is a fast reminder to move to high ground or an official evacuation building and then confirm with Miyako City / local instructions.
  - `app/service-worker.js` cache is bumped to `hakkoda-safety-v11` so installed PWAs refresh the app shell and new source links.
- Precision Sources v1:
  - Aomori and Iwate region pages now render a dedicated `土砂災害` card near the JMA summary.
  - Aomori uses the Aomori landslide danger system, Aomori prefectural landslide warning list, and JMA Aomori warnings as primary manual checks.
  - Iwate uses the Iwate landslide danger system, JMA Iwate warnings, and MLIT rain / river information as supporting checks.
  - Hakkoda Ropeway, JR Bus Tohoku, and Ryusendo operation sources are moved into collapsed `營運狀態` panels so trip-operation checks do not crowd the main disaster-information scroll.
  - `scripts/update-data.mjs` extracts operation summaries from Hakkoda Ropeway, JR Bus Tohoku `運行情報`, and Ryusendo `INFORMATION`, but these operation items do not feed the Visual Map or global critical-event list.
  - `app/service-worker.js` cache is bumped to `hakkoda-safety-v13` so installed PWAs refresh after the UI change.
- GitHub Actions scheduled update in `.github/workflows/update-data.yml`.
- Workflow runs manually and on a 12-hour schedule.
- Workflow actions have been upgraded to Node 24-compatible versions:
  - `actions/checkout@v6`
  - `actions/setup-node@v6`
  - `stefanzweifel/git-auto-commit-action@v7`

## Latest Completed Iteration

2026-05-03: Precision Sources v1 is in progress on branch `codex/precision-sources-v1`.

- Branch: `codex/precision-sources-v1`
- Changed files so far:
  - `app/data.json`
  - `app/index.html`
  - `app/service-worker.js`
  - `scripts/update-data.mjs`
  - `docs/data-sources.md`
  - `docs/handoff.md`
- Scope:
  - Add dedicated Aomori / Iwate `土砂災害` cards for official landslide danger systems and short cancel / downgrade rules.
  - Move Hakkoda Ropeway, JR Bus Tohoku, and Ryusendo operation checks into collapsed `營運狀態` panels so disaster information remains primary.
  - Add operation extraction for Hakkoda Ropeway status / mountain weather, JR Bus current status and route-relevant notices, and Ryusendo operation-related information notices.
  - Keep operation items out of Visual Map `criticalEvents`, even when an operation source is red, because these are trip decisions rather than disaster alerts.
- Local verification so far:
  - `scripts/update-data.mjs` ran successfully with network access.
  - Operation source statuses returned `ok` for Hakkoda Ropeway, JR Bus Tohoku, Ryusendo INFORMATION, and JR Bus Tohoku for Iwate.
  - Aomori operation latest includes Hakkoda Ropeway as red when the official page says `終日運休`, plus JR Bus current status and GW general-route notice.
  - Iwate operation latest includes JR Bus general-route notice, Ryusendo INFORMATION items, and JR Bus current status.
  - Live-data Visual Map remains focused on disaster events only: `岩手 熊被害` and `岩手山`; operation items are not promoted to the map.
  - `app/data.json` parses successfully and `git diff --check` passes.
  - Local preview server is available at `http://127.0.0.1:8003/app/index.html#aomori`; HTTP checks confirm `app/index.html` returns `text/html` and `app/data.json` includes the Hakkoda suspended-operation summary.
  - Browser automation was limited in this desktop environment: Chrome was visible through Computer Use, but system `open` and Playwright browser launch were not available. Use the local preview URL or Safari / Chrome manually for final visual QA before PR.

2026-05-02: Visual Map v1.2 is complete and deployed.

- Branch: `codex/visual-map-v1-2`
- Merged PR: `https://github.com/RitsuTsao/hakkoda-safety-dashboard/pull/8`
- Merge commit: `8617968 Merge pull request #8 from RitsuTsao/codex/visual-map-v1-2`
- Live page verified: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html#aomori`
- Changed files:
  - `app/data.json`
  - `app/service-worker.js`
  - `scripts/update-data.mjs`
  - `docs/data-sources.md`
  - `docs/handoff.md`
- Scope:
  - Hide yellow snow / avalanche visual-map events outside winter months while preserving them in regional JMA summaries.
  - Keep red snow events visible as an emergency exception.
  - Lower routine storm-advisory priority and hide non-escalated yellow wind / wave / fog / thunder advisories from the visual map.
  - Keep source-link behavior conservative: human-readable JMA page first, XML second, and no new landslide / river / road parser until live source quality is clearer.
  - Refocus Aomori quick links for the user's five-day Hakkoda / Sukayu stay: remove low-priority road / river buttons, add Aomori Prefecture LINE setup, Aomori City bear information, and Sukayu surrounding notices.
  - Strengthen the Aomori bear workflow for hiking decisions: set up Aomori Prefecture LINE `クマ情報`, register `くまログあおもり` email notifications if useful, and confirm with Sukayu / Hakkoda operators before entering trails.
  - Add Aomori City and Sukayu Onsen bear-related official / local pages to the automated bear-summary source list.
- Local verification:
  - `scripts/update-data.mjs` was run with network access and JMA / bear source statuses returned `ok`.
  - Current live-data visual events are only `岩手 熊被害` and `岩手山`; May snow / avalanche, frost, dry-air, routine wind / wave advisories, and generic Aomori bear information remain in text summaries but are hidden from the visual map.
  - After refining false-positive handling, Aomori City generic bear-information text is kept yellow and does not create a red bear-injury event by itself.
  - Aomori bear latest summary now includes four checked sources: Aomori City, Aomori Prefecture bear warning, Sukayu Onsen surrounding notice, and `くまログあおもり`.
  - Data assertions confirm Aomori quick links include `青森県 LINE`, `青森市 クマ情報`, and `酸湯温泉 周辺情報`, and no longer include the low-priority MLIT road button.
  - Local preview served on `http://127.0.0.1:8000/` and `http://127.0.0.1:8001/`; Safari rendered the updated Aomori page correctly.
  - Codex in-app browser showed `app/data.json` under the `index.html` URL during the final local preview, even though `curl` confirmed `index.html` returned `text/html`. Treat this as a Codex in-app browser / service-worker cache issue, not a PWA file issue, unless reproduced in Safari or on GitHub Pages.
  - `app/service-worker.js` cache is bumped to `hakkoda-safety-v12` so installed PWAs refresh after deployment.
- Post-merge verification:
  - GitHub Pages served `hakkoda-safety-v12`.
  - Live `app/data.json` includes Aomori quick links `青森県 LINE`, `青森市 クマ情報`, and `酸湯温泉 周辺情報`.
  - Live Aomori bear summary includes Aomori City, Aomori Prefecture, Sukayu Onsen, and `くまログあおもり`.
  - Live Visual Map events are `岩手 熊被害` and `岩手山`, with non-winter snow / avalanche and generic Aomori bear information hidden from the visual map.

2026-05-01: Data Source v2 is complete and deployed.

- Branch: `codex/data-source-v2`
- Merged PR: `https://github.com/RitsuTsao/hakkoda-safety-dashboard/pull/7`
- Merge commit: `95c61e9 Add Data Source v2 links`
- Live page verified: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html#iwate`
- Changed files:
  - `app/data.json`
  - `app/index.html`
  - `app/service-worker.js`
  - `docs/data-sources.md`
  - `docs/handoff.md`
- Scope:
  - Strengthened human-readable official links and visible source categories.
  - Added source-type button color and grouping for earthquake / tsunami, weather / river-rain, and bear sources.
  - Added and then pruned source buttons so the phone quick-link grid stays focused on high-priority field decisions.
  - Remaining quick links cover MLIT river, MLIT Tohoku road for Aomori, Aomori landslide, Iwate road, JARTIC in the overview, JR Hokkaido, Hakkoda Ropeway, JR Bus Oirase, Ryusendo, and Miyako evacuation sources.
  - Added Miyako tsunami evacuation static dot diagram under Iwate, including relative landmarks and an explicit escape-direction hint.
  - No new automated scraping was added.
- Local verification:
  - `app/data.json` parses successfully.
  - `git diff --check` passes.
  - `scripts/update-data.mjs` was run with network access; JMA and bear source statuses returned `ok`, and the new `staticMaps` field was preserved.
  - Local preview served at `http://127.0.0.1:8000/app/index.html#iwate`.
  - In-app browser check found no console errors and confirmed the Iwate links plus `宮古 津波避難點陣` render on a phone-width view.
- Post-merge verification:
  - GitHub Pages deployment completed successfully after merge.
  - Live service worker is `hakkoda-safety-v11`.
  - Live `app/index.html` contains Data Source v2 UI (`topic-quake` and `renderStaticMaps`).
  - Live `app/data.json` has Iwate quick links pruned to 8, includes `宮古 津波避難點陣`, and keeps Iwate bear source buttons to `岩手県 Bears` and `岩泉町 熊出没マップ`.
  - Ritsu checked the phone live page and confirmed the data presentation is OK.
- No manual GitHub Actions workflow run was needed because this iteration changed static source links, UI, and app-shell cache only. The existing scheduled update workflow can refresh live data on its normal cadence.

2026-05-01: Offline Emergency Mode v1 is complete and deployed.

- Merged PR: `https://github.com/RitsuTsao/hakkoda-safety-dashboard/pull/6`
- Merge commit: `97f843b Add offline emergency mode`
- Live page verified: `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html#aomori`
- Verified behavior:
  - `離線緊急判斷` is collapsed by default.
  - Opening the toggle shows earthquake, tsunami, landslide / road disruption, and `熊遭遇` first actions.
  - Bear encounter wording focuses on direct emergency response, not routine bear-sighting information.
  - Live service worker is `hakkoda-safety-v10`.
- No manual GitHub Actions workflow run was needed because this iteration changed static UI and app shell cache only, not the data updater.

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
- Bear Info v1.1 uses conservative official-page text extraction. It is not a precise sighting map and may need parser updates if official page layouts change.
- Bear injury summaries are surfaced as text and visual-map events only; the app does not attempt exact geocoding or map pins.
- The app has not yet implemented Notion Inbox notifications.
- The app is public GitHub Pages; privacy assumptions must stay conservative.

## Suggested Next Iterations

1. Continue Visual Map v1.1 QA and refinements.
   - Confirm the priority model with live data during a few scheduled updates.
   - Consider whether snow / avalanche should stay visible in shoulder-season prep mode or be hidden outside winter mountain travel.
   - Add source-specific links for landslide / river / road events when the signal quality is good enough.

2. Data Source follow-up after v2.
   - Data Source v2 is already merged and deployed.
   - Do not add more phone quick-link buttons by default; the current intent is a precise field-use grid.
   - Later refinement can add source-specific parsers only after signal quality is clear.

3. Bear Info v1.1 follow-up QA.
   - Confirm the new `最新摘要` text stays readable on phone.
   - Confirm the red `岩手 熊被害` visual-map event opens the official Iwate human-injury page.
   - Confirm Iwate remains yellow when the bear injury item is historical or not clearly tied to the user's focus route.
   - Confirm multiple Iwate chips, such as `🐻 岩手 熊被害` and `⚠️ 岩手山`, do not overlap on the visual map.
   - Monitor whether official page layout changes break summary extraction.

4. Offline Emergency Mode follow-up refinements.
   - Consider adding region-specific offline evacuation references only if they can stay public-safe and not become stale.
   - Keep the emergency section compact and collapsed by default so daily risk summaries remain prominent.

5. Notification Layer.
   - Only after dashboard signal quality improves.
   - Consider Notion Inbox digest for red or high-confidence yellow events.
   - Avoid noisy notifications.

## Suggested Prompt For New Project

Use this prompt in the new Project conversation:

> Please continue development of `RitsuTsao/hakkoda-safety-dashboard`. First read `docs/handoff.md`, then inspect the current repo state. The app is already deployed as a GitHub Pages PWA at `https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html`. Continue from the current implementation; do not restart from scratch. Offline Emergency Mode v1 and Data Source v2 were completed and deployed on 2026-05-01. The next likely task is Visual Map v1.1 noise reduction, Bear Info v1.1 follow-up QA, or carefully scoped source-link/parser refinement.

## Quick Verification Checklist

Before making further changes, a new Codex session should check:

- `app/index.html` contains `renderVisualMap`.
- `scripts/update-data.mjs` contains `buildCriticalEvents` and `humanReadableUrlForItem`.
- `.github/workflows/update-data.yml` uses Node 24-compatible action versions.
- `app/service-worker.js` cache version is current enough to force PWA refresh after UI changes. Current UI cache version after Data Source v2: `hakkoda-safety-v11`.
- The live site still opens on desktop and phone.
