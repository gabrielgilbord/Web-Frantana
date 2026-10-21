import Image from "next/image";
import Link from "next/link";
import type { NewsPost } from "@/types";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";

export function NovedadesSidebar({
  posts,
  currentSlug,
  title = "También en el tablón",
}: {
  posts: NewsPost[];
  currentSlug?: string;
  title?: string;
}) {
  const items = posts.filter((p) => p.slug !== currentSlug).slice(0, 6);

  if (items.length === 0) return null;

  return (
    <aside className="az-news-rail" aria-label={title}>
      <h2 className="az-news-rail__heading">{title}</h2>
      <ul className="az-news-rail__list">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={`/novedades/${p.slug}`} className="az-news-rail__item">
              <span className="az-news-rail__thumb">
                {p.coverImage ? (
                  <Image
                    src={p.coverImage}
                    alt=""
                    fill
                    sizes="120px"
                    className="az-news-rail__img"
                  />
                ) : (
                  <span className="az-news-rail__fallback" />
                )}
              </span>
              <span className="az-news-rail__copy">
                <span className="az-news-rail__cat">
                  {NEWS_CATEGORY_LABEL[p.category]}
                </span>
                <span className="az-news-rail__title">{p.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
