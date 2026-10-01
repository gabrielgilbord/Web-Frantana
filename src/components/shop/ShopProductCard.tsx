"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/shop/format";
import type { Product, ProductVariant } from "@/types";

const CAT_LABEL: Record<Product["category"], string> = {
  merch: "Merch",
  digital: "Digital",
  physical_music: "Música física",
};

function lowestPrice(product: Product) {
  if (!product.variants.length) return null;
  return Math.min(...product.variants.map((v) => v.priceCents));
}

function totalStock(product: Product) {
  return product.variants.reduce((s, v) => s + v.stock, 0);
}

function defaultVariant(product: Product) {
  return product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null;
}

export type ShopPieceVariant = "hero" | "secondary" | "catalog";

export function ShopProductCard({
  product,
  variant = "catalog",
  priority = false,
}: {
  product: Product;
  variant?: ShopPieceVariant;
  priority?: boolean;
}) {
  const { addLine } = useCart();
  const [hover, setHover] = useState(false);
  const [variantId, setVariantId] = useState(() => defaultVariant(product)?.id ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);

  const primary = product.images[0] ?? "/media/gallery/frantana/01.jpg";
  const altImage = product.images[1] ?? primary;
  const hasAlt = altImage !== primary;
  const price = lowestPrice(product);
  const soldOut = totalStock(product) <= 0;
  const selected = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? null,
    [product.variants, variantId]
  );
  const hasSizes = product.variants.length > 1;

  const sizesAttr =
    variant === "hero"
      ? "(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 360px"
      : "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px";

  function onAdd(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selected || selected.stock <= 0) return;
    addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selected.id,
      variantName: selected.name,
      priceCents: selected.priceCents,
      currency: selected.currency,
      quantity: 1,
      image: primary,
    });
    setFeedback("Añadido");
    window.setTimeout(() => setFeedback(null), 1800);
  }

  return (
    <article
      className={`store-piece store-piece--${variant}`}
      data-shop-piece={variant}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/tienda/${product.slug}`} className="store-piece__media-link">
        <div className="store-piece__media">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes={sizesAttr}
            className={
              hover && hasAlt
                ? "store-piece__img store-piece__img--hide"
                : "store-piece__img"
            }
            priority={priority}
          />
          {hasAlt && (
            <Image
              src={altImage}
              alt=""
              fill
              sizes={sizesAttr}
              className={
                hover
                  ? "store-piece__img store-piece__img--alt store-piece__img--show"
                  : "store-piece__img store-piece__img--alt"
              }
              aria-hidden
            />
          )}
          {soldOut && <span className="store-piece__badge">Agotado</span>}
        </div>
      </Link>

      <div className="store-piece__meta">
        <span className="store-piece__cat">{CAT_LABEL[product.category]}</span>
        <Link href={`/tienda/${product.slug}`} className="store-piece__name-link">
          <h3 className="store-piece__name">{product.name}</h3>
        </Link>
        {price != null && (
          <p className="store-piece__price">
            {formatPrice(
              selected?.priceCents ?? price,
              selected?.currency ?? product.variants[0]?.currency
            )}
          </p>
        )}

        {hasSizes && (
          <div
            className="store-piece__sizes"
            role="list"
            aria-label={`Tallas de ${product.name}`}
          >
            {product.variants.map((v: ProductVariant) => {
              const out = v.stock <= 0;
              const isSelected = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="listitem"
                  disabled={out}
                  className={
                    out
                      ? "store-piece__size is-out"
                      : isSelected
                        ? "store-piece__size is-selected"
                        : "store-piece__size"
                  }
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.preventDefault();
                    setVariantId(v.id);
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          className="store-piece__add"
          disabled={!selected || selected.stock <= 0}
          onClick={onAdd}
        >
          {soldOut
            ? "Agotado"
            : feedback
              ? feedback
              : hasSizes
                ? "Añadir al carrito"
                : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
}
