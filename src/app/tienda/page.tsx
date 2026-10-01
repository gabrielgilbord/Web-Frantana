import Link from "next/link";
import { getProducts } from "@/lib/content/store";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { ShopExperience } from "@/components/shop/ShopExperience";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Tienda",
  description: "Merchandising y música de Frantana.",
});

export default async function TiendaPage() {
  const products = await getProducts();

  // Featured primero, luego el resto — un solo rail denso
  const ordered = [
    ...products.filter((p) => p.featured),
    ...products.filter((p) => !p.featured),
  ];

  return (
    <div className="tienda pt-[var(--header-h)]">
      <ShopExperience>
        <header className="tienda__intro">
          <div className="tienda__intro-copy">
            <p className="tienda__index" data-shop-intro>
              Tienda
            </p>
            <h1 className="tienda__title" data-shop-intro>
              Piezas FRANTANA
            </h1>
            <p className="tienda__lede" data-shop-intro>
              Merch, música y objetos de la noche.
            </p>
          </div>
          <div className="tienda__intro-meta" data-shop-intro>
            <Link href="/tienda/carrito" className="tienda__bag-link">
              Carrito →
            </Link>
          </div>
        </header>

        <section className="tienda__catalog tienda__catalog--rail" aria-label="Catálogo">
          {ordered.length > 0 ? (
            <div
              className={`tienda__catalog-grid tienda__catalog-grid--rail tienda__catalog-grid--n${Math.min(ordered.length, 4)}`}
            >
              {ordered.map((product, i) => (
                <ShopProductCard
                  key={product.id}
                  product={product}
                  variant="catalog"
                  priority={i < 2}
                />
              ))}
            </div>
          ) : (
            <p className="tienda__empty">Aún no hay productos publicados.</p>
          )}
        </section>
      </ShopExperience>
    </div>
  );
}
