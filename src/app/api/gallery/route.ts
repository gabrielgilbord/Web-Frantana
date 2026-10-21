import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import {
  deleteGalleryImage,
  getGallery,
  upsertGalleryImage,
} from "@/lib/content/store";

const schema = z.object({
  id: z.string().optional(),
  src: z.string().min(1),
  alt: z.string().min(1).max(300),
  width: z.number().int().positive().default(1600),
  height: z.number().int().positive().default(1067),
  published: z.boolean(),
  sortOrder: z.number().int().default(0),
  credit: z.string().nullable().optional(),
});

function revalidateGallery() {
  revalidatePath("/");
  revalidatePath("/galeria");
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({
    gallery: await getGallery({ includeUnpublished: true }),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const parsed = schema.parse(await request.json());
    const image = await upsertGalleryImage({
      id: parsed.id ?? randomUUID(),
      src: parsed.src,
      alt: parsed.alt,
      width: parsed.width,
      height: parsed.height,
      published: parsed.published,
      sortOrder: parsed.sortOrder,
      credit: parsed.credit ?? null,
    });
    revalidateGallery();
    return NextResponse.json({ image });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Datos inválidos" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  await deleteGalleryImage(id);
  revalidateGallery();
  return NextResponse.json({ ok: true });
}
