import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  deleteProduct,
  getProducts,
  upsertProduct,
} from "@/lib/content/store";
import { z } from "zod";
import { randomUUID } from "crypto";

const variantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sku: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default("EUR"),
  stock: z.number().int().nonnegative(),
  attributes: z.record(z.string(), z.string()).default({}),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  category: z.enum(["merch", "digital", "physical_music"]),
  images: z.array(z.string()).default([]),
  published: z.boolean(),
  featured: z.boolean(),
  variants: z.array(variantSchema).default([]),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({
    products: await getProducts({ includeUnpublished: true }),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const parsed = productSchema.parse(await request.json());
    const now = new Date().toISOString();
    const product = await upsertProduct({
      id: parsed.id ?? randomUUID(),
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      category: parsed.category,
      images: parsed.images,
      published: parsed.published,
      featured: parsed.featured,
      variants: parsed.variants,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ product });
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
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
