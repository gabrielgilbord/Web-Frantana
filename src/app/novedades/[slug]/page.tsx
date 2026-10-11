import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsPostBySlug, getNewsPosts } from "@/lib/content/store";
import { NEWS_CATEGORY_LABEL, renderNewsBody } from "@/lib/news/render";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getNewsPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Novedad — Frantana" });
  const image = post.coverImage || "/media/hero/hero-poster.jpg";
  return buildMetadata({
    title: `${post.title} — Frantana`,
    description: post.excerpt || post.title,
    alternates: { canonical: `/novedades/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `/novedades/${post.slug}`,
      images: [{ url: image, alt: post.title }],
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

  return (
    <article className="novedad-article">
      <header className="novedad-article__head">
        <Link href="/novedades" className="novedad-article__back">
          ← Novedades
        </Link>
        <p className="novedades-card__kicker">
          {NEWS_CATEGORY_LABEL[post.category]}
        </p>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt ?? post.createdAt}>
          {formatDate(post.publishedAt ?? post.createdAt)}
        </time>
      </header>

      {post.coverImage ? (
        <div className="novedad-article__hero">
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="novedades-media-img"
          />
        </div>
      ) : null}

      <div
        className="novedad-article__body"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="novedad-article__foot">
        <Link href="/novedades" className="chapter__ghost">
          Más novedades →
        </Link>
        <Link href="/contacto" className="chapter__ghost">
          Contacto →
        </Link>
      </footer>
    </article>
  );
}
