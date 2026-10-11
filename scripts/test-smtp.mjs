import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "")
  .trim()
  .replace(/\s+/g, "");
const to = process.argv[2] || "ggilbordon@gmail.com";
const fromName = process.env.SMTP_FROM_NAME || "Frantana";
const fromEmail =
  process.env.SMTP_FROM_EMAIL?.trim() || "frantanaoriginal@gmail.com";

if (!user || !pass) {
  console.error("Falta SMTP_USER/GMAIL_USER o SMTP_PASS/GMAIL_APP_PASSWORD");
  process.exit(1);
}

const secure = port === 465;
const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  requireTLS: !secure && port === 587,
});

console.log(`Verificando SMTP ${host}:${port} como ${user}…`);
await transport.verify();
console.log(
  `SMTP OK. Enviando a ${to} con From: "${fromName}" <${fromEmail}>`
);

const info = await transport.sendMail({
  from: `"${fromName}" <${fromEmail}>`,
  replyTo: fromEmail,
  to,
  subject: "Prueba SMTP Frantana",
  text: [
    "Hola,",
    "",
    "Prueba SMTP Frantana.",
    `Auth SMTP: ${user}`,
    `Remitente visible: ${fromEmail}`,
    `Fecha: ${new Date().toISOString()}`,
    "",
    "Si lo recibes, la configuración funciona.",
    "",
    "— Frantana",
  ].join("\n"),
});

console.log("Enviado. messageId:", info.messageId);
console.log("Respuesta:", info.response);
console.log("envelope.from:", info.envelope?.from);
