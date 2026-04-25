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
- Aomori landslide warning system.
- Iwate and municipal hazard maps where relevant.

## Bears

Preferred:

- `くまログあおもり` for Aomori bear sightings and warnings.
- Aomori Prefecture official bear notices.
- Iwate Prefecture `Bears（ベアーズ）`, a bear sighting posting and viewing app accessed from the official Iwate LINE account.
- Iwaizumi Town `ツキノワグマ出没等情報マップ` for the Ryusendo / Iwaizumi area.

Dashboard implementation:

- Bear Info v1 is a manual workflow in the regional dashboard, not an automated bear feed.
- Aomori workflow checks `くまログあおもり`, Aomori Prefecture bear notices, and local operator / hotel notices before optional auxiliary map checks.
- Iwate workflow prioritizes the user's configured Iwate Bears LINE / App flow, then Iwaizumi Town's bear map for the Ryusendo / Iwaizumi segment.
- Cancel / downgrade rules are intentionally short: nearby recent sightings or official/local warnings cancel walks; weaker or older signals downgrade to short, daytime, managed-facility movement.
- Kumamap remains auxiliary and must not override official or local instructions.

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

## Dashboard Link Policy

Each region should include direct links to:

- JMA current warnings.
- Tsunami warning page for coastal day.
- Bear map / official bear source.
- Road and transport status.
- Relevant city, transport, hotel, or operator notice page.
