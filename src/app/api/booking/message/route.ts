import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { addBookingMessage } from "@/lib/content/store";

const schema = z.object({
  body: z.string().trim().min(1).max(2000),
  token: z.string().min(8).optional(),
  bookingId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const { token, bookingId, body: text } = parsed.data;

  if (bookingId) {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const booking = await addBookingMessage({
      bookingId,
      from: "admin",
      body: text,
    });
    if (!booking) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ booking });
  }

  if (!token) {
    return NextResponse.json({ error: "Falta token" }, { status: 400 });
  }

  const booking = await addBookingMessage({
    token,
    from: "client",
    body: text,
  });
  if (!booking) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Public response: strip nothing critical; token already known
  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      messages: booking.messages,
      updatedAt: booking.updatedAt,
    },
  });
}
