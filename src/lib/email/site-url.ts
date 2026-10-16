const PRODUCTION_SITE_URL = "https://frantana.es";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_SITE_URL
  ).replace(/\/$/, "");
}

function isLocalOrInsecure(url: string) {
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.startsWith("http://")
  );
}

/**
 * URL pública canónica. Nunca localhost: compartir, SEO y emails
 * deben apuntar siempre a frantana.es en producción aparente.
 */
export function getPublicSiteUrl() {
  const site = getSiteUrl();
  if (isLocalOrInsecure(site)) return PRODUCTION_SITE_URL;
  return site;
}

/** En local, las imágenes del correo deben apuntar a producción (clientes no ven localhost). */
export function getEmailAssetBaseUrl() {
  return getPublicSiteUrl();
}

export function absoluteUrl(path: string) {
  const base = getEmailAssetBaseUrl();
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
