import type { MetadataRoute } from "next";
import { getNewsPosts } from "@/lib/content/store";
import { SITE_URL } from "@/lib/seo/metadata";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/sobre",
    "/musica",
    "/conciertos",
    "/novedades",
    "/galeria",
    "/contacto",
    "/reservas",
  ];
  if (SHOP_ENABLED) {
    routes.push("/tienda");
  }

  const staticEntries = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const posts = await getNewsPosts();
  const newsEntries = posts.map((p) => ({
    url: `${SITE_URL}/novedades/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt || p.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...newsEntries];
}
