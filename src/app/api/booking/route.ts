import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import {
  createBooking,
  getBookings,
  getOccupancy,
  updateBookingStatus,
} from "@/lib/content/store";

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

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "read", "replied", "archived"]),
});

function emptyToNull(v: string | null | undefined) {
  if (!v || !v.trim()) return null;
  return v.trim();
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

  return NextResponse.json({ booking }, { status: 201 });
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

  const booking = await updateBookingStatus(parsed.data.id, parsed.data.status);
  if (!booking) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
