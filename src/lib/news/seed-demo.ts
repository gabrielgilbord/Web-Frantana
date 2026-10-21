import { createAdminClient } from "@/lib/supabase/admin";
import type { NewsPost } from "@/types";

/** IDs fijos (UUID) para poder sembrar y borrar el demo sin tocar posts reales. */
export const NEWS_DEMO_IDS = [
  "c8e00001-0001-4000-8000-000000000001",
  "c8e00001-0001-4000-8000-000000000002",
  "c8e00001-0001-4000-8000-000000000003",
  "c8e00001-0001-4000-8000-000000000004",
] as const;

export const NEWS_DEMO_SLUG_PREFIX = "demo-";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const NEWS_DEMO_POSTS: NewsPost[] = [
  {
    id: NEWS_DEMO_IDS[0],
    slug: "demo-nueva-fecha-en-escena",
    title: "Nueva fecha en el archipiélago",
    excerpt:
      "Frantana anuncia una noche especial con repertorio propio y clásicos canarios.",
    body: `<p>El tablón se mueve: hay <strong>nueva fecha</strong> confirmada y el ensayo ya huele a escenario.</p>
<h2>Qué esperar</h2>
<p>Una noche de canción popular, voz al frente y banda al servicio del tema. Sin artificios de más: luces, silencio y canción.</p>
<blockquote><p>La isla cabe en una frase si se canta con verdad.</p></blockquote>
<p>Las entradas y el detalle del venue se publicarán en Agenda en cuanto cierre la producción.</p>
<ul><li>Repertorio propio</li><li>Clásicos canarios</li><li>Encuentro con el público</li></ul>`,
    coverImage: "/media/gallery/frantana/shot-01.jpg",
    category: "lanzamiento",
    published: true,
    publishedAt: daysAgo(1),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: NEWS_DEMO_IDS[1],
    slug: "demo-detras-del-retrato",
    title: "Detrás del retrato de estudio",
    excerpt:
      "Cómo se construyó la sesión oficial: luz, bandana y la calma de Gran Canaria.",
    body: `<p>La sesión de estudio no buscaba pose de escaparate. Buscaba <em>presencia</em>.</p>
<h2>La luz</h2>
<p>Trabajamos con planos verticales y un fondo limpio para que la mirada haga el trabajo. El resultado ya alimenta la galería y las portadas.</p>
<h3>Detalles</h3>
<p>Bandana, texturas mate y un contraste suave: la misma paleta que viste la web.</p>`,
    coverImage: "/media/gallery/frantana/shot-06.jpg",
    category: "noticia",
    published: true,
    publishedAt: daysAgo(4),
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: NEWS_DEMO_IDS[2],
    slug: "demo-promo-seguir-en-redes",
    title: "Síguelo en redes: lo que no cabe en un cartel",
    excerpt:
      "Stories, ensayos y avisos de última hora llegan primero a Instagram.",
    body: `<p>Si quieres enterarte antes que el tablón, el canal vivo es Instagram.</p>
<p>Allí van los teasers, los backstages y los avisos cuando una fecha se mueve.</p>
<p><a href="https://www.instagram.com/frantana/">Abrir Instagram de Frantana</a></p>`,
    coverImage: "/media/gallery/frantana/shot-03.jpg",
    category: "promocion",
    published: true,
    publishedAt: daysAgo(7),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
  },
  {
    id: NEWS_DEMO_IDS[3],
    slug: "demo-nota-desde-el-camerino",
    title: "Nota desde el camerino",
    excerpt:
      "Una pieza corta sobre el oficio: afinar, esperar y salir cuando toca.",
    body: `<h2>Oficio</h2>
<p>Antes del aplauso hay una lista: afinación, agua, silencio. El camerino no es misterio; es <u>preparación</u>.</p>
<p>Esta nota es un recordatorio para quien viene a la próxima noche: llegar temprano, escuchar y dejarse llevar.</p>
<hr />
<p>Frantana · Gran Canaria</p>`,
    coverImage: "/media/gallery/frantana/shot-08.jpg",
    category: "otro",
    published: true,
    publishedAt: daysAgo(12),
    createdAt: daysAgo(13),
    updatedAt: daysAgo(12),
  },
];

export type NewsSeedResult = {
  ok: boolean;
  count: number;
  slugs: string[];
  error?: string;
};

export async function seedNewsDemo(): Promise<NewsSeedResult> {
  const sb = createAdminClient();
  if (!sb) {
    return {
      ok: false,
      count: 0,
      slugs: [],
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY) en el entorno.",
    };
  }

  const rows = NEWS_DEMO_POSTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    cover_image: p.coverImage,
    category: p.category,
    published: p.published,
    published_at: p.publishedAt,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }));

  const { data, error } = await sb
    .from("news_posts")
    .upsert(rows, { onConflict: "id" })
    .select("slug");

  if (error) {
    return { ok: false, count: 0, slugs: [], error: error.message };
  }

  const slugs = (data ?? []).map((r) => String((r as { slug: string }).slug));
  return {
    ok: true,
    count: slugs.length || rows.length,
    slugs: slugs.length ? slugs : NEWS_DEMO_POSTS.map((p) => p.slug),
  };
}

export async function clearNewsDemo(): Promise<NewsSeedResult> {
  const sb = createAdminClient();
  if (!sb) {
    return {
      ok: false,
      count: 0,
      slugs: [],
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY) en el entorno.",
    };
  }

  const { data, error } = await sb
    .from("news_posts")
    .delete()
    .in("id", [...NEWS_DEMO_IDS])
    .select("slug");

  if (error) {
    return { ok: false, count: 0, slugs: [], error: error.message };
  }

  const slugs = (data ?? []).map((r) => String((r as { slug: string }).slug));
  return { ok: true, count: slugs.length, slugs };
}
