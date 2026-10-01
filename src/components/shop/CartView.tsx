"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/shop/format";

export function CartView() {
  const {
    lines,
    count,
    subtotalCents,
    currency,
    setQuantity,
    removeLine,
    clear,
    ready,
  } = useCart();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d) => setStripeReady(Boolean(d.configured)))
      .catch(() => setStripeReady(false));
  }, []);

  async function checkout() {
    setError(null);
    if (!email.trim()) {
      setError("Introduce un email para el recibo.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          lines: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar el pago.");
        setBusy(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Stripe no devolvió URL de checkout.");
    } catch {
      setError("Error de red al crear el checkout.");
    }
    setBusy(false);
  }

  if (!ready) {
    return <p className="store-cart__loading">Cargando carrito…</p>;
  }

  if (!lines.length) {
    return (
      <div className="store-cart store-cart--empty">
        <div className="store-cart__empty">
          <p className="store-cart__empty-kicker">Carrito</p>
          <h2 className="store-cart__empty-title">Todavía no hay piezas</h2>
          <p className="store-cart__empty-copy">
            Explora la tienda oficial y añade lo que quieras llevarte.
          </p>
          {cancelled && (
            <p className="store-cart__cancelled" role="status">
              Pago cancelado. Puedes volver a intentarlo cuando quieras.
            </p>
          )}
          <Link href="/tienda" className="store-cart__empty-link">
            Ir a la tienda →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="store-cart">
      {cancelled && (
        <p className="store-cart__cancelled" role="status">
          Pago cancelado. Tu carrito sigue aquí.
        </p>
      )}

      <div className="store-cart__layout">
        <section className="store-cart__main" aria-label="Piezas en el carrito">
          <p className="store-cart__count">
            {count} {count === 1 ? "pieza" : "piezas"}
          </p>
          <ul className="store-cart__list">
            {lines.map((line) => (
              <li key={line.variantId} className="store-cart__line">
                <Link
                  href={`/tienda/${line.productSlug}`}
                  className="store-cart__thumb"
                >
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="store-cart__info">
                  <Link
                    href={`/tienda/${line.productSlug}`}
                    className="store-cart__name"
                  >
                    {line.productName}
                  </Link>
                  <p className="store-cart__variant">{line.variantName}</p>
                  <p className="store-cart__unit">
                    {formatPrice(line.priceCents, line.currency)}
                  </p>
                  <button
                    type="button"
                    className="store-cart__remove"
                    onClick={() => removeLine(line.variantId)}
                  >
                    Quitar
                  </button>
                </div>
                <div className="store-cart__controls">
                  <div className="store-cart__qty">
                    <button
                      type="button"
                      aria-label="Menos"
                      onClick={() =>
                        setQuantity(line.variantId, line.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Más"
                      onClick={() =>
                        setQuantity(line.variantId, line.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="store-cart__line-total">
                    {formatPrice(
                      line.priceCents * line.quantity,
                      line.currency
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="store-cart__aside" aria-label="Resumen">
          <p className="store-cart__aside-kicker">Resumen</p>
          <p className="store-cart__subtotal">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents, currency)}</span>
          </p>
          <p className="store-cart__aside-note">
            Envío e impuestos se confirman en el checkout.
          </p>

          <label className="store-cart__email">
            <span>Email del recibo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </label>

          {error && (
            <p className="store-cart__error" role="alert">
              {error}
            </p>
          )}

          {stripeReady ? (
            <button
              type="button"
              className="store-cart__checkout"
              disabled={busy}
              onClick={checkout}
            >
              {busy ? "Redirigiendo…" : "Pagar con Stripe →"}
            </button>
          ) : (
            <p className="store-cart__demo" role="status">
              El carrito está listo. El pago se activará al configurar las claves
              Stripe.
            </p>
          )}

          <div className="store-cart__aside-actions">
            <Link href="/tienda" className="store-cart__continue">
              Seguir comprando →
            </Link>
            <button type="button" className="store-cart__clear" onClick={clear}>
              Vaciar carrito
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
