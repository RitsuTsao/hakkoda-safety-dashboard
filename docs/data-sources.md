# Data Sources

Use official sources first. Third-party aggregators may be linked for convenience, but should not become the primary automated authority without checking terms and stability.

## Immediate Alert Apps

- Safety tips: official traveler-oriented disaster alert app. Use as primary multilingual phone alert layer.
- Yahoo! Bousai: useful secondary alert app in Japan.

## Weather, Earthquake, Tsunami, Volcano

- JMA disaster information XML PULL feeds.
- JMA public pages for warnings, advisories, earthquake information, tsunami warnings, volcanic warnings.

JMA XML updater v1:

- Uses JMA long-term Atom feeds because they are updated hourly and include several days of incoming bulletins.
- Fetches `https://www.data.jma.go.jp/developer/xml/feed/extra_l.xml` for warning / advisory style extra bulletins.
- Fetches `https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml` for earthquake and volcano bulletins.
- Parses Atom entry title, updated time, author, content summary, and linked XML URL.
- Matches regions by conservative Japanese keywords: Hakodate / Oshima / Hiyama / Hokkaido, Aomori area terms, and Iwate area terms.
- Keeps only the newest three matched entries per region for phone readability.
- Red classification is based on actual entry content, not generic JMA titles such as `気象特別警報・警報・注意報`.

Implementation notes:

- JMA XML is suitable for scheduled processing, but the dashboard should still link to live JMA pages because XML parsing can fail or be delayed.
- JMA states that XML distribution may stop or be delayed during maintenance or other circumstances, and users are responsible for how they use the public XML data.
- The updater is decision support, not an emergency alert substitute.

## Rain, Rivers, Landslides

- MLIT `川の防災情報`.
- MLIT disaster information portal.
- MLIT Tohoku road traffic / road weather information.
- Aomori landslide warning system.
- Iwate and municipal hazard maps where relevant.

Data Source v2 implementation:

- Add human-readable official links first; do not automate these sources yet.
- Keep the phone-facing quick links precise. Data Source v2 intentionally prunes duplicate / secondary buttons so the user can scan the page under stress.
- Global quick links include JMA, Safety tips, MLIT `川の防災情報`, and JARTIC.
- Aomori quick links include JMA, `くまログあおもり`, Aomori Prefecture LINE setup, Aomori City bear information, Aomori landslide information, Sukayu local notices, Hakkoda Ropeway, and JR Bus Oirase.
- Iwate quick links include JMA warning / tsunami pages, Iwate Bears, Iwaizumi bear map, MLIT river information, Iwate road information, Ryusendo, and Miyako evacuation information.
- Secondary sources such as generic prefectural portals, duplicate road pages, broad rail status pages, and auxiliary aggregator links can remain documented, but should not crowd the phone quick-link grid unless they become trip-critical.
- These links are manual confirmation sources. They should not change region status automatically until a stable parser and signal-quality rule are designed.

Precision Sources v1 implementation:

- Landslide / debris-flow information is treated as a primary disaster source and gets a dedicated regional `土砂災害` card.
- Aomori uses the official Aomori landslide danger system as the main phone link, with the prefectural warning-list page and JMA warnings as cross-checks.
- Iwate uses the official Iwate landslide danger system as the main phone link, with JMA warnings and MLIT rain / river information as supporting checks.
- Landslide systems are map-heavy and should remain official manual confirmation links for now; do not promote them into automatic region-level status until the signal can be parsed by municipality or trip focus area.
- Trip-operation sources such as Hakkoda Ropeway, JR Bus, and Ryusendo are intentionally moved out of primary quick links and into collapsed regional `營運狀態` panels so they do not crowd disaster scrolling.

## Bears

Preferred:

- `くまログあおもり` for Aomori bear sightings and warnings.
- Aomori Prefecture official bear notices.
- Iwate Prefecture `Bears（ベアーズ）`, a bear sighting posting and viewing app accessed from the official Iwate LINE account.
- Iwaizumi Town `ツキノワグマ出没等情報マップ` for the Ryusendo / Iwaizumi area.

Dashboard implementation:

- Bear Info v1 is a manual workflow in the regional dashboard, not an automated bear feed.
- Aomori workflow checks `くまログあおもり`, Aomori Prefecture bear notices, and local operator / hotel notices before optional auxiliary map checks.
- For an extended Hakkoda / Sukayu stay, the Aomori bear workflow should emphasize push setup and local confirmation:
  - Add Aomori Prefecture LINE and configure the `クマ情報` city / town settings for likely areas such as Aomori City, Towada City, and Kuroishi City.
  - Register in `くまログあおもり` if the user wants email notifications for selected areas.
  - Check Aomori City bear information and Sukayu / Hakkoda operator notices before hiking.
  - Do not interpret missing map data as safety when prefecture-wide warnings are active or local staff cannot confirm current conditions.
- Iwate workflow prioritizes the user's configured Iwate Bears LINE / App flow, then Iwaizumi Town's bear map for the Ryusendo / Iwaizumi segment.
- Cancel / downgrade rules are intentionally short: nearby recent sightings or official/local warnings cancel walks; weaker or older signals downgrade to short, daytime, managed-facility movement.
- Kumamap remains auxiliary and must not override official or local instructions.

Bear Info v1.1 implementation:

- The scheduled updater extracts short text summaries from official bear pages where the HTML is readable.
- Aomori summary sources:
  - `くまログあおもり` front-page prefectural notice.
  - Aomori Prefecture `クマの出没に注意してください！`.
  - Aomori City `クマ等の出没情報`.
  - Sukayu Onsen surrounding-information notices when a bear-related item is posted.
- Iwate summary sources:
  - Iwate Prefecture `ツキノワグマの出没に関する警報について`.
  - Iwate Prefecture `ツキノワグマによる人身被害状況・出没状況`.
  - Iwaizumi Town `鳥獣被害対策` listing for bear-related official notices.
- A red bear event is added to the visual map only when an official text item contains human-injury style terms such as `人身被害`, `襲われ`, or `死亡事故`.
- This is still text extraction, not a precise geospatial map. If an official page layout changes, the dashboard should show manual links and the parsing should be adjusted.

Iwate implementation notes:

- `Bears（ベアーズ）` is a good manual source, but currently should not be treated as a clean automated API.
- Iwaizumi Town provides a municipal bear sighting map page; this is especially relevant to the Ryusendo segment.
- For urgent danger, Iwate Prefecture instructs users to contact police / emergency services or municipal offices; a dashboard link is not a substitute for reporting.

Kumamap:

- `https://kumamap.com/ja/map` is useful as a fast manual map link.
- `https://kumamap.com/ja/areas/iwate` is useful as an Iwate-specific auxiliary view.
- Do not automate scraping unless a stable public API or clear permission is found.
- The map page is JavaScript-driven, so raw HTML is not enough for reliable data extraction.

## Transport

- JARTIC for road traffic and closures.
- JR East / JR Hokkaido for rail status.
- JR Bus Tohoku for Oirase / Towada routes.
- Sanriku Railway for coastal transfer.
- Hakkoda Ropeway and Sukayu Onsen for local mountain operations.
- Ryusendo official page for cave operation status.

Precision Sources v1 transport / operation extraction:

- Hakkoda Ropeway official homepage is parsed for ropeway operation status and summit weather / wind / visibility. This is trip-critical for Hakkoda hiking, but should not create a visual-map disaster event.
- JR Bus Tohoku `運行情報` is parsed for the current operation statement and route-relevant notices. The parser filters for route terms such as Oirase / Towada / Aomori and Morioka-Iwaizumi-Ryusendo.
- Ryusendo `INFORMATION` listing is parsed for recent operation-related notices such as closure, reopening, increased water, one-way tourist routes, operating hours, and event crowding.
- Operation summaries may be red inside the collapsed operation panel, but should not change `criticalEvents` or the visual map. This keeps disaster information first while still preserving offline trip-critical context.

## Dashboard Link Policy

Each region should include direct links to:

- JMA current warnings.
- Tsunami warning page for coastal day.
- Bear map / official bear source.
- Road and transport status.
- Relevant city, transport, hotel, or operator notice page.

For coastal Iwate:

- The dashboard includes a static `宮古 津波避難點陣` panel based on Miyako City official tsunami evacuation building / evacuation place pages.
- The point diagram is intentionally approximate and is not a navigation map.
- The dot diagram may include lightweight relative landmarks such as Miyako Station, Miyako Port, the Hei River, and high-ground direction. Keep these as orientation cues only; do not imply turn-by-turn navigation or precise coordinates.
- In a real tsunami situation, the first action remains immediate movement to nearby high ground or an official evacuation building; the official Miyako City list and local instructions remain authoritative.
