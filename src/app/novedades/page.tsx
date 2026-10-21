import Image from "next/image";
import Link from "next/link";
import { NovedadesSidebar } from "@/components/news/NovedadesSidebar";
import { getNewsPosts } from "@/lib/content/store";
import { newsDateParts } from "@/lib/news/date";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  path: "/novedades",
  title: "Novedades y noticias",
  description:
    "Novedades de Frantana: lanzamientos, fechas especiales, promociones y notas del artista canario.",
  keywords: [
    "noticias Frantana",
    "novedades Frantana",
    "lanzamientos Frantana",
  ],
});

export default async function NovedadesPage() {
  const posts = await getNewsPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main className="az-news">
      <header className="az-news__mast">
        <p className="az-news__eyebrow">El tablón</p>
        <h1 className="az-news__title">Novedades</h1>
        <p className="az-news__lede">
          Lanzamientos, fechas especiales y notas desde el camerino.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="az-news__empty">
          Pronto habrá noticias aquí. Mientras, sigue a Frantana en redes.
        </p>
      ) : (
        <>
          <div className="az-news__layout az-news__layout--hero">
            <div className="az-news__main">
              {featured ? (
                <article className="az-news-feature">
                  <Link
                    href={`/novedades/${featured.slug}`}
                    className="az-news-feature__media"
                  >
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 960px) 100vw, 65vw"
                        className="az-news-feature__img"
                      />
                    ) : (
                      <div className="az-news-feature__fallback" />
                    )}
                    <span className="az-news-feature__veil" aria-hidden />
                    <span className="az-news-feature__overlay">
                      <span className="az-news-feature__cat">
                        {NEWS_CATEGORY_LABEL[featured.category]}
                      </span>
                      <h2 className="az-news-feature__title">
                        {featured.title}
                      </h2>
                      {featured.excerpt ? (
                        <p className="az-news-feature__excerpt">
                          {featured.excerpt}
                        </p>
                      ) : null}
                    </span>
                  </Link>
                </article>
              ) : null}
            </div>
            <NovedadesSidebar posts={rest} title="Más noticias" />
          </div>

          {rest.length > 5 ? (
            <div className="az-news-list az-news-list--below">
              {rest.slice(5).map((post, i) => {
                const dateIso = post.publishedAt ?? post.createdAt;
                const { day, month } = newsDateParts(dateIso);
                return (
                  <article key={post.id} className="az-news-item">
                    <Link
                      href={`/novedades/${post.slug}`}
                      className="az-news-item__media"
                    >
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 100vw, 60vw"
                          className="az-news-item__img"
                          priority={i < 1}
                        />
                      ) : (
                        <div className="az-news-item__fallback" />
                      )}
                      <span className="az-news-item__date" aria-hidden="true">
                        <strong>{day}</strong>
                        <span>{month}</span>
                      </span>
                    </Link>
                    <div className="az-news-item__body">
                      <Link
                        href={`/novedades/${post.slug}`}
                        className="az-news-item__title"
                      >
                        <h2>{post.title}</h2>
                      </Link>
                      {post.excerpt ? <p>{post.excerpt}</p> : null}
                      <ul className="az-news-item__meta">
                        <li>{NEWS_CATEGORY_LABEL[post.category]}</li>
                        <li>
                          <time dateTime={dateIso}>
                            {new Date(dateIso).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </time>
                        </li>
                      </ul>
                      <Link
                        href={`/novedades/${post.slug}`}
                        className="az-news-item__cta"
                      >
                        Seguir leyendo →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
