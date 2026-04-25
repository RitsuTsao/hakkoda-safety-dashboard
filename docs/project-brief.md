# Project Brief

## User Context

The user is planning a trip to northern Tohoku from 2026-06-03 to 2026-06-13. The dashboard should organize safety information by region, not by daily itinerary, so the user can understand area-wide conditions during disruptions.

Known route:

- 2026-06-03: Taipei to Hakodate.
- 2026-06-04: Hakodate to Owani Onsen / Hirosaki.
- 2026-06-05: Hirosaki / Aomori to Sukayu Onsen.
- 2026-06-06 to 2026-06-08: Sukayu Onsen / Hakkoda area.
- 2026-06-09: Sukayu to Oirase / Towada Lake to Hachinohe.
- 2026-06-10: Hachinohe to Ryusendo.
- 2026-06-11: Ryusendo to Miyako / Jodogahama to Hanamaki.
- 2026-06-12: Hanamaki buffer day.
- 2026-06-13: Hanamaki to Taipei.

The Notion source page is titled `2026/6 八甲田山`.

## Dashboard Regions

- Hakodate: arrival area, coastal city risks, tsunami / evacuation links, airport and local transport.
- Aomori: Hirosaki, Owani, Aomori city, Sukayu, Hakkoda, Oirase, Towada, Hachinohe.
- Iwate: Ryusendo / Iwaizumi, Miyako / Jodogahama, Hanamaki.

## Main Risks

- Bears around Aomori / Hakkoda / Oirase and Iwate mountain areas.
- Iwate bear information should prioritize Iwate Prefecture `Bears（ベアーズ）` and Iwaizumi Town's bear sighting map; Kumamap Iwate is only an auxiliary manual map.
- Earthquakes and secondary impacts: road closures, landslides, power outages, transport disruption.
- Tsunami risk on the Miyako / Jodogahama coastal segment.
- Rainy season impacts: heavy rain, low visibility, stream trail risk, landslides.
- Fragile transfers: Sukayu to Oirase / Hachinohe, Hachinohe to Ryusendo, Ryusendo to Miyako / Hanamaki.

## Product Positioning

The dashboard is a decision-support surface, not an alerting authority.

It should answer:

- Which region currently needs attention?
- What official pages should I open immediately for this region?
- What are the cancel / downgrade conditions?
- What did the last update say, and when was it generated?
- What can I still read if mobile signal is poor?

## Privacy Rule

Assume the GitHub Pages version may be public.

Do not include:

- Passport numbers.
- Full emergency contact details.
- Booking numbers.
- Private personal notes.
- Exact room details.

Include only low-sensitivity trip context and public official links.
