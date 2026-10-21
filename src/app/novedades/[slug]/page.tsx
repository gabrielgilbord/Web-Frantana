import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareNewsBar } from "@/components/news/ShareNewsBar";
import { getNewsPostBySlug } from "@/lib/content/store";
import { NEWS_CATEGORY_LABEL, renderNewsBody } from "@/lib/news/render";
import {
  breadcrumbJsonLd,
  buildMetadata,
  newsArticleJsonLd,
} from "@/lib/seo/metadata";
import { getPublicSiteUrl } from "@/lib/email/site-url";

type Props = { params: Promise<{ slug: string }> };

/** Soft-schedule + admin publishes must appear without waiting for a rebuild. */
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

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NovedadDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) notFound();

  const html = renderNewsBody(post.body);
  const path = `/novedades/${post.slug}`;
  const shareUrl = `${getPublicSiteUrl()}${path}`;
  const dateIso = post.publishedAt ?? post.createdAt;

  return (
    <article className="novedad-article">
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

      <div className="novedad-article__rail">
        <Link href="/novedades" className="novedad-article__back">
          ← Novedades
        </Link>

        <header className="novedad-article__mast">
          <p className="novedad-article__meta">
            <span>{NEWS_CATEGORY_LABEL[post.category]}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={dateIso}>{formatDate(dateIso)}</time>
          </p>
          <h1>{post.title}</h1>
          {post.excerpt ? (
            <p className="novedad-article__lead">{post.excerpt}</p>
          ) : null}
        </header>

        {post.coverImage ? (
          <figure className="novedad-article__figure">
            <div className="novedad-article__frame">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1600}
                height={2000}
                priority
                sizes="(max-width: 900px) 100vw, 52rem"
                className="novedad-article__cover"
              />
            </div>
          </figure>
        ) : null}

        <div
          className="novedad-article__body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="novedad-article__share">
          <ShareNewsBar
            title={post.title}
            url={shareUrl}
            excerpt={post.excerpt}
          />
        </div>

        <footer className="novedad-article__foot">
          <Link href="/novedades" className="chapter__ghost">
            Más novedades →
          </Link>
          <Link href="/contacto" className="chapter__ghost">
            Contacto →
          </Link>
        </footer>
      </div>
    </article>
  );
}
