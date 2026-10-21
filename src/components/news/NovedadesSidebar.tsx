import Link from "next/link";
import type { NewsPost } from "@/types";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";
import { formatNewsDate } from "@/lib/news/date";

export function NovedadesSidebar({
  posts,
  currentSlug,
}: {
  posts: NewsPost[];
  currentSlug?: string;
}) {
  const recent = posts.filter((p) => p.slug !== currentSlug).slice(0, 5);
  const byCat = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="az-news-side">
      <div className="az-news-side__block">
        <h3 className="az-news-side__title">Categorías</h3>
        <ul className="az-news-side__cats">
          {Object.entries(byCat).map(([cat, n]) => (
            <li key={cat}>
              <span>{NEWS_CATEGORY_LABEL[cat] ?? cat}</span>
              <span className="az-news-side__count">{n}</span>
            </li>
          ))}
          {Object.keys(byCat).length === 0 ? (
            <li>
              <span>Sin categorías aún</span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="az-news-side__block">
        <h3 className="az-news-side__title">Recientes</h3>
        <ul className="az-news-side__recent">
          {recent.map((p) => (
            <li key={p.id}>
              <Link href={`/novedades/${p.slug}`}>
                <span className="az-news-side__recent-title">{p.title}</span>
                <time dateTime={p.publishedAt ?? p.createdAt}>
                  {formatNewsDate(p.publishedAt ?? p.createdAt)}
                </time>
              </Link>
            </li>
          ))}
          {recent.length === 0 ? (
            <li className="az-news-side__empty">No hay más entradas.</li>
          ) : null}
        </ul>
      </div>
    </aside>
  );
}
