import { NextResponse } from "next/server";
import { z } from "zod";
import { createContactInquiry, getContent } from "@/lib/content/store";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().nullable().or(z.literal("")),
  subject: z.enum(["contratacion", "prensa", "otro"]),
  message: z.string().trim().min(10).max(2000),
});

const SUBJECT_LABEL: Record<string, string> = {
  contratacion: "Contratación / evento",
  prensa: "Prensa",
  otro: "Otro",
};

function emptyToNull(v: string | null | undefined) {
  if (!v || !v.trim()) return null;
  return v.trim();
}

async function deliverEmail(options: {
  to: string;
  fromName: string;
  fromEmail: string;
  phone: string | null;
  subject: string;
  message: string;
}) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const mailSubject = `[Frantana web] ${SUBJECT_LABEL[options.subject] ?? options.subject} — ${options.fromName}`;
  const text = [
    `Nombre: ${options.fromName}`,
    `Email: ${options.fromEmail}`,
    `Teléfono: ${options.phone ?? "—"}`,
    `Asunto: ${SUBJECT_LABEL[options.subject] ?? options.subject}`,
    "",
    options.message,
  ].join("\n");

  if (resendKey) {
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "Frantana Web <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        reply_to: options.fromEmail,
        subject: mailSubject,
        text,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Resend: ${err || res.status}`);
    }
    return "resend" as const;
  }

  // Fallback sin SMTP propio: FormSubmit (primera vez pide confirmar el correo destino)
  const res = await fetch(`https://formsubmit.co/ajax/${options.to}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: options.fromName,
      email: options.fromEmail,
      phone: options.phone ?? "",
      subject: SUBJECT_LABEL[options.subject] ?? options.subject,
      message: options.message,
      _subject: mailSubject,
      _template: "table",
      _captcha: "false",
      _replyto: options.fromEmail,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`FormSubmit: ${err || res.status}`);
  }
  return "formsubmit" as const;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario" },
      { status: 400 }
    );
  }

  const content = await getContent();
  const to = content.contactEmail?.trim();
  if (!to) {
    return NextResponse.json(
      { error: "El correo de contacto no está configurado aún." },
      { status: 503 }
    );
  }

  const phone = emptyToNull(parsed.data.phone);
  const inquiry = await createContactInquiry({
    name: parsed.data.name,
    email: parsed.data.email,
    phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  try {
    await deliverEmail({
      to,
      fromName: parsed.data.name,
      fromEmail: parsed.data.email,
      phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
  } catch (e) {
    console.error("[contact] email delivery failed", e);
    // Inquiry already saved — still useful for admin; warn client lightly
    return NextResponse.json(
      {
        inquiry,
        warning:
          "Mensaje guardado. Si es la primera vez, confirma el aviso en tu bandeja (FormSubmit) o configura RESEND_API_KEY.",
      },
      { status: 201 }
    );
  }

  return NextResponse.json({ inquiry, ok: true }, { status: 201 });
}
