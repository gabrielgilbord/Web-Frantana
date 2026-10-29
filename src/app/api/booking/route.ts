import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import {
  createBooking,
  getBookings,
  getOccupancy,
  updateBookingStatus,
} from "@/lib/content/store";
import { getNotifyEmail, isSmtpConfigured, sendEmail } from "@/lib/email/smtp";
import { getSiteUrl } from "@/lib/email/site-url";
import {
  bookingArtistNewEmail,
  bookingRequesterConfirmedEmail,
  bookingRequesterReceivedEmail,
  bookingRequesterRejectedEmail,
} from "@/lib/email/templates";
import type { BookingStatus } from "@/types";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().nullable().or(z.literal("")),
  eventType: z.enum(["privado", "boda", "corporativo", "fiesta", "otro"]),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  city: z.string().trim().min(2).max(120),
  venue: z.string().trim().max(160).optional().nullable().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

const BOOKING_STATUSES = [
  "new",
  "read",
  "replied",
  "confirmed",
  "rejected",
  "archived",
] as const;

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
});

function emptyToNull(v: string | null | undefined) {
  if (!v || !v.trim()) return null;
  return v.trim();
}

function trackUrlFor(token: string) {
  return `${getSiteUrl()}/reservas/seguimiento/${token}`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const bookings = await getBookings();
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const occupancy = await getOccupancy();
    if (occupancy.some((d) => d.date === parsed.data.preferredDate)) {
      return NextResponse.json(
        { error: "Esa fecha ya está ocupada. Elige otro día en el calendario." },
        { status: 409 }
      );
    }

    const booking = await createBooking({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: emptyToNull(parsed.data.phone),
      eventType: parsed.data.eventType,
      preferredDate: parsed.data.preferredDate,
      preferredTime: emptyToNull(parsed.data.preferredTime),
      city: parsed.data.city,
      venue: emptyToNull(parsed.data.venue),
      message: parsed.data.message,
    });

    if (isSmtpConfigured()) {
      const trackUrl = trackUrlFor(booking.accessToken);
      const artistMail = bookingArtistNewEmail(booking, trackUrl);
      const requesterMail = bookingRequesterReceivedEmail(booking, trackUrl);

      try {
        await Promise.all([
          sendEmail({
            to: getNotifyEmail(),
            subject: artistMail.subject,
            text: artistMail.text,
            html: artistMail.html,
            replyTo: booking.email,
          }),
          sendEmail({
            to: booking.email,
            subject: requesterMail.subject,
            text: requesterMail.text,
            html: requesterMail.html,
          }),
        ]);
      } catch (e) {
        console.error("[booking] email delivery failed", e);
        return NextResponse.json(
          {
            booking,
            warning:
              "Reserva guardada, pero el correo de aviso no se pudo enviar. Revisa SMTP.",
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    console.error("[booking] create failed", e);
    const message =
      e instanceof Error && e.message
        ? e.message
        : "No se pudo guardar la solicitud. Inténtalo de nuevo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const previous = (await getBookings()).find((b) => b.id === parsed.data.id);
  if (!previous) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const nextStatus = parsed.data.status as BookingStatus;
  const booking = await updateBookingStatus(parsed.data.id, nextStatus);
  if (!booking) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const statusChanged = previous.status !== nextStatus;
  const shouldNotify =
    statusChanged &&
    (nextStatus === "confirmed" || nextStatus === "rejected") &&
    isSmtpConfigured();

  if (shouldNotify) {
    const trackUrl = trackUrlFor(booking.accessToken);
    const mail =
      nextStatus === "confirmed"
        ? bookingRequesterConfirmedEmail(booking, trackUrl)
        : bookingRequesterRejectedEmail(booking, trackUrl);

    try {
      await sendEmail({
        to: booking.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (e) {
      console.error("[booking] status email failed", e);
      return NextResponse.json(
        {
          booking,
          warning:
            "Estado actualizado, pero no se pudo notificar al solicitante por correo.",
        },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ booking });
}
