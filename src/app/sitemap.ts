import type { MetadataRoute } from "next";
import { getConcerts, getNewsPosts, getProducts } from "@/lib/content/store";
import { SITE_URL } from "@/lib/seo/metadata";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/sobre", changeFrequency: "monthly", priority: 0.85 },
    { path: "/musica", changeFrequency: "weekly", priority: 0.9 },
    { path: "/conciertos", changeFrequency: "daily", priority: 0.95 },
    { path: "/novedades", changeFrequency: "daily", priority: 0.85 },
    { path: "/galeria", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contacto", changeFrequency: "monthly", priority: 0.75 },
    { path: "/reservas", changeFrequency: "weekly", priority: 0.9 },
  ];

  if (SHOP_ENABLED) {
    staticRoutes.push({
      path: "/tienda",
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [posts, concerts, products] = await Promise.all([
    getNewsPosts(),
    getConcerts(),
    SHOP_ENABLED ? getProducts() : Promise.resolve([]),
  ]);

  const newsEntries = posts.map((p) => ({
    url: `${SITE_URL}/novedades/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt || p.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const concertEntries = concerts.map((c) => ({
    url: `${SITE_URL}/conciertos/${c.id}`,
    lastModified: new Date(c.updatedAt || c.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productEntries = products.map((p) => ({
    url: `${SITE_URL}/tienda/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...concertEntries,
    ...newsEntries,
    ...productEntries,
  ];
}
