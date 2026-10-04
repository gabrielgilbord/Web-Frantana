"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/shop/format";

export function CartMiniModal() {
  const {
    bagOpen,
    closeBag,
    lines,
    count,
    subtotalCents,
    currency,
    setQuantity,
    removeLine,
    ready,
  } = useCart();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bagOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBag();
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("bag-modal-open");
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("bag-modal-open");
      window.clearTimeout(t);
    };
  }, [bagOpen, closeBag]);

  return (
    <div
      className={bagOpen ? "bag-modal is-open" : "bag-modal"}
      role="presentation"
      aria-hidden={!bagOpen}
    >
      <button
        type="button"
        className="bag-modal__scrim"
        aria-label="Cerrar carrito"
        tabIndex={bagOpen ? 0 : -1}
        onClick={closeBag}
      />
      <div
        ref={panelRef}
        className="bag-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="bag-modal__head">
          <div>
            <p className="bag-modal__kicker">Carrito</p>
            <h2 id={titleId} className="bag-modal__title">
              {ready
                ? count > 0
                  ? `${count} ${count === 1 ? "pieza" : "piezas"}`
                  : "Vacía"
                : "…"}
            </h2>
          </div>
          <button
            type="button"
            className="bag-modal__close"
            onClick={closeBag}
            aria-label="Cerrar"
            tabIndex={bagOpen ? 0 : -1}
          >
            ✕
          </button>
        </header>

        {!lines.length ? (
          <div className="bag-modal__empty">
            <p>Todavía no hay piezas.</p>
            <Link
              href="/tienda"
              className="bag-modal__link"
              onClick={closeBag}
              tabIndex={bagOpen ? 0 : -1}
            >
              Ir a la tienda →
            </Link>
          </div>
        ) : (
          <>
            <ul className="bag-modal__list">
              {lines.map((line) => (
                <li key={line.variantId} className="bag-modal__line">
                  <div className="bag-modal__thumb">
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover"
                        style={{ objectPosition: "50% 12%" }}
                      />
                    ) : null}
                  </div>
                  <div className="bag-modal__info">
                    <p className="bag-modal__name">{line.productName}</p>
                    <p className="bag-modal__meta">
                      {line.variantName} ·{" "}
                      {formatPrice(line.priceCents, line.currency)}
                    </p>
                    <div className="bag-modal__row">
                      <div className="bag-modal__qty">
                        <button
                          type="button"
                          aria-label="Menos"
                          tabIndex={bagOpen ? 0 : -1}
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
                          tabIndex={bagOpen ? 0 : -1}
                          onClick={() =>
                            setQuantity(line.variantId, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="bag-modal__remove"
                        tabIndex={bagOpen ? 0 : -1}
                        onClick={() => removeLine(line.variantId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <p className="bag-modal__line-total">
                    {formatPrice(
                      line.priceCents * line.quantity,
                      line.currency
                    )}
                  </p>
                </li>
              ))}
            </ul>

            <footer className="bag-modal__foot">
              <p className="bag-modal__subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents, currency)}</span>
              </p>
              <Link
                href="/tienda/carrito"
                className="bag-modal__checkout"
                onClick={closeBag}
                tabIndex={bagOpen ? 0 : -1}
              >
                Ver carrito y pagar →
              </Link>
              <Link
                href="/tienda"
                className="bag-modal__continue"
                onClick={closeBag}
                tabIndex={bagOpen ? 0 : -1}
              >
                Seguir comprando
              </Link>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
