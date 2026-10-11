import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function env(key: string) {
  return process.env[key]?.trim() || "";
}

/** Contraseña de app Gmail: quita espacios. */
function smtpPass() {
  const raw = env("SMTP_PASS") || env("GMAIL_APP_PASSWORD");
  return raw.replace(/\s+/g, "");
}

function smtpUser() {
  return env("SMTP_USER") || env("GMAIL_USER");
}

function smtpConfigured() {
  return Boolean(env("SMTP_HOST") && smtpUser() && smtpPass());
}

export function isSmtpConfigured() {
  return smtpConfigured();
}

/** Destino de avisos (contacto / reservas). */
export function getNotifyEmail() {
  return (
    env("SMTP_NOTIFY_TO") ||
    env("CONTACT_NOTIFY_TO") ||
    "frantanaoriginal@gmail.com"
  );
}

/** Remitente visible (puede ser distinto del usuario SMTP). */
export function getFromEmail() {
  return (
    env("SMTP_FROM_EMAIL") ||
    env("SMTP_REPLY_TO") ||
    "frantanaoriginal@gmail.com"
  );
}

function getFromAddress() {
  const email = getFromEmail();
  const name = env("SMTP_FROM_NAME") || "Frantana Web";
  return `"${name}" <${email}>`;
}

function createTransport() {
  const host = env("SMTP_HOST") || "smtp.gmail.com";
  const port = Number(env("SMTP_PORT") || 587);
  const user = smtpUser();
  const pass = smtpPass();
  if (!user || !pass) {
    throw new Error("SMTP no configurado (SMTP_USER / SMTP_PASS)");
  }

  const secure =
    env("SMTP_SECURE") === "true" ||
    env("SMTP_SECURE") === "1" ||
    port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure && port === 587,
  });
}

export async function sendEmail(input: SendEmailInput) {
  if (!smtpConfigured()) {
    throw new Error("SMTP no configurado");
  }
  const transport = createTransport();
  const replyTo = input.replyTo || getFromEmail();
  const info = await transport.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo,
  });
  return info;
}

export async function verifySmtp() {
  const transport = createTransport();
  await transport.verify();
  return true;
}
