import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frantana.es";
const SITE_NAME = "Frantana";

export function buildMetadata(overrides?: Partial<Metadata>): Metadata {
  const description =
    "Web oficial de Frantana — música, conciertos y novedades.";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description,
      images: [
        {
          url: "/media/hero/hero-poster.jpg",
          width: 1920,
          height: 1080,
          alt: "Frantana",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      images: ["/media/hero/hero-poster.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: SITE_URL,
    },
    ...overrides,
  };
}

export function musicGroupJsonLd(options?: {
  spotifyUrl?: string | null;
  social?: Array<string | null | undefined>;
}) {
  const sameAs = (options?.social ?? []).filter(Boolean) as string[];
  if (options?.spotifyUrl) sameAs.push(options.spotifyUrl);
  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "Frantana",
    url: SITE_URL,
    image: `${SITE_URL}/media/hero/hero-poster.jpg`,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export { SITE_URL, SITE_NAME };
