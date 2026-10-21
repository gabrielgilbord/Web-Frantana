import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { seedGalleryToSupabase } from "@/lib/content/gallery-seed";

/**
 * POST /api/seed-gallery — sin body.
 * Upsert de las fotos oficiales en public.gallery_images (Supabase).
 * Endpoint abierto a petición (setup one-shot).
 */
export async function POST() {
  const result = await seedGalleryToSupabase();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        hint: "Configura SUPABASE_SERVICE_ROLE_KEY en Vercel y que exista la tabla gallery_images.",
      },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");

  return NextResponse.json({
    ok: true,
    message: `Galería sembrada: ${result.upserted}/${result.total} fotos en Supabase.`,
    upserted: result.upserted,
    total: result.total,
    ids: result.ids,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/seed-gallery (sin body) para volcar las fotos oficiales a Supabase.",
  });
}
