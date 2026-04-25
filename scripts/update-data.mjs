import { readFile, writeFile } from "node:fs/promises";

const dataPath = new URL("../app/data.json", import.meta.url);

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

async function main() {
  const existing = JSON.parse(await readFile(dataPath, "utf8"));

  const updated = {
    ...existing,
    generatedAt: nowInJapan(),
    sourceMode: "scheduled placeholder; official fetchers not implemented yet",
    overall: {
      ...existing.overall,
      level: "yellow",
      message: "排程已執行，但目前仍是佔位資料。下一階段會接上官方資料來源。"
    }
  };

  await writeFile(dataPath, `${JSON.stringify(updated, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
