export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://frantana.es"
  ).replace(/\/$/, "");
}

/** En local, las imágenes del correo deben apuntar a producción (clientes no ven localhost). */
export function getEmailAssetBaseUrl() {
  const site = getSiteUrl();
  if (
    site.includes("localhost") ||
    site.includes("127.0.0.1") ||
    site.startsWith("http://")
  ) {
    return "https://frantana.es";
  }
  return site;
}

export function absoluteUrl(path: string) {
  const base = getEmailAssetBaseUrl();
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
