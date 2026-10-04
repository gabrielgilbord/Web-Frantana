"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/shop/format";
import type { Product, ProductVariant } from "@/types";

const CAT_LABEL: Record<Product["category"], string> = {
  merch: "Merch",
  digital: "Digital",
  physical_music: "Música física",
};

const SHOP_PUBLIC =
  process.env.NEXT_PUBLIC_SHOP_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_SHOP_ENABLED === "1";

export function ProductPurchase({ product }: { product: Product }) {
  const { addLine } = useCart();
  const images = product.images.length
    ? product.images
    : ["/media/gallery/frantana/shot-01.jpg"];
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string>(
    product.variants[0]?.id ?? ""
  );
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d) => setStripeReady(Boolean(d.configured)))
      .catch(() => setStripeReady(false));
  }, []);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? null,
    [product.variants, variantId]
  );

  function onAdd() {
    if (!variant || variant.stock <= 0) return;
    addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      priceCents: variant.priceCents,
      currency: variant.currency,
      quantity: qty,
      image: images[0] ?? null,
    });
    setFeedback("Añadido al carrito");
    window.setTimeout(() => setFeedback(null), 2200);
  }

  return (
    <div className="store-product">
      <div className="store-product__gallery">
        <div className="store-product__hero-img">
          <Image
            src={images[activeImage]}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
            style={{ objectPosition: "50% 12%" }}
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="store-product__thumbs" role="tablist" aria-label="Imágenes">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === activeImage}
                className={
                  i === activeImage
                    ? "store-product__thumb is-active"
                    : "store-product__thumb"
                }
                onClick={() => setActiveImage(i)}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  style={{ objectPosition: "50% 12%" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="store-product__panel">
        <Link href="/tienda" className="store-product__back">
          ← Tienda
        </Link>
        <p className="store-product__cat">{CAT_LABEL[product.category]}</p>
        <h1 className="store-product__title">{product.name}</h1>
        {variant && (
          <p className="store-product__price">
            {formatPrice(variant.priceCents, variant.currency)}
          </p>
        )}
        <p className="store-product__desc">{product.description}</p>

        {product.variants.length > 0 && (
          <div className="store-product__variants">
            <p className="store-product__variants-label">Variante</p>
            <div className="store-product__size-row" role="list">
              {product.variants.map((v: ProductVariant) => {
                const out = v.stock <= 0;
                const selected = v.id === variantId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="listitem"
                    disabled={out}
                    className={
                      out
                        ? "store-product__size is-out"
                        : selected
                          ? "store-product__size is-selected"
                          : "store-product__size"
                    }
                    onClick={() => setVariantId(v.id)}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="store-product__qty">
          <label htmlFor="product-qty">Cantidad</label>
          <div className="store-product__qty-controls">
            <button
              type="button"
              aria-label="Menos"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span id="product-qty">{qty}</span>
            <button
              type="button"
              aria-label="Más"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="store-product__cta"
          disabled={!variant || variant.stock <= 0}
          onClick={onAdd}
        >
          {variant && variant.stock <= 0
            ? "Agotado"
            : feedback ?? "Añadir al carrito"}
        </button>

        {!SHOP_PUBLIC || !stripeReady ? (
          <p className="store-product__note">
            {!SHOP_PUBLIC
              ? "La tienda está en modo catálogo. Activa SHOP_ENABLED para abrir el checkout."
              : "Pago Stripe listo en código: falta configurar las claves en el entorno."}
          </p>
        ) : null}

        <Link href="/tienda/carrito" className="store-product__cart-link">
          Ver carrito →
        </Link>
      </div>
    </div>
  );
}
