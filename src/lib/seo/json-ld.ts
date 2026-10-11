import type { Concert, NewsPost, Product, SiteContent } from "@/types";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";

function abs(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function uniqueUrls(urls: Array<string | null | undefined>): string[] {
  return [...new Set(urls.filter((u): u is string => Boolean(u)))];
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "FRANTANA",
    url: SITE_URL,
    inLanguage: "es-ES",
    description:
      "Web oficial de Frantana, cantante y compositor canario: música, conciertos, novedades y contrataciones.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/media/brand/frantana-wordmark.png`,
    },
  };
}

export function musicGroupJsonLd(options?: {
  description?: string;
  spotifyUrl?: string | null;
  social?: Array<string | null | undefined>;
  email?: string | null;
  phone?: string | null;
}) {
  const sameAs = uniqueUrls([
    ...(options?.social ?? []),
    options?.spotifyUrl,
  ]);

  return {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${SITE_URL}/#artist`,
    name: SITE_NAME,
    alternateName: ["FRANTANA"],
    description:
      options?.description ||
      "Cantante y compositor canario. Música, conciertos y actuaciones en Canarias y España.",
    url: SITE_URL,
    image: [
      `${SITE_URL}/media/hero/hero-poster.jpg`,
      `${SITE_URL}/media/brand/frantana-wordmark.png`,
    ],
    genre: ["Pop", "Latin Pop", "Música canaria", "Cantautor"],
    foundingLocation: {
      "@type": "Place",
      name: "Islas Canarias, España",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Canarias",
        addressCountry: "ES",
      },
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Canarias" },
      { "@type": "Country", name: "España" },
    ],
    ...(options?.email ? { email: options.email } : {}),
    ...(options?.phone ? { telephone: options.phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function personJsonLd(content: SiteContent) {
  const sameAs = uniqueUrls([
    content.social.instagram,
    content.social.facebook,
    content.social.spotify ?? content.spotifyArtistUrl,
    content.social.youtube,
    content.social.tiktok,
    content.social.appleMusic,
  ]);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: SITE_NAME,
    jobTitle: "Cantante y compositor",
    description:
      content.seoDescription ||
      (content.aboutBody ? content.aboutBody.slice(0, 280) : undefined) ||
      "Cantante y compositor canario.",
    url: SITE_URL,
    image: `${SITE_URL}/media/hero/hero-poster.jpg`,
    nationality: { "@type": "Country", name: "España" },
    homeLocation: {
      "@type": "Place",
      name: "Islas Canarias, España",
    },
    ...(content.contactEmail ? { email: content.contactEmail } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

const TICKET_AVAILABILITY: Record<string, string> = {
  available: "https://schema.org/InStock",
  limited: "https://schema.org/LimitedAvailability",
  sold_out: "https://schema.org/SoldOut",
  free: "https://schema.org/InStock",
  cancelled: "https://schema.org/Discontinued",
  tba: "https://schema.org/PreOrder",
};

export function concertEventJsonLd(
  concert: Concert,
  heroImage?: string | null
) {
  const start =
    concert.time && /^\d{2}:\d{2}$/.test(concert.time)
      ? `${concert.date}T${concert.time}:00`
      : `${concert.date}T20:00:00`;

  const status =
    concert.ticketStatus === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled";

  const image = abs(heroImage || concert.image) || `${SITE_URL}/media/hero/hero-poster.jpg`;

  const location: Record<string, unknown> = {
    "@type": "Place",
    name: concert.venue,
    address: {
      "@type": "PostalAddress",
      addressLocality: concert.city,
      addressCountry: "ES",
    },
  };

  if (concert.lat != null && concert.lng != null) {
    location.geo = {
      "@type": "GeoCoordinates",
      latitude: concert.lat,
      longitude: concert.lng,
    };
  }

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": `${SITE_URL}/conciertos/${concert.id}`,
    name: concert.title,
    description:
      concert.notes ||
      `${concert.title} — ${concert.venue}, ${concert.city}. Actuación de Frantana.`,
    startDate: start,
    eventStatus: status,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location,
    image: [image],
    performer: {
      "@type": "MusicGroup",
      "@id": `${SITE_URL}/#artist`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    organizer: {
      "@type": "MusicGroup",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/conciertos/${concert.id}`,
    inLanguage: "es-ES",
  };

  if (concert.ticketUrl || concert.ticketStatus === "free") {
    data.offers = {
      "@type": "Offer",
      url: concert.ticketUrl || `${SITE_URL}/conciertos/${concert.id}`,
      availability: TICKET_AVAILABILITY[concert.ticketStatus] ?? TICKET_AVAILABILITY.tba,
      priceCurrency: "EUR",
      ...(concert.ticketStatus === "free" ? { price: 0 } : {}),
      validFrom: concert.createdAt,
    };
  }

  return data;
}

export function newsArticleJsonLd(post: NewsPost) {
  const url = `${SITE_URL}/novedades/${post.slug}`;
  const image = abs(post.coverImage) || `${SITE_URL}/media/hero/hero-poster.jpg`;
  const published = post.publishedAt || post.createdAt;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    headline: post.title,
    description: post.excerpt || post.title,
    image: [image],
    datePublished: published,
    dateModified: post.updatedAt || published,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/media/brand/frantana-wordmark.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "es-ES",
    url,
  };
}

export function productJsonLd(product: Product) {
  const url = `${SITE_URL}/tienda/${product.slug}`;
  const prices = product.variants.map((v) => v.priceCents / 100);
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 0;
  const currency = product.variants[0]?.currency || "EUR";
  const inStock = product.variants.some((v) => v.stock > 0);
  const images = product.images.map((src) => abs(src)!).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.name,
    description: product.description,
    image: images.length ? images : [`${SITE_URL}/media/hero/hero-poster.jpg`],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    url,
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: currency,
      lowPrice: low.toFixed(2),
      highPrice: high.toFixed(2),
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}
