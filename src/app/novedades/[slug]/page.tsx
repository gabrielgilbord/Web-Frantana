import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareNewsBar } from "@/components/news/ShareNewsBar";
import { NovedadesSidebar } from "@/components/news/NovedadesSidebar";
import { getNewsPostBySlug, getNewsPosts } from "@/lib/content/store";
import { formatNewsDate } from "@/lib/news/date";
import { NEWS_CATEGORY_LABEL, renderNewsBody } from "@/lib/news/render";
import {
  breadcrumbJsonLd,
  buildMetadata,
  newsArticleJsonLd,
} from "@/lib/seo/metadata";
import { getPublicSiteUrl } from "@/lib/email/site-url";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) {
    return buildMetadata({
      path: "/novedades",
      title: "Novedad",
      noIndex: true,
    });
  }
  const path = `/novedades/${post.slug}`;
  const image = post.coverImage || "/media/hero/hero-poster.jpg";
  const description =
    post.excerpt ||
    `${post.title} — novedad de Frantana, cantante y compositor canario.`;

  return buildMetadata({
    path,
    title: { absolute: `${post.title} · Frantana` },
    description,
    image,
    imageAlt: post.title,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: path,
      images: [{ url: image, alt: post.title }],
      publishedTime: post.publishedAt ?? post.createdAt,
      modifiedTime: post.updatedAt,
      authors: ["Frantana"],
    },
  });
}

export default async function NovedadDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, all] = await Promise.all([
    getNewsPostBySlug(slug),
    getNewsPosts(),
  ]);
  if (!post) notFound();

  const html = renderNewsBody(post.body);
  const path = `/novedades/${post.slug}`;
  const shareUrl = `${getPublicSiteUrl()}${path}`;
  const dateIso = post.publishedAt ?? post.createdAt;

  const idx = all.findIndex((p) => p.id === post.id);
  const prev = idx >= 0 ? all[idx + 1] : undefined;
  const next = idx > 0 ? all[idx - 1] : undefined;

  return (
    <article className="az-news az-news--single">
      <JsonLd
        data={[
          newsArticleJsonLd(post),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Novedades", path: "/novedades" },
            { name: post.title, path },
          ]),
        ]}
      />

      <div className="az-news__layout">
        <div className="az-news__main">
          <Link href="/novedades" className="az-news__back">
            ← Novedades
          </Link>

          <div className="az-single">
            {post.coverImage ? (
              <div className="az-single__feature">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1600}
                  height={1000}
                  priority
                  sizes="(max-width: 900px) 100vw, 70vw"
                  className="az-single__cover"
                />
              </div>
            ) : null}

            <div className="az-single__details">
              <h1>{post.title}</h1>
              <ul className="az-single__meta">
                <li>{NEWS_CATEGORY_LABEL[post.category]}</li>
                <li>
                  <time dateTime={dateIso}>{formatNewsDate(dateIso)}</time>
                </li>
              </ul>
              {post.excerpt ? (
                <p className="az-single__excerpt">{post.excerpt}</p>
              ) : null}
              <div
                className="az-single__body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>

          <div className="az-single__share">
            <ShareNewsBar
              title={post.title}
              url={shareUrl}
              excerpt={post.excerpt}
            />
          </div>

          {(prev || next) && (
            <nav className="az-single__nav" aria-label="Otras novedades">
              {prev ? (
                <Link
                  href={`/novedades/${prev.slug}`}
                  className="az-single__nav-item az-single__nav-item--prev"
                >
                  <span>Anterior</span>
                  <strong>{prev.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/novedades/${next.slug}`}
                  className="az-single__nav-item az-single__nav-item--next"
                >
                  <span>Siguiente</span>
                  <strong>{next.title}</strong>
                </Link>
              ) : null}
            </nav>
          )}

          <div className="az-single__author">
            <div className="az-single__author-media">
              <Image
                src="/media/gallery/frantana/shot-01.jpg"
                alt="Frantana"
                width={96}
                height={96}
                className="az-single__author-img"
              />
            </div>
            <div className="az-single__author-copy">
              <p className="az-single__author-kicker">Escrito por</p>
              <h3>Frantana</h3>
              <p>
                Cantante y compositor canario. Escenarios, canciones y presencia
                en vivo desde Gran Canaria.
              </p>
            </div>
          </div>
        </div>

        <NovedadesSidebar posts={all} currentSlug={post.slug} />
      </div>
    </article>
  );
}
