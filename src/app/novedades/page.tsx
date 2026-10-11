import Image from "next/image";
import Link from "next/link";
import { getNewsPosts } from "@/lib/content/store";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Novedades — Frantana",
  description:
    "Lanzamientos, promociones y notas del tablón de Frantana. El pulso reciente del artista.",
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NovedadesPage() {
  const posts = await getNewsPosts();

  return (
    <main className="novedades-page">
      <header className="novedades-page__mast">
        <p className="novedades-page__eyebrow">El tablón</p>
        <h1 className="novedades-page__title">Novedades</h1>
        <p className="novedades-page__lede">
          Lanzamientos, fechas especiales y notas desde el camerino.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="novedades-page__empty">
          Pronto habrá noticias aquí. Mientras, sigue a Frantana en redes.
        </p>
      ) : (
        <ul className="novedades-index">
          {posts.map((post, i) => (
            <li key={post.id}>
              <Link href={`/novedades/${post.slug}`} className="novedades-row">
                <div className="novedades-row__media">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 48vw"
                      className="novedades-media-img"
                      priority={i < 2}
                    />
                  ) : (
                    <div className="novedades-card__fallback" />
                  )}
                </div>
                <div className="novedades-row__copy">
                  <div className="novedades-row__meta">
                    <span className="novedades-card__kicker">
                      {NEWS_CATEGORY_LABEL[post.category]}
                    </span>
                    <time dateTime={post.publishedAt ?? post.createdAt}>
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </time>
                  </div>
                  <h3>{post.title}</h3>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                  <span className="novedades-card__cta">Seguir leyendo →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
