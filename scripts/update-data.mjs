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

const operationSources = {
  aomori: [
    {
      id: "hakkoda-ropeway",
      label: "八甲田ロープウェー",
      url: "https://hakkoda-ropeway.jp/",
      parser: parseHakkodaRopeway
    },
    {
      id: "jrbus-tohoku",
      label: "JR Bus 東北 運行情報",
      url: "https://www.jrbustohoku.co.jp/service/",
      parser: parseJrBusTohokuService
    }
  ],
  iwate: [
    {
      id: "ryusendo-info",
      label: "龍泉洞 INFORMATION",
      url: "https://www.iwate-ryusendo.jp/information/",
      parser: parseRyusendoInformation
    },
    {
      id: "jrbus-tohoku",
      label: "JR Bus 東北 運行情報",
      url: "https://www.jrbustohoku.co.jp/service/",
      parser: parseJrBusTohokuService
    }
  ]
};

const weatherForecastSources = {
  hakodate: {
    id: "017000",
    label: "JMA 函館地方気象台",
    url: "https://www.jma.go.jp/bosai/forecast/data/forecast/017000.json"
  },
  aomori: {
    id: "020000",
    label: "JMA 青森地方気象台",
    url: "https://www.jma.go.jp/bosai/forecast/data/forecast/020000.json"
  },
  iwate: {
    id: "030000",
    label: "JMA 盛岡地方気象台",
    url: "https://www.jma.go.jp/bosai/forecast/data/forecast/030000.json"
  }
};

const amedasLatestTimeUrl = "https://www.jma.go.jp/bosai/amedas/data/latest_time.txt";

const weatherRiskLocations = [
  {
    id: "hakodate",
    title: "函館",
    regionId: "hakodate",
    forecastSourceId: "hakodate",
    forecastArea: "渡島地方",
    weeklyArea: "渡島・檜山地方",
    tempArea: "函館",
    amedasId: "23232",
    altitudeM: 20,
    baselineAltitudeM: 35,
    profile: "coast",
    terrain: ["沿岸", "城市"]
  },
  {
    id: "hirosaki",
    title: "弘前",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "弘前",
    weeklyTempArea: "青森",
    amedasId: "31461",
    altitudeM: 40,
    baselineAltitudeM: 30,
    profile: "inland",
    terrain: ["內陸", "城市"]
  },
  {
    id: "owani-onsen",
    title: "大鰐溫泉",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "弘前",
    weeklyTempArea: "青森",
    amedasId: "31461",
    altitudeM: 80,
    baselineAltitudeM: 30,
    profile: "foothill",
    terrain: ["山麓", "溫泉地"]
  },
  {
    id: "sukayu-onsen",
    title: "酸湯溫泉旅館",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "青森",
    amedasId: "31482",
    altitudeM: 890,
    baselineAltitudeM: 3,
    profile: "mountain-base",
    terrain: ["山區", "高海拔", "住宿基地"]
  },
  {
    id: "hakkoda-ropeway-park",
    title: "八甲田纜車山頂公園",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "青森",
    amedasId: "31482",
    altitudeM: 1320,
    baselineAltitudeM: 3,
    profile: "exposed-mountain",
    terrain: ["山區", "高海拔", "曝露地形", "纜車"]
  },
  {
    id: "kenashitai",
    title: "毛無岱",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "青森",
    amedasId: "31482",
    altitudeM: 1050,
    baselineAltitudeM: 3,
    profile: "wetland-boardwalk",
    terrain: ["山區", "濕地", "木道"]
  },
  {
    id: "hakkoda-odake",
    title: "八甲田山大岳",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "津軽",
    weeklyArea: "津軽",
    tempArea: "青森",
    amedasId: "31482",
    altitudeM: 1585,
    baselineAltitudeM: 3,
    profile: "summit",
    terrain: ["山區", "高海拔", "稜線", "曝露地形"]
  },
  {
    id: "oirase-trail",
    title: "奧入瀨步道",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "三八上北",
    weeklyArea: "下北・三八上北",
    tempArea: "八戸",
    amedasId: "31586",
    altitudeM: 300,
    baselineAltitudeM: 27,
    profile: "gorge",
    terrain: ["溪谷", "步道", "水邊"]
  },
  {
    id: "towada-jinja",
    title: "十和田神社",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "三八上北",
    weeklyArea: "下北・三八上北",
    tempArea: "八戸",
    amedasId: "31662",
    altitudeM: 410,
    baselineAltitudeM: 27,
    profile: "lakeside-forest",
    terrain: ["湖畔", "森林", "山區"]
  },
  {
    id: "hachinohe",
    title: "八戶",
    regionId: "aomori",
    forecastSourceId: "aomori",
    forecastArea: "三八上北",
    weeklyArea: "下北・三八上北",
    tempArea: "八戸",
    amedasId: "31602",
    altitudeM: 25,
    baselineAltitudeM: 27,
    profile: "coast",
    terrain: ["沿岸", "城市"]
  },
  {
    id: "ryusendo-iwaizumi",
    title: "龍泉洞／岩泉",
    regionId: "iwate",
    forecastSourceId: "iwate",
    forecastArea: "沿岸北部",
    weeklyArea: "沿岸",
    tempArea: "宮古",
    amedasId: "33326",
    altitudeM: 160,
    baselineAltitudeM: 43,
    profile: "karst-gorge",
    terrain: ["洞穴", "溪谷", "山區"]
  },
  {
    id: "miyako-jodogahama",
    title: "宮古／淨土之濱",
    regionId: "iwate",
    forecastSourceId: "iwate",
    forecastArea: "沿岸北部",
    weeklyArea: "沿岸",
    tempArea: "宮古",
    amedasId: "33472",
    altitudeM: 10,
    baselineAltitudeM: 43,
    profile: "coast",
    terrain: ["沿岸", "海邊"]
  },
  {
    id: "hanamaki",
    title: "花卷",
    regionId: "iwate",
    forecastSourceId: "iwate",
    forecastArea: "内陸",
    weeklyArea: "内陸",
    tempArea: "盛岡",
    amedasId: "33576",
    altitudeM: 90,
    baselineAltitudeM: 155,
    profile: "inland",
    terrain: ["內陸", "城市"]
  },
  {
    id: "tono",
    title: "遠野",
    regionId: "iwate",
    forecastSourceId: "iwate",
    forecastArea: "内陸",
    weeklyArea: "内陸",
    tempArea: "盛岡",
    amedasId: "33671",
    altitudeM: 275,
    baselineAltitudeM: 155,
    profile: "inland-basin",
    terrain: ["內陸", "盆地", "山間"]
  }
];

const weatherRiskHorizons = [12, 24, 48, 72];
const altitudeLapseRateCPerM = 0.006;

const redTerms = [
  "大津波警報",
  "津波警報",
  "特別警報",
  "大雨特別警報（土砂災害）",
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
  "震度５強",
  "震度5強",
  "震度５弱",
  "震度5弱",
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

const kumalogSightingsUrl = "https://kumalog-aomori.info/api/ver1/sightings/post_list_external";
const aomoriKumalogVolumeThreshold = 15;
const hakkodaFocusTerms = [
  "八甲田",
  "酸ヶ湯",
  "酸湯",
  "毛無岱",
  "田茂萢",
  "城ヶ倉",
  "睡蓮沼",
  "ロープウェー"
];

const notificationCooldownHours = 24;

const notificationImmediateRules = [
  {
    type: "earthquake",
    label: "三區域震度5以上地震",
    terms: ["震度７", "震度7", "震度６", "震度6", "震度５強", "震度5強", "震度５弱", "震度5弱", "震度５", "震度5"]
  },
  {
    type: "tsunami",
    label: "青森・岩手 津波注意報以上",
    regionIds: ["aomori", "iwate"],
    terms: ["大津波警報", "津波警報", "津波注意報"]
  },
  {
    type: "landslide",
    label: "土砂災害警戒情報以上",
    terms: ["大雨特別警報（土砂災害）", "土砂災害警戒情報", "災害切迫"]
  },
  {
    type: "bear-injury",
    label: "熊傷人",
    terms: bearInjuryTerms
  },
  {
    type: "aomori-bear-volume",
    label: "青森前日熊情報超過15件",
    regionIds: ["aomori"],
    terms: ["熊情報"]
  },
  {
    type: "aomori-hakkoda-bear",
    label: "酸湯・八甲田山活動圈熊情報",
    regionIds: ["aomori"],
    terms: ["酸湯", "八甲田", "活動圈"]
  }
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

function formatDateInJapan(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function previousFullDayInJapan(date = new Date()) {
  const today = formatDateInJapan(date);
  const todayStart = new Date(`${today}T00:00:00+09:00`);
  const previousStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const previousDate = formatDateInJapan(previousStart);
  return {
    date: previousDate,
    startdate: previousDate,
    enddate: previousDate
  };
}

function decodeXml(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
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

function makeKumalogSightingItem(item, level = "yellow") {
  const infoType = item.info_type_masters?.info_type_name || "出没情報";
  const species = item.animal_species_masters?.animal_species_name || "ツキノワグマ";
  const location = [item.municipality_name, item.address].filter(Boolean).join(" ");
  const condition = item.sighting_condition ? ` / ${item.sighting_condition}` : "";
  return {
    level,
    kind: level === "red" ? "sighting-alert" : "sighting",
    title: compactText(`${infoType}: ${location || "青森県内"}`, 86),
    updated: item.sighting_datetime,
    source: "くまログあおもり",
    summary: compactText(`${species} ${infoType}${condition}`, 150),
    url: "https://kumalog-aomori.info/",
    kumalogId: item.id
  };
}

const operationRedTerms = [
  "終日運休",
  "運休",
  "見合わせ",
  "閉洞",
  "休洞",
  "臨時休業",
  "増水",
  "封鎖",
  "中止"
];

const operationYellowTerms = [
  "遅延",
  "変更",
  "一方通行",
  "観光ルート",
  "混雑",
  "満席",
  "強風",
  "視界不良",
  "天候",
  "重要"
];

function levelForOperationText(text) {
  if (includesAny(text, operationRedTerms)) return "red";
  if (includesAny(text, operationYellowTerms)) return "yellow";
  if (text.includes("平常")) return "green";
  return "yellow";
}

function makeOperationItem({ title, summary, updated, source, url }) {
  const text = `${title} ${summary}`;
  return {
    level: levelForOperationText(text),
    title: compactText(title || source, 86),
    updated,
    source,
    summary: compactText(summary || title || "公式ページで運行・営業情報を確認してください。"),
    url
  };
}

function parseHakkodaRopeway(html, source) {
  const status = firstHtmlMatch(html, /<p[^>]*>(山頂駅付近[\s\S]*?終日運休[\s\S]*?)<\/p>/)
    || firstHtmlMatch(html, /<p[^>]*>([\s\S]*?終日運休[\s\S]*?)<\/p>/)
    || firstHtmlMatch(html, /<h2[^>]*>[\s\S]*?ロープウェー運行状況[\s\S]*?<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)
    || firstHtmlMatch(html, /現在のロープウェー運行状況[\s\S]*?<span>([\s\S]*?)<\/span>/);
  const weatherTable = firstHtmlMatch(html, /<h2[^>]*>\s*<strong>山頂天候状況<\/strong>\s*<\/h2>[\s\S]*?<table[^>]*>([\s\S]*?)<\/table>/);
  if (!status && !weatherTable) return [];
  return [
    makeOperationItem({
      title: "現在のロープウェー運行状況",
      summary: [status, weatherTable].filter(Boolean).join(" / "),
      updated: firstHtmlMatch(html, /<time[^>]*datetime="([^"]+)"/) || nowInJapan(),
      source: source.label,
      url: source.url
    })
  ];
}

function parseJrBusTohokuService(html, source) {
  const currentStatus = firstHtmlMatch(html, /<h2><span class="line">現在の運行情報<\/span><\/h2>\s*<p>([\s\S]*?)<\/p>/);
  const relevantNoticeTerms = /みずうみ|おいらせ|奥入瀬|十和田|青森|一般路線|盛岡・岩泉・龍泉洞|早坂高原|龍泉洞/;
  const notices = [...html.matchAll(/<h3>\s*<span class="date">([\s\S]*?)<\/span>\s*([\s\S]*?)<\/h3>\s*<div>([\s\S]*?)<\/div>/g)]
    .map(([, updated, title, body]) => ({
      updated: stripHtml(updated),
      title: stripHtml(title),
      summary: stripHtml(body)
    }))
    .filter((item) => relevantNoticeTerms.test(`${item.title} ${item.summary}`))
    .slice(0, 2);

  const items = [];
  if (currentStatus) {
    items.push(makeOperationItem({
      title: "現在の運行情報",
      summary: currentStatus,
      updated: nowInJapan(),
      source: source.label,
      url: source.url
    }));
  }

  return items.concat(notices.map((notice) => makeOperationItem({
    title: notice.title,
    summary: notice.summary,
    updated: notice.updated,
    source: source.label,
    url: source.url
  })));
}

function parseRyusendoInformation(html, source) {
  const entries = [...html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>\s*<a href="([^"]+)">([\s\S]*?)<\/a><\/dd>/g)]
    .map(([, updated, url, title]) => ({
      updated: stripHtml(updated),
      url,
      title: stripHtml(title)
    }));
  const importantTerms = /閉洞|休洞|再開|増水|営業|営業時間|観光ルート|一方通行|封鎖|重要|龍泉洞/;
  const important = entries.filter((entry) => importantTerms.test(entry.title));
  const selected = (important.length ? important : entries).slice(0, 3);
  return selected.map((entry) => makeOperationItem({
    title: entry.title,
    summary: entry.title,
    updated: entry.updated,
    source: source.label,
    url: entry.url
  }));
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

function intensityLabel(value = "") {
  const normalized = String(value).trim();
  const labels = {
    "1": "震度１",
    "2": "震度２",
    "3": "震度３",
    "4": "震度４",
    "5-": "震度５弱",
    "5+": "震度５強",
    "6-": "震度６弱",
    "6+": "震度６強",
    "7": "震度７"
  };
  return labels[normalized] || (normalized ? `震度${normalized}` : "");
}

function intensityRank(value = "") {
  const ranks = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5-": 5,
    "5+": 5.5,
    "6-": 6,
    "6+": 6.5,
    "7": 7
  };
  return ranks[String(value).trim()] || 0;
}

function regionIdForEarthquakeBlock(text = "") {
  if (/渡島|檜山|函館/.test(text)) return "hakodate";
  if (text.includes("青森県") || text.includes("青森")) return "aomori";
  if (text.includes("岩手県") || text.includes("岩手")) return "iwate";
  return "";
}

function extractEarthquakeObservation(xml) {
  const observation = xml.match(/<Observation>[\s\S]*?<\/Observation>/)?.[0] || "";
  if (!observation) return { text: "", regions: {} };
  const regions = {};

  const prefSummaries = [...observation.matchAll(/<Pref>([\s\S]*?)<\/Pref>/g)].map(([, prefXml]) => {
    const prefName = firstMatch(prefXml, /<Name>([\s\S]*?)<\/Name>/);
    const prefMaxRaw = firstMatch(prefXml, /<MaxInt>([\s\S]*?)<\/MaxInt>/);
    const prefMax = intensityLabel(prefMaxRaw);
    const citySummaries = [...prefXml.matchAll(/<City>([\s\S]*?)<\/City>/g)]
      .map(([, cityXml]) => {
        const cityName = firstMatch(cityXml, /<Name>([\s\S]*?)<\/Name>/);
        const cityMaxRaw = firstMatch(cityXml, /<MaxInt>([\s\S]*?)<\/MaxInt>/);
        const cityMax = intensityLabel(cityMaxRaw);
        const stationSummaries = [...cityXml.matchAll(/<IntensityStation>([\s\S]*?)<\/IntensityStation>/g)]
          .map(([, stationXml]) => {
            const stationName = firstMatch(stationXml, /<Name>([\s\S]*?)<\/Name>/);
            const stationIntRaw = firstMatch(stationXml, /<Int>([\s\S]*?)<\/Int>/);
            const stationInt = intensityLabel(stationIntRaw);
            const regionId = regionIdForEarthquakeBlock(`${prefName} ${cityName} ${stationName}`);
            if (regionId) {
              regions[regionId] = Math.max(regions[regionId] || 0, intensityRank(stationIntRaw), intensityRank(cityMaxRaw), intensityRank(prefMaxRaw));
            }
            return [stationName, stationInt].filter(Boolean).join(" ");
          })
          .filter(Boolean)
          .slice(0, 8)
          .join("、");
        return [cityName, cityMax, stationSummaries].filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .slice(0, 8)
      .join("。");
    return [prefName, prefMax, citySummaries].filter(Boolean).join(" ");
  });

  return {
    text: prefSummaries.filter(Boolean).join("。"),
    regions
  };
}

function shouldFetchLinkedJmaXml(entry) {
  const text = `${entry.title || ""} ${entry.content || ""}`;
  return /震源・震度|各地の震度|震度速報|津波警報|津波注意報|津波情報|土砂災害警戒情報/.test(text);
}

async function enrichJmaEntries(entries) {
  const enriched = [];
  let fetched = 0;

  for (const entry of entries) {
    if (fetched >= 80 || !entry.url || !shouldFetchLinkedJmaXml(entry)) {
      enriched.push(entry);
      continue;
    }

    try {
      const xml = await fetchText(entry.url);
      fetched += 1;
      const earthquakeObservation = extractEarthquakeObservation(xml);
      const xmlText = stripTags(xml);
      enriched.push({
        ...entry,
        hasSeismicObservation: Boolean(earthquakeObservation.text),
        seismicRegions: earthquakeObservation.regions,
        maxSeismicIntensity: Math.max(0, ...Object.values(earthquakeObservation.regions)),
        content: compactText([entry.content, earthquakeObservation.text, xmlText].filter(Boolean).join(" "), 1200)
      });
    } catch {
      enriched.push(entry);
    }
  }

  return enriched;
}

function classifyEntry(entry) {
  const titleText = entry.title || "";
  const contentText = entry.content || "";

  if (entry.hasSeismicObservation) {
    if (entry.maxSeismicIntensity >= 5) return "red";
    if (entry.maxSeismicIntensity >= 4) return "yellow";
    return "green";
  }

  // JMA generic titles often contain words like "特別警報・警報・注意報".
  // Red classification must come from the actual content, not the generic title.
  if (redTerms.some((term) => contentText.includes(term))) return "red";
  if (yellowTerms.some((term) => `${titleText} ${contentText}`.includes(term))) return "yellow";
  return "green";
}

function entryMatchesRegion(entry, regionId) {
  if (entry.hasSeismicObservation) {
    return (entry.seismicRegions[regionId] || 0) >= 4;
  }
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

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

async function fetchJmaSummaries() {
  const feedResults = [];
  const allEntries = [];

  for (const feed of jmaFeeds) {
    try {
      const xml = await fetchText(feed.url);
      const entries = await enrichJmaEntries(parseAtomEntries(xml, feed));
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

function isKumalogBearSighting(item) {
  return item.animal_species_id === 1 || item.animal_species_masters?.animal_species_name === "ツキノワグマ";
}

function textForKumalogSighting(item) {
  return [
    item.address,
    item.municipality_name,
    item.sighting_condition,
    item.info_type_masters?.info_type_name
  ].filter(Boolean).join(" ");
}

function isHakkodaFocusSighting(item) {
  return includesAny(textForKumalogSighting(item), hakkodaFocusTerms);
}

async function fetchAomoriKumalogSightings() {
  const previousDay = previousFullDayInJapan();
  const url = new URL(kumalogSightingsUrl);
  url.searchParams.append("filter[startdate]", previousDay.startdate);
  url.searchParams.append("filter[enddate]", previousDay.enddate);
  url.searchParams.append("filter[animal_species_ids][]", "1");

  const data = await fetchJson(url);
  const bearSightings = (data.result || []).filter(isKumalogBearSighting);
  const hakkodaSightings = bearSightings.filter(isHakkodaFocusSighting);
  const injurySightings = bearSightings.filter((item) => item.info_type_masters?.info_type_name?.includes("人身被害"));
  const redReasons = [];

  if (bearSightings.length > aomoriKumalogVolumeThreshold) {
    redReasons.push(`前一日 ${previousDay.date} の熊情報が ${bearSightings.length} 件で、基準 ${aomoriKumalogVolumeThreshold} 件を超過。`);
  }
  if (hakkodaSightings.length) {
    redReasons.push(`酸湯・八甲田山活動圈の字詞に ${hakkodaSightings.length} 件命中。`);
  }
  if (injurySightings.length) {
    redReasons.push(`人身被害情報 ${injurySightings.length} 件。`);
  }

  const headlineItems = [];
  if (redReasons.length) {
    headlineItems.push({
      level: "red",
      kind: "kumalog-alert",
      title: "くまログあおもり 前日熊情報",
      updated: `${previousDay.date} 23:59:59`,
      source: "くまログあおもり",
      summary: redReasons.join(" "),
      url: "https://kumalog-aomori.info/",
      kumalogDate: previousDay.date,
      kumalogCount: bearSightings.length
    });
  }

  const items = headlineItems
    .concat(hakkodaSightings.slice(0, 3).map((item) => makeKumalogSightingItem(item, "red")))
    .concat(bearSightings.slice(0, 4).map((item) => makeKumalogSightingItem(item)));

  return {
    checkedAt: nowInJapan(),
    status: "ok",
    date: previousDay.date,
    count: bearSightings.length,
    threshold: aomoriKumalogVolumeThreshold,
    hakkodaFocusTerms,
    hakkodaCount: hakkodaSightings.length,
    injuryCount: injurySightings.length,
    level: redReasons.length ? "red" : bearSightings.length ? "yellow" : "green",
    summary: bearSightings.length
      ? `くまログあおもり ${previousDay.date} の熊情報 ${bearSightings.length} 件。`
      : `くまログあおもり ${previousDay.date} の熊情報は 0 件。`,
    items
  };
}

async function fetchBearSummaries() {
  const byRegion = {};
  const sourceResults = [];
  let aomoriKumalogSightings = null;

  try {
    aomoriKumalogSightings = await fetchAomoriKumalogSightings();
    sourceResults.push({
      regionId: "aomori",
      id: "kumalog-sightings",
      label: "くまログあおもり 出没情報",
      url: "https://kumalog-aomori.info/",
      status: "ok",
      items: aomoriKumalogSightings.count
    });
  } catch (error) {
    sourceResults.push({
      regionId: "aomori",
      id: "kumalog-sightings",
      label: "くまログあおもり 出没情報",
      url: "https://kumalog-aomori.info/",
      status: "failed",
      error: error.message
    });
  }

  for (const [regionId, sources] of Object.entries(bearSources)) {
    const items = regionId === "aomori" && aomoriKumalogSightings
      ? [...aomoriKumalogSightings.items]
      : [];

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
        if (a.source === "くまログあおもり" && b.source !== "くまログあおもり") return -1;
        if (b.source === "くまログあおもり" && a.source !== "くまログあおもり") return 1;
        if (a.level !== b.level) return a.level === "red" ? -1 : b.level === "red" ? 1 : 0;
        return String(b.updated || "").localeCompare(String(a.updated || ""));
      })
      .slice(0, 6);

    byRegion[regionId] = {
      level: sortedItems.length ? highestLevel(sortedItems) : "yellow",
      checkedAt: nowInJapan(),
      summary: sortedItems.length
        ? regionId === "aomori" && aomoriKumalogSightings
          ? aomoriKumalogSightings.summary
          : `公式熊情報 ${sortedItems.length} 件を確認。`
        : "公式熊情報を自動抽出できませんでした。手動で公式リンクを確認してください。",
      kumalog: regionId === "aomori" ? aomoriKumalogSightings : undefined,
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

async function fetchOperationSummaries() {
  const byRegion = {};
  const sourceResults = [];

  for (const [regionId, sources] of Object.entries(operationSources)) {
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
        if (a.level !== b.level) {
          if (a.level === "red") return -1;
          if (b.level === "red") return 1;
          if (a.level === "yellow") return -1;
          if (b.level === "yellow") return 1;
        }
        return String(b.updated || "").localeCompare(String(a.updated || ""));
      })
      .slice(0, 5);

    byRegion[regionId] = {
      level: sortedItems.length ? highestLevel(sortedItems) : "yellow",
      checkedAt: nowInJapan(),
      summary: sortedItems.length
        ? `公式營運情報 ${sortedItems.length} 件を確認。`
        : "公式營運情報を自動抽出できませんでした。手動で公式リンクを確認してください。",
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

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function qualityValue(entry) {
  if (!Array.isArray(entry)) return null;
  if (entry.length < 2) return numericValue(entry[0]);
  return entry[1] === 0 ? numericValue(entry[0]) : null;
}

function formatAmedasTimestamp(value) {
  return String(value || "")
    .replace(/[-:]/g, "")
    .replace("T", "")
    .replace("+0900", "")
    .replace("+09", "")
    .slice(0, 14);
}

function windDirectionLabel(value) {
  const labels = ["北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東", "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西"];
  const index = Number(value);
  if (!Number.isFinite(index) || index < 1 || index > 16) return "";
  return labels[index - 1];
}

function timeDistanceMs(a, b) {
  const aMs = Date.parse(a || "");
  const bMs = Date.parse(b || "");
  if (Number.isNaN(aMs) || Number.isNaN(bMs)) return Number.POSITIVE_INFINITY;
  return Math.abs(aMs - bMs);
}

function nearestIndex(timeDefines = [], targetTime) {
  if (!timeDefines.length) return 0;
  return timeDefines
    .map((time, index) => ({ index, distance: timeDistanceMs(time, targetTime) }))
    .sort((a, b) => a.distance - b.distance)[0].index;
}

function areaByName(timeSeries = [], areaName) {
  for (const series of timeSeries) {
    const area = series.areas?.find((candidate) => candidate.area?.name === areaName);
    if (area) return { series, area };
  }
  return null;
}

function maxPopInWindow(series, area, startTime, targetTime) {
  const startMs = Date.parse(startTime || "");
  const targetMs = Date.parse(targetTime);
  const candidates = (series.timeDefines || [])
    .map((time, index) => ({ time, value: numericValue(area.pops?.[index]) }))
    .filter((item) => {
      const itemMs = Date.parse(item.time || "");
      return item.value !== null && itemMs >= startMs && itemMs <= targetMs;
    });
  if (!candidates.length) {
    const index = nearestIndex(series.timeDefines || [], targetTime);
    return numericValue(area.pops?.[index]);
  }
  return Math.max(...candidates.map((item) => item.value));
}

function shortForecastForLocation(forecast, location, targetTime, horizonHours) {
  const primary = forecast?.[0];
  const weekly = forecast?.[1];
  if (!primary) return null;
  const targetMs = Date.parse(targetTime);
  const windowStartTime = new Date(targetMs - 12 * 60 * 60 * 1000).toISOString();

  const weatherSeries = areaByName(primary.timeSeries || [], location.forecastArea);
  const popSeries = (primary.timeSeries || [])
    .map((series) => ({
      series,
      area: series.areas?.find((area) => area.area?.name === location.forecastArea)
    }))
    .find((match) => match.area?.pops);
  const tempSeries = (primary.timeSeries || [])
    .map((series) => ({
      series,
      area: series.areas?.find((area) => area.area?.name === location.tempArea)
    }))
    .find((match) => match.area?.temps);
  const weeklyWeather = weekly ? areaByName(weekly.timeSeries || [], location.weeklyArea || location.forecastArea) : null;
  const weeklyTemp = weekly
    ? (weekly.timeSeries || [])
      .map((series) => ({
        series,
        area: series.areas?.find((area) => area.area?.name === (location.weeklyTempArea || location.tempArea))
      }))
      .find((match) => match.area?.tempsMax || match.area?.tempsMin)
    : null;

  const useWeeklyWeather = horizonHours > 48 && weeklyWeather;
  const useWeeklyMetrics = horizonHours >= 48;
  const weatherIndex = useWeeklyWeather
    ? nearestIndex(weeklyWeather.series.timeDefines || [], targetTime)
    : nearestIndex(weatherSeries?.series.timeDefines || [], targetTime);
  const weatherArea = useWeeklyWeather ? weeklyWeather.area : weatherSeries?.area;
  const weatherText = weatherArea?.weathers?.[weatherIndex] || "";
  const windText = weatherArea?.winds?.[weatherIndex] || "";
  const waveText = weatherArea?.waves?.[weatherIndex] || "";
  const weeklyWeatherIndex = weeklyWeather ? nearestIndex(weeklyWeather.series.timeDefines || [], targetTime) : 0;
  const weeklyPop = numericValue(weeklyWeather?.area?.pops?.[weeklyWeatherIndex]);
  const pop = useWeeklyMetrics ? weeklyPop : (popSeries ? maxPopInWindow(popSeries.series, popSeries.area, windowStartTime, targetTime) : null);

  const tempIndex = tempSeries ? nearestIndex(tempSeries.series.timeDefines || [], targetTime) : 0;
  const shortTemp = numericValue(tempSeries?.area?.temps?.[tempIndex]);
  const weeklyTempIndex = weeklyTemp ? nearestIndex(weeklyTemp.series.timeDefines || [], targetTime) : 0;
  const weeklyTempMax = numericValue(weeklyTemp?.area?.tempsMax?.[weeklyTempIndex]);
  const weeklyTempMin = numericValue(weeklyTemp?.area?.tempsMin?.[weeklyTempIndex]);
  const baseTemp = useWeeklyMetrics
    ? weeklyTempMax !== null && weeklyTempMin !== null
      ? (weeklyTempMax + weeklyTempMin) / 2
      : null
    : shortTemp;

  return {
    reportDatetime: primary.reportDatetime,
    targetTime,
    horizonHours,
    weatherText,
    windText,
    waveText,
    precipitationProbability: pop,
    baseTempC: baseTemp,
    sourceArea: weatherArea?.area?.name || location.forecastArea,
    tempArea: tempSeries?.area?.area?.name || weeklyTemp?.area?.area?.name || location.tempArea
  };
}

async function fetchAmedasSnapshot() {
  const latestTimeText = (await fetchText(amedasLatestTimeUrl)).trim();
  const timestamp = formatAmedasTimestamp(latestTimeText);
  const url = `https://www.jma.go.jp/bosai/amedas/data/map/${timestamp}.json`;
  const data = await fetchJson(url);
  return { checkedAt: latestTimeText, url, data };
}

function observationForLocation(location, amedasSnapshot) {
  const raw = amedasSnapshot?.data?.[location.amedasId];
  if (!raw) return null;
  const windDirection = qualityValue(raw.windDirection);
  return {
    stationId: location.amedasId,
    checkedAt: amedasSnapshot.checkedAt,
    tempC: qualityValue(raw.temp),
    humidityPct: qualityValue(raw.humidity),
    precipitation1hMm: qualityValue(raw.precipitation1h),
    precipitation3hMm: qualityValue(raw.precipitation3h),
    precipitation24hMm: qualityValue(raw.precipitation24h),
    windSpeedMs: qualityValue(raw.wind),
    windDirection: windDirectionLabel(windDirection)
  };
}

function simulatedTemp(baseTempC, observation, location) {
  const base = baseTempC ?? observation?.tempC;
  if (base === null || base === undefined) return null;
  const delta = (location.altitudeM - location.baselineAltitudeM) * altitudeLapseRateCPerM;
  return Math.round((base - delta) * 10) / 10;
}

function levelFromScore(score) {
  if (score >= 5) return "red";
  if (score >= 2) return "yellow";
  return "green";
}

function riskItem(type, score, reason) {
  return { type, level: levelFromScore(score), reason };
}

function profileMatches(location, profiles) {
  return profiles.includes(location.profile);
}

function buildWeatherRiskForHorizon(location, forecast, observation, targetTime, horizonHours) {
  const simTempC = simulatedTemp(forecast?.baseTempC, observation, location);
  const text = `${forecast?.weatherText || ""} ${forecast?.windText || ""} ${forecast?.waveText || ""}`;
  const pop = forecast?.precipitationProbability ?? null;
  const windSpeed = observation?.windSpeedMs ?? null;
  const humidity = observation?.humidityPct ?? null;
  const rain3h = observation?.precipitation3hMm ?? null;
  const rain24h = observation?.precipitation24hMm ?? null;
  const isMountain = profileMatches(location, ["foothill", "mountain-base", "exposed-mountain", "wetland-boardwalk", "summit", "gorge", "lakeside-forest", "karst-gorge", "inland-basin"]);
  const isExposed = profileMatches(location, ["exposed-mountain", "summit"]);
  const isWetTrail = profileMatches(location, ["wetland-boardwalk", "gorge", "karst-gorge"]);
  const isCoastal = profileMatches(location, ["coast"]);
  const hasRainText = /雨|大雨|降水/.test(text);
  const hasThunderText = /雷/.test(text);
  const hasFogText = /霧|濃霧/.test(text);
  const hasStrongWindText = /強く|強風|暴風|やや強く/.test(text);
  const hasHighWaveText = /２．５メートル|３メートル|4メートル|４メートル/.test(text);

  let rainScore = 0;
  if (pop !== null && pop >= 70) rainScore += 2;
  else if (pop !== null && pop >= 40) rainScore += 1;
  if (hasRainText) rainScore += 1;
  if (rain3h !== null && rain3h >= 5) rainScore += 1;
  if (rain24h !== null && rain24h >= 30) rainScore += 1;

  let windScore = 0;
  if (hasStrongWindText) windScore += 1;
  if (windSpeed !== null && windSpeed >= 8) windScore += 2;
  else if (windSpeed !== null && windSpeed >= 5) windScore += 1;
  if (isExposed && (hasStrongWindText || (windSpeed !== null && windSpeed >= 3))) windScore += 2;

  let coldScore = 0;
  if (simTempC !== null && simTempC <= 5) coldScore += 2;
  else if (simTempC !== null && simTempC <= 10 && isMountain) coldScore += 1;
  if (humidity !== null && humidity >= 90 && simTempC !== null && simTempC <= 12 && isMountain) coldScore += 1;
  if (hasFogText && isMountain) coldScore += 1;

  let heatScore = 0;
  if (simTempC !== null && simTempC >= 30) heatScore += 2;
  else if (simTempC !== null && simTempC >= 26 && humidity !== null && humidity >= 80) heatScore += 1;

  const thunderScore = hasThunderText ? 3 : 0;

  let mountainScore = 0;
  if (isMountain && rainScore >= 2) mountainScore += 2;
  if (isMountain && windScore >= 2) mountainScore += 1;
  if (isMountain && coldScore >= 1) mountainScore += 1;
  if (isWetTrail && rain24h !== null && rain24h >= 20) mountainScore += 2;
  if (isExposed && thunderScore > 0) mountainScore += 2;

  let coastalScore = 0;
  if (isCoastal && (hasHighWaveText || hasStrongWindText)) coastalScore += 2;
  if (isCoastal && rainScore >= 2) coastalScore += 1;

  let transportScore = 0;
  if (rainScore >= 3) transportScore += 1;
  if (windScore >= 3) transportScore += 1;
  if (mountainScore >= 3 || coastalScore >= 3) transportScore += 1;
  if (hasThunderText) transportScore += 1;

  const risks = [
    riskItem("雨", rainScore, pop !== null ? `降雨機率約 ${pop}%` : hasRainText ? "預報文字含雨" : "雨訊號弱"),
    riskItem("風", windScore, windSpeed !== null ? `近況風速 ${windSpeed}m/s${observation?.windDirection ? `（${observation.windDirection}）` : ""}` : "使用 JMA 風文字判斷"),
    riskItem("低溫", coldScore, simTempC !== null ? `海拔修正後約 ${simTempC}°C` : "缺少可用氣溫"),
    riskItem("熱", heatScore, simTempC !== null ? `海拔修正後約 ${simTempC}°C` : "缺少可用氣溫"),
    riskItem("雷", thunderScore, hasThunderText ? "JMA 文字含雷" : "未見雷字樣"),
    riskItem("山區不利", mountainScore, isMountain ? "依地形、雨風低溫加權" : "非山區地點"),
    riskItem("沿岸不利", coastalScore, isCoastal ? "依風浪雨加權" : "非沿岸地點"),
    riskItem("交通不利", transportScore, "依雨、風、雷、山區/沿岸條件加權")
  ];

  const level = highestLevel(risks);
  const highSignals = risks.filter((item) => item.level === "red").map((item) => item.type);
  const mediumSignals = risks.filter((item) => item.level === "yellow").map((item) => item.type);
  const primarySignals = highSignals.length ? highSignals : mediumSignals;
  const reasonParts = [];
  if (simTempC !== null) reasonParts.push(`海拔修正後約 ${simTempC}°C`);
  if (pop !== null) reasonParts.push(`降雨機率 ${pop}%`);
  if (windSpeed !== null) reasonParts.push(`近況風速 ${windSpeed}m/s`);
  if (humidity !== null) reasonParts.push(`濕度 ${humidity}%`);
  if (rain24h !== null) reasonParts.push(`24h雨量 ${rain24h}mm`);
  const reason = primarySignals.length
    ? `${reasonParts.join("，")}；${primarySignals.join("、")}需保守。`
    : `${reasonParts.join("，")}；暫無明顯模擬加權訊號。`;

  return {
    horizonHours,
    targetTime,
    level,
    reason,
    metrics: {
      forecastWeather: forecast?.weatherText || "",
      forecastWind: forecast?.windText || "",
      forecastWave: forecast?.waveText || "",
      precipitationProbabilityPct: pop,
      baseTempC: forecast?.baseTempC ?? null,
      simulatedTempC: simTempC,
      humidityPct: humidity ?? null,
      observedRain1hMm: observation?.precipitation1hMm ?? null,
      observedRain3hMm: rain3h ?? null,
      observedRain24hMm: rain24h ?? null,
      observedWindSpeedMs: windSpeed ?? null,
      observedWindDirection: observation?.windDirection || ""
    },
    risks
  };
}

function buildWeatherLocation(location, forecasts, amedasSnapshot) {
  const forecast = forecasts[location.forecastSourceId];
  const observation = observationForLocation(location, amedasSnapshot);
  const nowMs = Date.now();
  const horizons = weatherRiskHorizons.map((horizonHours) => {
    const targetTime = new Date(nowMs + horizonHours * 60 * 60 * 1000).toISOString();
    const horizonForecast = shortForecastForLocation(forecast?.data, location, targetTime, horizonHours);
    return buildWeatherRiskForHorizon(location, horizonForecast, observation, targetTime, horizonHours);
  });

  return {
    id: location.id,
    title: location.title,
    regionId: location.regionId,
    approximateAltitudeM: location.altitudeM,
    terrain: location.terrain,
    profile: location.profile,
    sourceArea: location.forecastArea,
    amedasStationId: location.amedasId,
    observation,
    level: highestLevel(horizons),
    horizons
  };
}

async function fetchWeatherRiskSimulation() {
  const forecasts = {};
  const sources = [];

  for (const [id, source] of Object.entries(weatherForecastSources)) {
    try {
      const data = await fetchJson(source.url);
      forecasts[id] = { source, data };
      sources.push({
        id,
        label: source.label,
        url: source.url,
        status: "ok",
        reportDatetime: data[0]?.reportDatetime || ""
      });
    } catch (error) {
      sources.push({
        id,
        label: source.label,
        url: source.url,
        status: "failed",
        error: error.message
      });
    }
  }

  let amedasSnapshot = null;
  try {
    amedasSnapshot = await fetchAmedasSnapshot();
    sources.push({
      id: "amedas",
      label: "JMA AMeDAS 最新観測",
      url: amedasSnapshot.url,
      status: "ok",
      reportDatetime: amedasSnapshot.checkedAt
    });
  } catch (error) {
    sources.push({
      id: "amedas",
      label: "JMA AMeDAS 最新観測",
      url: amedasLatestTimeUrl,
      status: "failed",
      error: error.message
    });
  }

  const locations = weatherRiskLocations.map((location) => buildWeatherLocation(location, forecasts, amedasSnapshot));
  const failedCount = sources.filter((source) => source.status === "failed").length;

  return {
    version: "mountain-weather-simulation-v0.1",
    checkedAt: nowInJapan(),
    status: failedCount === 0 ? "ok" : failedCount === sources.length ? "failed" : "partial",
    disclaimer: "個人模擬，不是官方預報。此區用 JMA 區域資料、AMeDAS 近況、海拔與地形修正估算；山區實況可能差很多，安全判斷請以 JMA、旅館、纜車、交通與現地人員為準。",
    model: {
      summary: "以 JMA 區域預報為基底，套用每升高 100m 約降溫 0.6°C、山區曝露、濕地木道、溪谷、湖畔與沿岸加權。",
      lapseRateCPer100m: 0.6,
      horizonsHours: weatherRiskHorizons,
      riskTypes: ["雨", "風", "低溫", "熱", "雷", "山區不利", "沿岸不利", "交通不利"]
    },
    sources,
    locations
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
  if (bearRegion.level === "red") return "red";
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
    const kumalog = region.bearWorkflow?.latest?.kumalog;
    const kumalogEvents = region.id === "aomori" && kumalog?.level === "red"
      ? [
          ...(kumalog.count > kumalog.threshold
            ? [{
                regionId: region.id,
                level: "red",
                icon: "🐻",
                label: `${region.title} 熊情報多発`,
                summary: `${kumalog.date} のくまログあおもり熊情報が ${kumalog.count} 件で、基準 ${kumalog.threshold} 件を超過。`,
                source: "くまログあおもり",
                type: "aomori-bear-volume",
                priority: 1092,
                url: "https://kumalog-aomori.info/",
                notificationKey: `aomori:aomori-bear-volume:${kumalog.date}`
              }]
            : []),
          ...(kumalog.hakkodaCount > 0
            ? [{
                regionId: region.id,
                level: "red",
                icon: "🐻",
                label: `${region.title} 八甲田熊情報`,
                summary: `酸湯・八甲田山活動圈の字詞に ${kumalog.hakkodaCount} 件命中。対象字詞: ${kumalog.hakkodaFocusTerms.join("、")}。`,
                source: "くまログあおもり",
                type: "aomori-hakkoda-bear",
                priority: 1094,
                url: "https://kumalog-aomori.info/",
                notificationKey: `aomori:aomori-hakkoda-bear:${kumalog.date}:${kumalog.hakkodaCount}`
              }]
            : [])
        ]
      : [];
    const injuryItems = items.filter((item) => item.level === "red" && item.kind === "human-injury");
    const preferred = injuryItems.find((item) => item.source?.includes("人身被害"))
      || injuryItems.find((item) => item.title.includes("発生"))
      || injuryItems[0];
    const injuryEvents = (preferred ? [preferred] : [])
      .map((item) => ({
        regionId: region.id,
        level: "red",
        icon: "🐻",
        label: `${region.title} 熊被害`,
        summary: item.summary,
        source: item.source || "公式熊情報",
        type: "bear-injury",
        priority: 1088,
        url: item.url,
        notificationKey: item.kumalogId
          ? `${region.id}:bear-injury:kumalog:${item.kumalogId}`
          : `${region.id}:bear-injury:${item.url || item.source || "official"}`
      }));
    return kumalogEvents.concat(injuryEvents);
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

function notificationKeyForEvent(event) {
  if (event.notificationKey) return event.notificationKey;
  if (event.type === "bear-injury" && event.url) return `${event.regionId}:${event.type}:${event.url}`;
  const summary = (event.summary || "")
    .replace(/[０-９0-9]+日/g, "")
    .replace(/[０-９0-9]+時/g, "")
    .replace(/\s+/g, "");
  return `${event.regionId}:${event.type}:${event.label}:${summary.slice(0, 90)}`;
}

function immediateRuleForEvent(event) {
  const text = `${event.label || ""} ${event.summary || ""}`;
  return notificationImmediateRules.find((rule) => {
    if (event.type !== rule.type) return false;
    if (rule.regionIds && !rule.regionIds.includes(event.regionId)) return false;
    return includesAny(text, rule.terms);
  });
}

function hoursSince(value, nowMs) {
  const parsed = Date.parse(value || "");
  if (Number.isNaN(parsed)) return Number.POSITIVE_INFINITY;
  return (nowMs - parsed) / (60 * 60 * 1000);
}

function lastQueuedAtForEvent(event, key, previousQueued) {
  if (previousQueued[key]) return previousQueued[key];
  if (event.type !== "bear-injury") return null;

  const legacyPrefix = `${event.regionId}:bear-injury:`;
  return Object.entries(previousQueued)
    .filter(([previousKey]) => previousKey.startsWith(legacyPrefix))
    .map(([, value]) => value)
    .sort((a, b) => Date.parse(b || 0) - Date.parse(a || 0))[0] || null;
}

function buildNotificationLayer(criticalEvents, existingNotifications = {}) {
  const now = nowInJapan();
  const nowMs = Date.parse(now);
  const previousQueued = existingNotifications.state?.lastQueuedByKey || {};
  const candidates = criticalEvents
    .map((event) => ({
      event,
      rule: immediateRuleForEvent(event)
    }))
    .filter(({ event, rule }) => event.level === "red" || rule)
    .map((event) => {
      const key = notificationKeyForEvent(event.event);
      const lastQueuedAt = lastQueuedAtForEvent(event.event, key, previousQueued);
      const hours = hoursSince(lastQueuedAt, nowMs);
      const cooldownActive = hours < notificationCooldownHours;
      const suppressionReason = event.rule && lastQueuedAt
        ? "同一立即事件已寄送過，不重複寄送。"
        : cooldownActive
          ? "同一事件在 24 小時內已寄送。"
          : "";
      return {
        key,
        urgency: event.rule ? "immediate" : "digest",
        reason: event.rule ? event.rule.label : "紅色事件 24 小時摘要",
        cooldownHours: notificationCooldownHours,
        cooldownActive,
        lastQueuedAt: lastQueuedAt || null,
        suppressionReason,
        event: event.event
      };
    });

  const queued = candidates.filter((candidate) => {
    if (candidate.urgency === "immediate") return !candidate.lastQueuedAt;
    return !candidate.cooldownActive;
  });

  return {
    checkedAt: now,
    deliveryStatus: existingNotifications.deliveryStatus === "gmail-sent" ? "gmail-ready" : "gmail-actions",
    deliveredAt: existingNotifications.deliveredAt || null,
    recommendedChannel: "GitHub Actions Gmail SMTP",
    summary: candidates.length
      ? `目前符合通知規則的事件 ${candidates.length} 件；本次可送出 ${queued.length} 件。`
      : "目前沒有符合通知規則的紅色事件。",
    policy: {
      digest: "只通知紅色事件；摘要型事件同一事件每 24 小時最多一次。",
      immediate: "三區域震度5以上、青森/岩手津波注意報以上、三區域土砂災害警戒情報以上、熊傷人可列為立即推送；同一立即事件寄送後不重複寄送。",
      quiet: "黃色事件、營運異常、例行注意報不推送，避免噪音。",
      limitation: "GitHub Pages 本身不能主動背景推播；目前選擇由 GitHub Actions 透過 Gmail 寄信。"
    },
    candidates,
    queued,
    suppressedCount: candidates.length - queued.length,
    state: {
      lastQueuedByKey: previousQueued
    }
  };
}

async function main() {
  const existing = JSON.parse(await readFile(dataPath, "utf8"));
  const jma = await fetchJmaSummaries();
  const bear = await fetchBearSummaries();
  const operation = await fetchOperationSummaries();
  const weatherRisk = await fetchWeatherRiskSimulation();

  const regions = existing.regions.map((region) => {
    const jmaRegion = jma.regions[region.id];
    const bearRegion = bear.regions[region.id];
    const operationRegion = operation.regions[region.id];
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
        : region.bearWorkflow,
      operationWorkflow: region.operationWorkflow
        ? {
            ...region.operationWorkflow,
            latest: operationRegion
          }
        : region.operationWorkflow
    };
  });

  const level = overallLevel(regions, jma.status);
  const feedStatusNote = jma.status === "ok"
    ? "JMA XML 長期 feed 已更新。"
    : jma.status === "partial"
      ? "JMA XML 部分 feed 抓取失敗，請手動確認官方頁。"
      : "JMA XML 抓取失敗，請手動確認官方頁。";

  const criticalEvents = buildCriticalEvents(regions);
  const notifications = buildNotificationLayer(criticalEvents, existing.notifications);

  const updated = {
    ...existing,
    generatedAt: nowInJapan(),
    sourceMode: `JMA XML updater v1; ${feedStatusNote}`,
    jma,
    bear,
    operation,
    weatherRisk,
    criticalEvents,
    notifications,
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
