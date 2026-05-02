import { readFile, writeFile } from "node:fs/promises";

const dataPath = new URL("../app/data.json", import.meta.url);

const jmaFeeds = [
  {
    id: "extra",
    label: "JMA 随時情報",
    url: "https://www.data.jma.go.jp/developer/xml/feed/extra_l.xml"
  },
  {
    id: "eqvol",
    label: "JMA 地震火山情報",
    url: "https://www.data.jma.go.jp/developer/xml/feed/eqvol_l.xml"
  }
];

const regionKeywords = {
  hakodate: ["函館", "渡島", "檜山", "北海道"],
  aomori: ["青森", "津軽", "下北", "三八上北"],
  iwate: ["岩手県", "岩手", "盛岡", "久慈", "釜石", "大船渡", "花巻", "岩泉", "沿岸北部", "沿岸南部"]
};

const bearSources = {
  aomori: [
    {
      id: "kumalog-news",
      label: "くまログあおもり",
      url: "https://kumalog-aomori.info/",
      parser: parseAomoriKumalogNews
    },
    {
      id: "aomori-pref",
      label: "青森県 クマ情報",
      url: "https://www.pref.aomori.lg.jp/soshiki/kankyo/shizen/kuma_cyuui.html",
      parser: parseAomoriPrefBearPage
    },
    {
      id: "aomori-city",
      label: "青森市 クマ情報",
      url: "https://www.city.aomori.aomori.jp/kurashi_kankyo/kankyo/1002085/1010230.html",
      parser: parseAomoriCityBearPage
    },
    {
      id: "sukayu-info",
      label: "酸湯温泉 周辺情報",
      url: "https://sukayu.jp/information3/",
      parser: parseSukayuBearInfo
    }
  ],
  iwate: [
    {
      id: "iwate-warning",
      label: "岩手県 警報",
      url: "https://www.pref.iwate.jp/kurashikankyou/shizen/yasei/1049881/1043255.html",
      parser: parseIwateWarningPage
    },
    {
      id: "iwate-injury",
      label: "岩手県 人身被害",
      url: "https://www.pref.iwate.jp/kurashikankyou/shizen/yasei/1049881/1056087.html",
      parser: parseIwateInjuryPage
    },
    {
      id: "iwaizumi-news",
      label: "岩泉町 鳥獣被害対策",
      url: "https://www.town.iwaizumi.lg.jp/category/attribute/life/chouju/",
      parser: parseIwaizumiBearNews
    }
  ]
};

const redTerms = [
  "大津波警報",
  "津波警報",
  "特別警報",
  "土砂災害警戒情報",
  "噴火警戒レベル５",
  "噴火警戒レベル5",
  "噴火警戒レベル４",
  "噴火警戒レベル4",
  "噴火警戒レベル３",
  "噴火警戒レベル3",
  "震度７",
  "震度7",
  "震度６",
  "震度6",
  "震度５",
  "震度5"
];

const yellowTerms = [
  "津波注意報",
  "警報",
  "注意報",
  "震度４",
  "震度4",
  "地震情報",
  "大雨",
  "洪水",
  "暴風",
  "強風",
  "波浪",
  "高潮",
  "濃霧",
  "雷",
  "火山"
];

const eventProfiles = [
  {
    type: "tsunami",
    rank: 100,
    icon: "🌊",
    terms: ["大津波警報", "津波警報", "津波注意報", "津波"]
  },
  {
    type: "earthquake",
    rank: 95,
    icon: "🫨",
    terms: ["震度７", "震度7", "震度６", "震度6", "震度５", "震度5", "震度４", "震度4", "地震情報", "地震"]
  },
  {
    type: "volcano",
    rank: 90,
    icon: "⚠️",
    terms: ["噴火警戒レベル", "噴火", "火山", "降灰"]
  },
  {
    type: "landslide",
    rank: 85,
    icon: "⚠️",
    terms: ["土砂災害警戒情報", "土砂災害", "土砂"]
  },
  {
    type: "heavy-rain",
    rank: 80,
    icon: "⚠️",
    terms: ["大雨", "洪水", "氾濫", "浸水"]
  },
  {
    type: "storm",
    rank: 66,
    icon: "⚠️",
    terms: ["暴風", "強風", "波浪", "高潮"]
  },
  {
    type: "snow",
    rank: 62,
    icon: "⚠️",
    terms: ["大雪", "暴風雪", "なだれ", "雪崩"]
  },
  {
    type: "fog-thunder",
    rank: 45,
    icon: "⚠️",
    terms: ["濃霧", "雷"]
  }
];

const lowImpactAdvisoryTerms = [
  "乾燥",
  "空気の乾燥",
  "霜",
  "農作物",
  "火の取り扱い"
];

const winterMapMonths = new Set([12, 1, 2, 3]);

const stormEscalationTerms = [
  "警戒",
  "警報",
  "暴風"
];

const deescalationTerms = [
  "おそれはなくなりました",
  "おそれはなくなった"
];

const bearInjuryTerms = [
  "人身被害",
  "死亡事故",
  "亡くなり",
  "襲われ",
  "負傷",
  "けが",
  "怪我"
];

const bearWarningTerms = [
  "出没警報",
  "出没注意報",
  "警報",
  "注意報"
];

function nowInJapan() {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  return `${formatter.format(date).replace(" ", "T")}+09:00`;
}

function decodeXml(value = "") {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function stripTags(value = "") {
  return decodeXml(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return decodeXml(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "。")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "。")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/。+/g, "。")
    .trim();
}

function firstHtmlMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : "";
}

function firstDateText(html) {
  return (
    firstHtmlMatch(html, /更新日(?:付)?\s*(?:<\/span>)?\s*([^<。]+(?:日)?)/)
    || firstHtmlMatch(html, /data-publish-date="([^"]+)"/)
    || firstHtmlMatch(html, /<span class="update_date">([\s\S]*?)<\/span>/)
  ).replace(/^[:：\s]+/, "");
}

function compactText(value = "", maxLength = 150) {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function levelForBearText(text) {
  if (includesAny(text, bearInjuryTerms)) return "red";
  if (includesAny(text, bearWarningTerms) || text.includes("出没") || text.includes("目撃")) return "yellow";
  return "green";
}

function kindForBearText(text) {
  if (includesAny(text, bearInjuryTerms)) return "human-injury";
  if (includesAny(text, bearWarningTerms)) return "warning";
  return "sighting";
}

function makeBearItem({ title, summary, updated, source, url }) {
  const text = `${title} ${summary}`;
  return {
    level: levelForBearText(text),
    kind: kindForBearText(text),
    title: compactText(title || source, 86),
    updated,
    source,
    summary: compactText(summary || title || "公式ページで熊関連情報を確認してください。"),
    url
  };
}

function parseAomoriKumalogNews(html, source) {
  const title = firstHtmlMatch(html, /<h4[^>]*>([\s\S]*?)<\/h4>/)
    || firstHtmlMatch(html, /<meta property="og:title" content="([^"]+)"/);
  const summary = firstHtmlMatch(html, /<div id="news_comment"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)
    || firstHtmlMatch(html, /<meta property="og:description" content="([^"]+)"/);
  if (!title && !summary) return [];
  return [
    makeBearItem({
      title,
      summary,
      updated: firstDateText(html),
      source: source.label,
      url: source.url
    })
  ];
}

function parseAomoriPrefBearPage(html, source) {
  const title = firstHtmlMatch(html, /<h2>ツキノワグマ出没警報を発表します<\/h2>/)
    || firstHtmlMatch(html, /<h1>([\s\S]*?)<\/h1>/);
  const summary = firstHtmlMatch(html, /<div class="section1 sectionred">\s*<h2>ツキノワグマ出没警報を発表します<\/h2>[\s\S]*?<span class="bbb">([\s\S]*?)<\/span>/)
    || firstHtmlMatch(html, /<meta property="og:description" content="([^"]+)"/);
  if (!title && !summary) return [];
  return [
    makeBearItem({
      title: title || "青森県 クマ情報",
      summary,
      updated: firstDateText(html),
      source: source.label,
      url: source.url
    })
  ];
}

function parseAomoriCityBearPage(html, source) {
  const title = firstHtmlMatch(html, /<h1>([\s\S]*?クマ[\s\S]*?)<\/h1>/) || source.label;
  const summary = firstHtmlMatch(html, /(青森市では、下記SNS[\s\S]*?近づかないようにしてください。)/)
    || firstHtmlMatch(html, /<meta property="og:description" content="([^"]+)"/);
  if (!title && !summary) return [];
  const item = makeBearItem({
    title,
    summary: summary || "青森市公式 LINE、SNS、くまログで有害鳥獣情報を確認してください。",
    updated: firstDateText(html),
    source: source.label,
    url: source.url
  });
  return [{ ...item, level: "yellow", kind: "sighting" }];
}

function parseSukayuBearInfo(html, source) {
  const section = html.match(/<div class="info_date1">\s*(\d{4}\/\d{2}\/\d{2})\s*<\/div>\s*<div class="info_headline1"[^>]*>\s*ツキノワグマ出没情報管理システムのご案内\s*<\/div>[\s\S]*?<div class="info_txt1[^"]*">([\s\S]*?)<\/div>\s*<div class="clear_both/);
  if (!section) return [];
  const updated = section[1];
  const summary = stripHtml(section[2]);
  return [
    makeBearItem({
      title: "ツキノワグマ出没情報管理システムのご案内",
      summary,
      updated,
      source: source.label,
      url: source.url
    })
  ];
}

function parseIwateWarningPage(html, source) {
  const title = firstHtmlMatch(html, /<h3>([\s\S]*?警報[\s\S]*?)<\/h3>/)
    || firstHtmlMatch(html, /<h1>([\s\S]*?)<\/h1>/);
  const summary = firstHtmlMatch(html, /<div class="boxnotice">([\s\S]*?)<\/div>/);
  if (!title && !summary) return [];
  return [
    makeBearItem({
      title,
      summary,
      updated: firstDateText(html),
      source: source.label,
      url: source.url
    })
  ];
}

function parseIwateInjuryPage(html, source) {
  const title = firstHtmlMatch(html, /<h2>([\s\S]*?人身被害[\s\S]*?)<\/h2>/)
    || firstHtmlMatch(html, /<h1>([\s\S]*?)<\/h1>/);
  const summary = firstHtmlMatch(html, /<h2>[\s\S]*?人身被害[\s\S]*?<\/h2>\s*<div class="boxnotice">([\s\S]*?)<\/div>/)
    || firstHtmlMatch(html, /<p>\s*<strong>([\s\S]*?人身被害[\s\S]*?)<\/strong>\s*<\/p>/);
  if (!title && !summary) return [];
  return [
    makeBearItem({
      title,
      summary,
      updated: firstDateText(html),
      source: source.label,
      url: source.url
    })
  ];
}

function parseIwaizumiBearNews(html, source) {
  const matches = [...html.matchAll(/<span class="update_date">([\s\S]*?)<\/span>\s*<span class="title_link"><a href="([^"]+)">([\s\S]*?)<\/a><\/span>/g)];
  return matches
    .map(([, updated, path, title]) => ({
      updated: stripHtml(updated),
      title: stripHtml(title),
      url: new URL(path, source.url).toString()
    }))
    .filter((item) => /ツキノワグマ|クマ|熊|出没|被害|警報|注意報/.test(item.title))
    .slice(0, 3)
    .map((item) => makeBearItem({
      title: item.title,
      summary: item.title,
      updated: item.updated,
      source: source.label,
      url: item.url
    }));
}

function firstMatch(xml, pattern) {
  const match = xml.match(pattern);
  return match ? decodeXml(match[1].trim()) : "";
}

function parseAtomEntries(xml, feed) {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/g)].map(([entry]) => {
    const linkMatch = entry.match(/<link\b[^>]*href="([^"]+)"/);
    return {
      feed: feed.label,
      title: firstMatch(entry, /<title[^>]*>([\s\S]*?)<\/title>/),
      updated: firstMatch(entry, /<updated[^>]*>([\s\S]*?)<\/updated>/),
      author: stripTags(firstMatch(entry, /<author[^>]*>([\s\S]*?)<\/author>/)),
      content: stripTags(firstMatch(entry, /<content[^>]*>([\s\S]*?)<\/content>/)),
      url: linkMatch ? decodeXml(linkMatch[1]) : feed.url
    };
  });
}

function classifyEntry(entry) {
  const titleText = entry.title || "";
  const contentText = entry.content || "";

  // JMA generic titles often contain words like "特別警報・警報・注意報".
  // Red classification must come from the actual content, not the generic title.
  if (redTerms.some((term) => contentText.includes(term))) return "red";
  if (yellowTerms.some((term) => `${titleText} ${contentText}`.includes(term))) return "yellow";
  return "green";
}

function entryMatchesRegion(entry, regionId) {
  const text = `${entry.title} ${entry.content} ${entry.author}`;
  return regionKeywords[regionId].some((keyword) => text.includes(keyword));
}

function summarizeEntry(entry) {
  const compactContent = entry.content.length > 120 ? `${entry.content.slice(0, 117)}...` : entry.content;
  return {
    level: classifyEntry(entry),
    title: entry.title || entry.feed,
    updated: entry.updated,
    source: entry.feed,
    summary: compactContent || "JMA feed entry matched this region.",
    url: entry.url
  };
}

function highestLevel(items) {
  if (items.some((item) => item.level === "red")) return "red";
  if (items.some((item) => item.level === "yellow")) return "yellow";
  return "green";
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "hakkoda-safety-dashboard/0.1 (GitHub Actions)"
    }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function fetchJmaSummaries() {
  const feedResults = [];
  const allEntries = [];

  for (const feed of jmaFeeds) {
    try {
      const xml = await fetchText(feed.url);
      const entries = parseAtomEntries(xml, feed);
      feedResults.push({
        id: feed.id,
        label: feed.label,
        url: feed.url,
        status: "ok",
        entries: entries.length
      });
      allEntries.push(...entries);
    } catch (error) {
      feedResults.push({
        id: feed.id,
        label: feed.label,
        url: feed.url,
        status: "failed",
        error: error.message
      });
    }
  }

  const byRegion = Object.fromEntries(
    Object.keys(regionKeywords).map((regionId) => {
      const summaries = allEntries
        .filter((entry) => entryMatchesRegion(entry, regionId))
        .map(summarizeEntry)
        .sort((a, b) => Date.parse(b.updated || 0) - Date.parse(a.updated || 0))
        .slice(0, 3);

      return [
        regionId,
        {
          level: summaries.length ? highestLevel(summaries) : "green",
          summary: summaries.length ? `JMA 近期相關電文 ${summaries.length} 件。` : "JMA 長期 feed 未找到近期區域相關電文。",
          items: summaries
        }
      ];
    })
  );

  const failedCount = feedResults.filter((feed) => feed.status === "failed").length;
  return {
    checkedAt: nowInJapan(),
    status: failedCount === 0 ? "ok" : failedCount === jmaFeeds.length ? "failed" : "partial",
    feeds: feedResults,
    regions: byRegion
  };
}

async function fetchBearSummaries() {
  const byRegion = {};
  const sourceResults = [];

  for (const [regionId, sources] of Object.entries(bearSources)) {
    const items = [];

    for (const source of sources) {
      try {
        const html = await fetchText(source.url);
        const parsedItems = source.parser(html, source);
        sourceResults.push({
          regionId,
          id: source.id,
          label: source.label,
          url: source.url,
          status: "ok",
          items: parsedItems.length
        });
        items.push(...parsedItems);
      } catch (error) {
        sourceResults.push({
          regionId,
          id: source.id,
          label: source.label,
          url: source.url,
          status: "failed",
          error: error.message
        });
      }
    }

    const sortedItems = items
      .sort((a, b) => {
        if (a.level !== b.level) return a.level === "red" ? -1 : b.level === "red" ? 1 : 0;
        return String(b.updated || "").localeCompare(String(a.updated || ""));
      })
      .slice(0, 4);

    byRegion[regionId] = {
      level: sortedItems.length ? highestLevel(sortedItems) : "yellow",
      checkedAt: nowInJapan(),
      summary: sortedItems.length
        ? `公式熊情報 ${sortedItems.length} 件を確認。`
        : "公式熊情報を自動抽出できませんでした。手動で公式リンクを確認してください。",
      items: sortedItems
    };
  }

  return {
    checkedAt: nowInJapan(),
    status: sourceResults.every((source) => source.status === "ok") ? "ok" : "partial",
    sources: sourceResults,
    regions: byRegion
  };
}

function mergeRegionLevels(region, jmaRegion, jmaStatus) {
  if (jmaStatus !== "ok" && jmaStatus !== "partial") return "yellow";
  if (!jmaRegion) return region.level || "yellow";
  if (jmaRegion.level === "red") return "red";
  if (jmaRegion.level === "yellow") return "yellow";
  return region.level === "red" || region.level === "yellow" ? region.level : "green";
}

function mergeBearLevel(level, bearRegion) {
  if (!bearRegion) return level;
  if (bearRegion.level === "yellow" && level !== "red") return "yellow";
  return level;
}

function overallLevel(regions, jmaStatus) {
  if (jmaStatus === "failed") return "yellow";
  if (regions.some((region) => region.level === "red")) return "red";
  if (regions.some((region) => region.level === "yellow")) return "yellow";
  return "green";
}

function textForItem(item) {
  return `${item.title || ""} ${item.summary || ""}`;
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function profileForItem(item) {
  const text = textForItem(item);
  return eventProfiles.find((profile) => includesAny(text, profile.terms)) || {
    type: "other",
    rank: 30,
    icon: "⚠️"
  };
}

function isLowImpactAdvisory(item) {
  const text = textForItem(item);
  const hasOnlyLowImpactTerms = includesAny(text, lowImpactAdvisoryTerms)
    && !eventProfiles.some((profile) => profile.rank >= 60 && includesAny(text, profile.terms));
  return item.level !== "red" && hasOnlyLowImpactTerms;
}

function monthInJapan(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    month: "numeric"
  }).format(new Date()));
  return Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    month: "numeric"
  }).format(date));
}

function isOutOfSeasonSnowEvent(item) {
  if (item.level === "red") return false;
  if (profileForItem(item).type !== "snow") return false;
  return !winterMapMonths.has(monthInJapan(item.updated));
}

function isRoutineStormAdvisory(item) {
  if (item.level === "red") return false;
  const profile = profileForItem(item);
  if (profile.type !== "storm" && profile.type !== "fog-thunder") return false;
  const text = (item.summary || textForItem(item)).replace(/^【[^】]+】\s*/, "");
  if (includesAny(text, deescalationTerms)) return true;
  return !includesAny(text, stormEscalationTerms);
}

function mapPriorityForItem(item) {
  if (isLowImpactAdvisory(item)) return 0;
  if (isOutOfSeasonSnowEvent(item)) return 0;
  if (isRoutineStormAdvisory(item)) return 0;
  const profile = profileForItem(item);
  const levelBoost = item.level === "red" ? 1000 : item.level === "yellow" ? 100 : 0;
  return levelBoost + profile.rank;
}

function iconForItem(item) {
  const profile = profileForItem(item);
  if (profile.type !== "other") return profile.icon;
  return "⚠️";
}

function placeForEvent(regionId, item) {
  const text = `${item.title} ${item.summary}`;
  if (text.includes("岩手山")) return "岩手山";
  if (text.includes("青森県")) return "青森";
  if (text.includes("渡島") || text.includes("檜山")) return "函館周邊";
  if (text.includes("津軽")) return "津軽";
  if (text.includes("三八上北")) return "三八上北";
  if (text.includes("沿岸北部")) return "岩手沿岸北部";
  if (text.includes("沿岸南部")) return "岩手沿岸南部";
  return { hakodate: "函館", aomori: "青森", iwate: "岩手" }[regionId] || "北東北";
}

function humanReadableUrlForItem(item) {
  const text = `${item.title} ${item.summary}`;
  if (text.includes("津波")) return "https://www.jma.go.jp/bosai/map.html#contents=tsunami";
  if (text.includes("地震") || text.includes("震度")) return "https://www.jma.go.jp/bosai/map.html#contents=earthquake_map";
  if (text.includes("火山") || text.includes("噴火") || text.includes("降灰")) return "https://www.jma.go.jp/bosai/map.html#contents=volcano";
  return "https://www.jma.go.jp/bosai/map.html#contents=warning";
}

function normalizedEventKey(regionId, item) {
  const summary = (item.summary || "")
    .replace(/[０-９0-9]+日/g, "")
    .replace(/[０-９0-9]+時/g, "")
    .replace(/\s+/g, "");
  return `${regionId}:${profileForItem(item).type}:${placeForEvent(regionId, item)}:${summary.slice(0, 80)}`;
}

function buildBearCriticalEvents(regions) {
  return regions.flatMap((region) => {
    const items = region.bearWorkflow?.latest?.items || [];
    const injuryItems = items.filter((item) => item.level === "red" && item.kind === "human-injury");
    const preferred = injuryItems.find((item) => item.source?.includes("人身被害"))
      || injuryItems.find((item) => item.title.includes("発生"))
      || injuryItems[0];
    return (preferred ? [preferred] : [])
      .map((item) => ({
        regionId: region.id,
        level: "red",
        icon: "🐻",
        label: `${region.title} 熊被害`,
        summary: item.summary,
        source: item.source || "公式熊情報",
        type: "bear-injury",
        priority: 1088,
        url: item.url
      }));
  });
}

function buildCriticalEvents(regions) {
  const byRegion = regions.flatMap((region) => {
    const items = region.jma?.items || [];
    const seen = new Set();
    const prioritized = items
      .filter((item) => item.level === "red" || item.level === "yellow")
      .map((item) => ({
        item,
        priority: mapPriorityForItem(item),
        profile: profileForItem(item)
      }))
      .filter((event) => event.priority > 0)
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return Date.parse(b.item.updated || 0) - Date.parse(a.item.updated || 0);
      })
      .filter((item) => {
        const key = normalizedEventKey(region.id, item.item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const redCount = prioritized.filter((event) => event.item.level === "red").length;
    return prioritized
      .slice(0, redCount > 0 ? 2 : 1)
      .map(({ item, priority, profile }) => ({
        regionId: region.id,
        level: item.level,
        icon: iconForItem(item),
        label: placeForEvent(region.id, item),
        summary: item.summary,
        source: item.source || "JMA",
        type: profile.type,
        priority,
        url: humanReadableUrlForItem(item),
        xmlUrl: item.url
      }));
  });

  return byRegion
    .concat(buildBearCriticalEvents(regions))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
}

async function main() {
  const existing = JSON.parse(await readFile(dataPath, "utf8"));
  const jma = await fetchJmaSummaries();
  const bear = await fetchBearSummaries();

  const regions = existing.regions.map((region) => {
    const jmaRegion = jma.regions[region.id];
    const bearRegion = bear.regions[region.id];
    const mergedLevel = mergeRegionLevels(region, jmaRegion, jma.status);
    return {
      ...region,
      level: mergeBearLevel(mergedLevel, bearRegion),
      jma: jmaRegion,
      bearWorkflow: region.bearWorkflow
        ? {
            ...region.bearWorkflow,
            latest: bearRegion
          }
        : region.bearWorkflow
    };
  });

  const level = overallLevel(regions, jma.status);
  const feedStatusNote = jma.status === "ok"
    ? "JMA XML 長期 feed 已更新。"
    : jma.status === "partial"
      ? "JMA XML 部分 feed 抓取失敗，請手動確認官方頁。"
      : "JMA XML 抓取失敗，請手動確認官方頁。";

  const updated = {
    ...existing,
    generatedAt: nowInJapan(),
    sourceMode: `JMA XML updater v1; ${feedStatusNote}`,
    jma,
    bear,
    criticalEvents: buildCriticalEvents(regions),
    overall: {
      ...existing.overall,
      level,
      message: level === "red"
        ? "JMA XML 摘要偵測到紅色層級項目。請立刻開官方連結確認。"
        : level === "yellow"
          ? "JMA XML 已更新或部分更新。請把本頁當作官方連結與離線判斷卡。"
          : "JMA XML 未找到近期區域相關警戒電文；仍請以官方 App 與現地指示為準。",
      notes: [
        feedStatusNote,
        "手機即時警報以 Safety tips、Yahoo! 防災速報、JMA 與現地指示為準。",
        "熊資訊以官方推播或自治體地圖優先；Kumamap 僅作人工輔助。",
        "資料超過 18 小時未更新時，頁面會提示舊資料，請手動開官方來源確認。"
      ]
    },
    regions
  };

  await writeFile(dataPath, `${JSON.stringify(updated, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
