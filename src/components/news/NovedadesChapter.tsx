import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";
import type { NewsPost } from "@/types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NovedadesChapter({ posts }: { posts: NewsPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="chapter chapter--novedades" aria-labelledby="ch-07">
      <div className="novedades-band">
        <Reveal className="novedades-band__intro" y={28}>
          <p className="chapter__index">07 — El tablón</p>
          <h2 id="ch-07" className="chapter__title">
            Novedades
          </h2>
          <p className="chapter__body">
            Lanzamientos, fechas especiales y notas desde el camerino.
          </p>
          <Link href="/novedades" className="novedades-band__all">
            Ver todas →
          </Link>
        </Reveal>

        <div className="novedades-band__list">
          {posts.map((post, i) => (
            <Reveal key={post.id} y={36} delay={0.05 + i * 0.06}>
              <Link
                href={`/novedades/${post.slug}`}
                className="novedades-row"
              >
                <div className="novedades-row__media">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 48vw"
                      className="novedades-media-img"
                    />
                  ) : (
                    <div className="novedades-card__fallback" aria-hidden />
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
