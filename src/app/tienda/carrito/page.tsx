import { Suspense } from "react";
import { CartView } from "@/components/shop/CartView";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Carrito",
  description: "Tu selección en la tienda FRANTANA.",
});

export default function CarritoPage() {
  return (
    <div className="tienda pt-[var(--header-h)]">
      <header className="tienda__hero store-cart-page__hero">
        <p className="tienda__index">FRANTANA Official</p>
        <h1 className="tienda__title">Carrito</h1>
        <p className="tienda__lede">
          Tu selección. Piezas listas para llevarse.
        </p>
      </header>
      <section className="store-cart-page">
        <Suspense fallback={<p className="store-cart__loading">Cargando…</p>}>
          <CartView />
        </Suspense>
      </section>
    </div>
  );
}
