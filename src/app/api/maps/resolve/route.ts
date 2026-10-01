import { NextResponse } from "next/server";
import { z } from "zod";
import { parseGoogleMapsUrl } from "@/lib/maps/parse-google-maps-url";
import { getAdminSession } from "@/lib/auth/session";

const bodySchema = z.object({
  url: z.string().min(8).max(2000),
});

/**
 * Resuelve URLs cortas de Maps (goo.gl / maps.app.goo.gl) siguiendo redirects
 * y extrae lat/lng. Solo admin autenticado.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { url } = bodySchema.parse(await request.json());

    const direct = parseGoogleMapsUrl(url);
    if (direct) {
      return NextResponse.json({ ...direct, resolvedUrl: url });
    }

    // Seguir redirects de enlaces cortos
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let resolvedUrl = url;
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FrantanaAdmin/1.0; +https://frantana.es)",
        },
      });
      resolvedUrl = res.url || url;
    } finally {
      clearTimeout(timer);
    }

    const parsed = parseGoogleMapsUrl(resolvedUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "No se pudieron leer coordenadas. Abre el sitio en Google Maps → Compartir → Copiar enlace (enlace completo).",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ ...parsed, resolvedUrl });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "No se pudo resolver el enlace",
      },
      { status: 400 }
    );
  }
}
