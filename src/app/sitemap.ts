import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/sobre",
    "/musica",
    "/conciertos",
    "/galeria",
    "/contacto",
    "/reservas",
  ];
  // Shop never appears while SHOP_ENABLED=false
  if (SHOP_ENABLED) {
    routes.push("/tienda");
  }

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
