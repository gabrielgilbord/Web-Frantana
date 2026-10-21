import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { clearNewsDemo } from "@/lib/news/seed-demo";

/** POST /api/seed-news/clear — sin body. Borra solo las novedades del seed demo. */
export async function POST() {
  const result = await clearNewsDemo();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/novedades");
  for (const slug of result.slugs) {
    revalidatePath(`/novedades/${slug}`);
  }

  return NextResponse.json({
    ok: true,
    message: `Eliminadas ${result.count} novedades demo.`,
    count: result.count,
    slugs: result.slugs,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/seed-news/clear para borrar las novedades demo",
  });
}
