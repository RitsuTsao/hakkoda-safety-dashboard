import { readFile, writeFile } from "node:fs/promises";
import tls from "node:tls";

const dataPath = new URL("../app/data.json", import.meta.url);
const dashboardUrl = "https://ritsutsao.github.io/hakkoda-safety-dashboard/app/index.html";

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

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function dotStuff(value) {
  return value.replace(/^\./gm, "..");
}

function buildEmail(data, queued) {
  const immediate = queued.some((item) => item.urgency === "immediate");
  const subject = immediate
    ? `Hakkoda Safety Alert: ${queued[0].event.label}`
    : `Hakkoda Safety Digest: ${queued.length} event(s)`;
  const body = [
    "Hakkoda Safety Dashboard notification",
    "",
    `Generated: ${data.generatedAt}`,
    `Dashboard: ${dashboardUrl}`,
    "",
    ...queued.flatMap((item, index) => [
      `${index + 1}. ${item.event.icon || "!"} ${item.event.label}`,
      `Reason: ${item.reason}`,
      `Urgency: ${item.urgency}`,
      `Level: ${item.event.level}`,
      `Source: ${item.event.source || "official source"}`,
      `URL: ${item.event.url}`,
      "",
      item.event.summary || "",
      ""
    ]),
    "This is decision support only. Follow JMA, official alerts, local authorities, hotel staff, transport operators, and emergency broadcasts first."
  ].join("\n");

  return { subject, body };
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1) || "";
      if (/^\d{3} /.test(last)) {
        socket.off("data", onData);
        socket.off("error", reject);
        const code = Number(last.slice(0, 3));
        if (code >= 400) {
          reject(new Error(last));
        } else {
          resolve(buffer);
        }
      }
    };
    socket.on("data", onData);
    socket.once("error", reject);
  });
}

async function smtpCommand(socket, command, expected = []) {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  if (expected.length && !expected.some((code) => response.startsWith(String(code)))) {
    throw new Error(`Unexpected SMTP response for ${command}: ${response.trim()}`);
  }
  return response;
}

function connectSmtp() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" }, () => {
      resolve(socket);
    });
    socket.once("error", reject);
  });
}

async function sendGmail({ user, appPassword, to, subject, body }) {
  const socket = await connectSmtp();
  try {
    await readSmtpResponse(socket);
    await smtpCommand(socket, "EHLO github-actions", [250]);
    const auth = Buffer.from(`\0${user}\0${appPassword}`, "utf8").toString("base64");
    await smtpCommand(socket, `AUTH PLAIN ${auth}`, [235]);
    await smtpCommand(socket, `MAIL FROM:<${user}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await smtpCommand(socket, "DATA", [354]);

    const message = [
      `From: Hakkoda Safety Dashboard <${user}>`,
      `To: ${to}`,
      `Subject: ${encodeHeader(subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      body
    ].join("\r\n");

    socket.write(`${dotStuff(message)}\r\n.\r\n`);
    await readSmtpResponse(socket);
    await smtpCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}

async function main() {
  const data = JSON.parse(await readFile(dataPath, "utf8"));
  const queued = data.notifications?.queued || [];
  if (!queued.length) {
    console.log("No notifications queued.");
    return;
  }

  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.ALERT_EMAIL_TO || user;
  if (!user || !appPassword || !to) {
    console.log("Gmail notification skipped: missing GMAIL_USER, GMAIL_APP_PASSWORD, or ALERT_EMAIL_TO.");
    return;
  }

  const email = buildEmail(data, queued);
  await sendGmail({ user, appPassword, to, ...email });

  const sentAt = nowInJapan();
  const lastQueuedByKey = {
    ...(data.notifications.state?.lastQueuedByKey || {})
  };
  queued.forEach((item) => {
    lastQueuedByKey[item.key] = sentAt;
  });

  const updated = {
    ...data,
    notifications: {
      ...data.notifications,
      deliveryStatus: "gmail-sent",
      deliveredAt: sentAt,
      state: {
        ...data.notifications.state,
        lastQueuedByKey
      }
    }
  };

  await writeFile(dataPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`Sent ${queued.length} Gmail notification(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
