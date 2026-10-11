import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://frantana.es";
const SITE_NAME = "Frantana";
const DEFAULT_OG = "/media/hero/hero-poster.jpg";
const DEFAULT_DESCRIPTION =
  "Frantana — cantante y compositor canario. Escucha su música, consulta conciertos en Canarias y España, novedades y contrataciones.";

const DEFAULT_KEYWORDS = [
  "Frantana",
  "cantante canario",
  "compositor canario",
  "música canaria",
  "conciertos Canarias",
  "conciertos Tenerife",
  "conciertos Gran Canaria",
  "artista canario",
  "contratar cantante Canarias",
  "música en vivo Canarias",
  "cantante para eventos Canarias",
];

export type BuildMetadataInput = Partial<Metadata> & {
  /** Ruta canónica relativa, p.ej. `/sobre`. */
  path?: string;
  /** Imagen OG/Twitter (ruta o URL absoluta). */
  image?: string;
  imageAlt?: string;
  /** Si true, no indexar ni seguir. */
  noIndex?: boolean;
  keywords?: string[];
};

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

function resolveTitleString(title: Metadata["title"]): string | undefined {
  if (!title) return undefined;
  if (typeof title === "string") return title;
  if (typeof title === "object" && "absolute" in title && title.absolute) {
    return String(title.absolute);
  }
  if (typeof title === "object" && "default" in title && title.default) {
    return String(title.default);
  }
  return undefined;
}

export function buildMetadata(overrides: BuildMetadataInput = {}): Metadata {
  const {
    path,
    image,
    imageAlt,
    noIndex,
    keywords,
    openGraph: ogOverride,
    twitter: twOverride,
    alternates: altOverride,
    robots: robotsOverride,
    title: titleOverride,
    description: descriptionOverride,
    ...rest
  } = overrides;

  const description =
    typeof descriptionOverride === "string" && descriptionOverride
      ? descriptionOverride
      : DEFAULT_DESCRIPTION;

  const canonicalPath =
    typeof altOverride?.canonical === "string"
      ? altOverride.canonical
      : path;

  const pageUrl = canonicalPath ? absoluteUrl(canonicalPath) : SITE_URL;
  const ogImagePath = image || DEFAULT_OG;
  const ogImageUrl = absoluteUrl(ogImagePath);
  const titleStr = resolveTitleString(titleOverride) ?? SITE_NAME;

  const ogImages = ogOverride?.images ?? [
    {
      url: ogImagePath,
      width: 1920,
      height: 1080,
      alt: imageAlt || titleStr,
    },
  ];

  const verification: Metadata["verification"] = {};
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  const meta: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: titleOverride ?? {
      default: `${SITE_NAME} | Cantante y compositor canario`,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "music",
    keywords: keywords ?? DEFAULT_KEYWORDS,
    openGraph: {
      locale: "es_ES",
      siteName: SITE_NAME,
      title: titleStr,
      description,
      url: pageUrl,
      images: ogImages,
      type: "website",
      ...ogOverride,
    },
    twitter: {
      card: "summary_large_image",
      title: titleStr,
      description,
      images: [ogImageUrl],
      ...twOverride,
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : robotsOverride ?? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      languages: { "es-ES": canonicalPath ?? "/" },
      ...altOverride,
      canonical: altOverride?.canonical ?? canonicalPath,
    },
    ...rest,
  };

  if (Object.keys(verification).length) {
    meta.verification = verification;
  }

  meta.description = description;
  if (titleOverride !== undefined) meta.title = titleOverride;

  return meta;
}

export {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
};

export {
  musicGroupJsonLd,
  websiteJsonLd,
  personJsonLd,
  concertEventJsonLd,
  newsArticleJsonLd,
  productJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/json-ld";
