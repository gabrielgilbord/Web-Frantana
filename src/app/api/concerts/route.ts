import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  deleteConcert,
  getConcerts,
  upsertConcert,
} from "@/lib/content/store";
import { z } from "zod";
import { randomUUID } from "crypto";

async function requireAuth() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

const concertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().nullable().optional(),
  city: z.string().min(1).max(120),
  venue: z.string().min(1).max(160),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  image: z.string().nullable().optional(),
  ticketUrl: z.string().url().nullable().optional().or(z.literal("")),
  ticketStatus: z.enum([
    "available",
    "limited",
    "sold_out",
    "free",
    "cancelled",
    "tba",
  ]),
  published: z.boolean(),
  blocksCalendar: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const concerts = await getConcerts({ includeUnpublished: true });
  return NextResponse.json({ concerts });
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const parsed = concertSchema.parse(await request.json());
    const concert = await upsertConcert({
      id: parsed.id ?? randomUUID(),
      title: parsed.title,
      date: parsed.date,
      time: parsed.time ?? null,
      city: parsed.city,
      venue: parsed.venue,
      lat: parsed.lat ?? null,
      lng: parsed.lng ?? null,
      image: parsed.image ?? null,
      ticketUrl: parsed.ticketUrl || null,
      ticketStatus: parsed.ticketStatus,
      published: parsed.published,
      blocksCalendar: parsed.blocksCalendar ?? true,
      notes: parsed.notes ?? null,
    });
    return NextResponse.json({ concert });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Datos inválidos" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  await deleteConcert(id);
  return NextResponse.json({ ok: true });
}
