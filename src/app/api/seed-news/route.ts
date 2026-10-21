import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { seedNewsDemo } from "@/lib/news/seed-demo";

/** POST /api/seed-news — sin body. Inserta 4 novedades demo. */
export async function POST() {
  const result = await seedNewsDemo();
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        hint: "Configura SUPABASE_SERVICE_ROLE_KEY y la tabla news_posts (004_news_posts.sql).",
      },
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
    message: `Novedades demo: ${result.count} publicadas.`,
    count: result.count,
    slugs: result.slugs,
    clear: "POST /api/seed-news/clear",
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST /api/seed-news para crear demos · POST /api/seed-news/clear para borrarlas",
  });
}
