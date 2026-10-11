import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import {
  deleteNewsPost,
  getNewsPosts,
  upsertNewsPost,
} from "@/lib/content/store";
import { slugifyNews } from "@/lib/news/slug";

const schema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(2).max(80).optional(),
  title: z.string().trim().min(2).max(160),
  excerpt: z.string().trim().max(400).optional().nullable(),
  body: z.string().trim().min(1).max(20000),
  coverImage: z.string().nullable().optional(),
  category: z.enum(["lanzamiento", "promocion", "noticia", "otro"]),
  published: z.boolean(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const posts = await getNewsPosts({ includeUnpublished: true });
  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const parsed = schema.parse(await req.json());
    const now = new Date().toISOString();
    const id = parsed.id ?? `news-${randomUUID()}`;
    const slug =
      parsed.slug?.trim() ||
      slugifyNews(parsed.title) ||
      `novedad-${id.slice(-6)}`;

    let publishedAt = parsed.publishedAt ?? null;
    if (parsed.published && !publishedAt) {
      publishedAt = now;
    }

    const post = await upsertNewsPost({
      id,
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt?.trim() || "",
      body: parsed.body,
      coverImage: parsed.coverImage ?? null,
      category: parsed.category,
      published: parsed.published,
      publishedAt,
      createdAt: parsed.createdAt || now,
      updatedAt: now,
    });

    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Datos inválidos" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }
  await deleteNewsPost(id);
  return NextResponse.json({ ok: true });
}
