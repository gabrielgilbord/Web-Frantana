import type { BookingRequest } from "@/types";
import { absoluteUrl, getSiteUrl } from "@/lib/email/site-url";

const COLORS = {
  paper: "#f3eee6",
  ivory: "#faf7f1",
  ink: "#1a1612",
  fog: "#6f675e",
  ember: "#8b6a45",
  night: "#14110e",
  sand: "#d8cdb9",
} as const;

const HERO_IMAGE = "/media/gallery/frantana/shot-01.jpg";
/** PNG del wordmark (mejor soporte en clientes de correo que SVG). */
const LOGO_IMAGE = "/media/brand/frantana-wordmark.png";

export const EVENT_LABEL: Record<BookingRequest["eventType"], string> = {
  privado: "Privado",
  boda: "Boda",
  corporativo: "Corporativo",
  fiesta: "Fiesta",
  otro: "Otro",
};

export const CONTACT_SUBJECT_LABEL: Record<string, string> = {
  contratacion: "Contratación / evento",
  prensa: "Prensa",
  otro: "Otro",
};

export type EmailPayload = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function formatWhen(booking: Pick<BookingRequest, "preferredDate" | "preferredTime">) {
  const parts = [
    booking.preferredDate,
    booking.preferredTime ? `a las ${booking.preferredTime}` : null,
  ].filter(Boolean);
  return parts.join(" ") || "Por confirmar";
}

function detailRows(rows: { label: string; value: string }[]) {
  return rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.sand};font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.fog};width:34%;vertical-align:top;">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.sand};font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.5;color:${COLORS.ink};vertical-align:top;">
          ${escapeHtml(row.value)}
        </td>
      </tr>`
    )
    .join("");
}

function ctaButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr>
        <td style="background:${COLORS.ember};border-radius:2px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;color:#faf7f1;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function layout(options: {
  preheader: string;
  title: string;
  intro: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  const siteUrl = getSiteUrl();
  const hero = absoluteUrl(HERO_IMAGE);
  const logo = absoluteUrl(LOGO_IMAGE);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.paper};color:${COLORS.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${COLORS.ivory};border:1px solid ${COLORS.sand};">
          <tr>
            <td style="padding:28px 32px 18px;text-align:center;border-bottom:1px solid ${COLORS.sand};">
              <a href="${escapeHtml(siteUrl)}" style="display:inline-block;text-decoration:none;border:0;">
                <img src="${logo}" alt="Frantana" width="220" height="63" style="display:block;margin:0 auto;width:220px;max-width:70%;height:auto;border:0;outline:none;" />
              </a>
              <p style="margin:12px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.fog};">
                Música · Escena · Contratación
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <img src="${hero}" alt="Frantana" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;object-fit:cover;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px;">
              <p style="margin:0 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${COLORS.ember};">
                Aviso web
              </p>
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:32px;line-height:1.15;color:${COLORS.ink};">
                ${escapeHtml(options.title)}
              </h1>
              <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.65;color:${COLORS.ink};">
                ${nl2br(options.intro)}
              </p>
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 36px;border-top:1px solid ${COLORS.sand};">
              <p style="margin:20px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:${COLORS.fog};">
                ${options.footerNote ? nl2br(options.footerNote) + "<br /><br />" : ""}
                © ${year} Frantana ·
                <a href="${siteUrl}" style="color:${COLORS.ember};text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function messageBlock(label: string, message: string) {
  return `
    <div style="margin:24px 0;padding:18px 20px;background:${COLORS.paper};border-left:3px solid ${COLORS.ember};">
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.fog};">
        ${escapeHtml(label)}
      </p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.65;color:${COLORS.ink};">
        ${nl2br(message)}
      </p>
    </div>`;
}

/** Contacto web → artista */
export function contactArtistEmail(input: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}): EmailPayload {
  const subjectLabel =
    CONTACT_SUBJECT_LABEL[input.subject] ?? input.subject;
  const subject = `[Frantana] ${subjectLabel} — ${input.name}`;
  const text = [
    "Nuevo mensaje de contacto desde la web.",
    "",
    `Nombre: ${input.name}`,
    `Email: ${input.email}`,
    `Teléfono: ${input.phone ?? "—"}`,
    `Asunto: ${subjectLabel}`,
    "",
    input.message,
  ].join("\n");

  const html = layout({
    preheader: `Nuevo mensaje de ${input.name}`,
    title: "Nuevo mensaje de contacto",
    intro: "Alguien te ha escrito desde el formulario de la web Frantana.",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRows([
          { label: "Nombre", value: input.name },
          { label: "Email", value: input.email },
          { label: "Teléfono", value: input.phone ?? "—" },
          { label: "Asunto", value: subjectLabel },
        ])}
      </table>
      ${messageBlock("Mensaje", input.message)}
      ${ctaButton(`mailto:${input.email}`, "Responder")}
    `,
    footerNote: "Puedes responder directamente a este correo.",
  });

  return { subject, text, html };
}

/** Nueva reserva → artista */
export function bookingArtistNewEmail(
  booking: BookingRequest,
  trackUrl: string
): EmailPayload {
  const eventLabel = EVENT_LABEL[booking.eventType];
  const when = formatWhen(booking);
  const subject = `[Frantana] Nueva reserva — ${booking.name} · ${booking.preferredDate ?? "sin fecha"}`;
  const text = [
    "Nueva solicitud de reserva en la web Frantana.",
    "",
    `Nombre: ${booking.name}`,
    `Email: ${booking.email}`,
    `Teléfono: ${booking.phone ?? "—"}`,
    `Tipo: ${eventLabel}`,
    `Fecha preferida: ${when}`,
    `Ciudad: ${booking.city}`,
    `Lugar: ${booking.venue ?? "—"}`,
    "",
    booking.message,
    "",
    `Panel admin: ${getSiteUrl()}/admin/reservas`,
    `Seguimiento: ${trackUrl}`,
  ].join("\n");

  const html = layout({
    preheader: `Reserva de ${booking.name} · ${when}`,
    title: "Nueva solicitud de reserva",
    intro:
      "Han solicitado una fecha desde la web. Revisa los datos y confirma o rechaza desde el panel.",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRows([
          { label: "Nombre", value: booking.name },
          { label: "Email", value: booking.email },
          { label: "Teléfono", value: booking.phone ?? "—" },
          { label: "Tipo", value: eventLabel },
          { label: "Fecha", value: when },
          { label: "Ciudad", value: booking.city },
          { label: "Lugar", value: booking.venue ?? "—" },
        ])}
      </table>
      ${messageBlock("Mensaje del solicitante", booking.message)}
      ${ctaButton(`${getSiteUrl()}/admin/reservas`, "Abrir panel de reservas")}
    `,
  });

  return { subject, text, html };
}

/** Solicitud recibida → solicitante */
export function bookingRequesterReceivedEmail(
  booking: BookingRequest,
  trackUrl: string
): EmailPayload {
  const eventLabel = EVENT_LABEL[booking.eventType];
  const when = formatWhen(booking);
  const subject = "Hemos recibido tu solicitud de reserva — Frantana";
  const text = [
    `Hola ${booking.name},`,
    "",
    "Hemos recibido tu solicitud de reserva para Frantana.",
    "",
    `Tipo de evento: ${eventLabel}`,
    `Fecha preferida: ${when}`,
    `Ciudad: ${booking.city}`,
    "",
    "El equipo la revisará y te responderá lo antes posible.",
    "Puedes seguir el estado de tu solicitud aquí:",
    trackUrl,
    "",
    "— Frantana",
  ].join("\n");

  const html = layout({
    preheader: "Tu solicitud de reserva está en revisión",
    title: "Solicitud recibida",
    intro: `Hola ${booking.name},\n\nGracias por escribirnos. Hemos registrado tu solicitud y Frantana la revisará en breve.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRows([
          { label: "Evento", value: eventLabel },
          { label: "Fecha", value: when },
          { label: "Ciudad", value: booking.city },
          { label: "Lugar", value: booking.venue ?? "—" },
        ])}
      </table>
      ${ctaButton(trackUrl, "Ver seguimiento")}
    `,
    footerNote:
      "Guarda este enlace: es tu canal privado para ver el estado y mensajes.",
  });

  return { subject, text, html };
}

/** Reserva confirmada → solicitante */
export function bookingRequesterConfirmedEmail(
  booking: BookingRequest,
  trackUrl: string
): EmailPayload {
  const eventLabel = EVENT_LABEL[booking.eventType];
  const when = formatWhen(booking);
  const subject = "Tu reserva ha sido confirmada — Frantana";
  const text = [
    `Hola ${booking.name},`,
    "",
    "Buenas noticias: Frantana ha confirmado tu solicitud de reserva.",
    "",
    `Tipo de evento: ${eventLabel}`,
    `Fecha: ${when}`,
    `Ciudad: ${booking.city}`,
    "",
    "Puedes ver los detalles y el hilo de mensajes aquí:",
    trackUrl,
    "",
    "— Frantana",
  ].join("\n");

  const html = layout({
    preheader: "Tu reserva con Frantana está confirmada — escribe en el chat",
    title: "Reserva confirmada",
    intro: `Hola ${booking.name},\n\nTu fecha está confirmada. Desde ahora podéis hablar por el chat privado de la web: logística, horarios, sonido o lo que haga falta. Cada mensaje te llegará también por correo.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRows([
          { label: "Evento", value: eventLabel },
          { label: "Fecha", value: when },
          { label: "Ciudad", value: booking.city },
          { label: "Lugar", value: booking.venue ?? "—" },
        ])}
      </table>
      ${ctaButton(trackUrl, "Abrir conversación")}
    `,
    footerNote:
      "Guarda este enlace: es vuestro canal privado Frantana ↔ tú.",
  });

  return { subject, text, html };
}

/** Nuevo mensaje del cliente → artista */
export function bookingArtistMessageEmail(
  booking: BookingRequest,
  messageBody: string,
  adminUrl: string
): EmailPayload {
  const subject = `[Frantana] Mensaje de ${booking.name}`;
  const text = [
    `${booking.name} ha escrito en el chat de la reserva.`,
    "",
    messageBody,
    "",
    `Email: ${booking.email}`,
    `Abrir panel: ${adminUrl}`,
  ].join("\n");

  const html = layout({
    preheader: `Nuevo mensaje de ${booking.name}`,
    title: "Nuevo mensaje en la reserva",
    intro: `${booking.name} te ha escrito en el hilo de su solicitud.`,
    bodyHtml: `
      ${messageBlock("Mensaje", messageBody)}
      ${ctaButton(adminUrl, "Responder en el panel")}
    `,
  });

  return { subject, text, html };
}

/** Nueva respuesta del artista → solicitante */
export function bookingRequesterMessageEmail(
  booking: BookingRequest,
  messageBody: string,
  trackUrl: string
): EmailPayload {
  const subject = "Frantana te ha respondido — reserva";
  const text = [
    `Hola ${booking.name},`,
    "",
    "Tienes un mensaje nuevo de Frantana:",
    "",
    messageBody,
    "",
    `Continuar la conversación: ${trackUrl}`,
    "",
    "— Frantana",
  ].join("\n");

  const html = layout({
    preheader: "Nuevo mensaje de Frantana",
    title: "Nuevo mensaje",
    intro: `Hola ${booking.name},\n\nFrantana te ha escrito en el chat de tu reserva.`,
    bodyHtml: `
      ${messageBlock("Mensaje", messageBody)}
      ${ctaButton(trackUrl, "Abrir conversación")}
    `,
  });

  return { subject, text, html };
}

/** Reserva rechazada → solicitante */
export function bookingRequesterRejectedEmail(
  booking: BookingRequest,
  trackUrl: string
): EmailPayload {
  const eventLabel = EVENT_LABEL[booking.eventType];
  const when = formatWhen(booking);
  const subject = "Actualización sobre tu solicitud de reserva — Frantana";
  const text = [
    `Hola ${booking.name},`,
    "",
    "Gracias por tu interés. En esta ocasión no podemos confirmar la fecha solicitada.",
    "",
    `Tipo de evento: ${eventLabel}`,
    `Fecha preferida: ${when}`,
    `Ciudad: ${booking.city}`,
    "",
    "Si quieres proponer otra fecha u otro formato, puedes escribirnos de nuevo desde el seguimiento o el formulario de contacto.",
    trackUrl,
    "",
    "— Frantana",
  ].join("\n");

  const html = layout({
    preheader: "Actualización sobre tu solicitud de reserva",
    title: "No podemos confirmar esta fecha",
    intro: `Hola ${booking.name},\n\nHemos revisado tu solicitud y, lamentablemente, no podemos confirmar la fecha que pediste. Gracias de corazón por contar con Frantana.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRows([
          { label: "Evento", value: eventLabel },
          { label: "Fecha", value: when },
          { label: "Ciudad", value: booking.city },
        ])}
      </table>
      ${ctaButton(trackUrl, "Ver seguimiento")}
      <p style="margin:16px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.6;color:${COLORS.fog};">
        Si quieres, puedes solicitar otra fecha desde la web.
      </p>
    `,
  });

  return { subject, text, html };
}
