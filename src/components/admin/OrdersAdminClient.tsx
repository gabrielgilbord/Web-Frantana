"use client";

import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/shop/format";

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "Borrador",
  pending_payment: "Pendiente",
  paid: "Pagado",
  fulfilled: "Enviado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

type OrderFilter =
  | "all"
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled";

function statusClass(status: OrderStatus) {
  if (status === "paid") return "admin-status--paid";
  if (status === "fulfilled") return "admin-status--fulfilled";
  if (status === "cancelled" || status === "refunded") {
    return "admin-status--cancelled";
  }
  if (status === "pending_payment" || status === "draft") {
    return "admin-status--pending";
  }
  return "";
}

function matchesFilter(o: Order, filter: OrderFilter) {
  if (filter === "all") return true;
  if (filter === "pending") {
    return o.status === "pending_payment" || o.status === "draft";
  }
  return o.status === filter;
}

export function OrdersAdminClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<Order | null>(
    initialOrders[0] ?? null
  );
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => orders.filter((o) => matchesFilter(o, filter)),
    [orders, filter]
  );

  async function refresh() {
    const res = await fetch("/api/orders");
    if (!res.ok) return;
    const data = await res.json();
    const nextOrders = (data.orders as Order[]) ?? [];
    setOrders(nextOrders);
    if (selected) {
      const next = nextOrders.find((o) => o.id === selected.id);
      setSelected(next ?? null);
    }
  }

  async function setStatus(status: OrderStatus) {
    if (!selected) return;
    setMessage(null);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status }),
    });
    if (!res.ok) {
      setError("No se pudo actualizar el estado");
      return;
    }
    setMessage("Estado actualizado");
    await refresh();
  }

  return (
    <div className="admin-page admin-page--split">
      <div className="admin-orders-col">
        <div className="admin-page__header">
          <div>
            <h1 className="admin-page__title">Pedidos</h1>
            <p className="admin-page__lede">{orders.length} en total</p>
          </div>
        </div>

        <div className="admin-chips" role="tablist" aria-label="Filtrar pedidos">
          {(
            [
              ["all", "Todos"],
              ["pending", "Pendientes"],
              ["paid", "Pagados"],
              ["fulfilled", "Enviados"],
              ["cancelled", "Cancelados"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={`admin-chip${filter === id ? " is-active" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {!filtered.length ? (
          <p className="admin-empty">
            {orders.length
              ? "Ningún pedido en este filtro."
              : "Todavía no hay pedidos."}
          </p>
        ) : (
          <ul className="admin-list">
            {filtered.map((o) => {
              const itemsCount = o.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    className={`admin-list-row admin-list-row--order${
                      selected?.id === o.id ? " is-active" : ""
                    }`}
                    onClick={() => {
                      setSelected(o);
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    <div className="admin-list-row__top">
                      <p className="admin-list-row__title">
                        #{o.id.slice(0, 8)}
                      </p>
                      <span
                        className={`admin-status ${statusClass(o.status)}`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </div>
                    <p className="admin-list-row__meta">
                      {new Date(o.createdAt).toLocaleString("es-ES")}
                    </p>
                    <div className="admin-list-row__stats">
                      <span>
                        <strong>{itemsCount}</strong>{" "}
                        {itemsCount === 1 ? "ítem" : "ítems"}
                      </span>
                      <span>
                        <strong>
                          {formatPrice(o.totalCents, o.currency)}
                        </strong>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="admin-section">
        <h2 className="admin-section__title">Detalle</h2>
        {!selected ? (
          <p className="admin-empty">Selecciona un pedido.</p>
        ) : (
          <div className="admin-order-detail">
            <div className="admin-order-detail__grid">
              <div>
                <span className="admin-order-detail__label">ID</span>
                <p className="admin-order-detail__value">{selected.id}</p>
              </div>
              <div>
                <span className="admin-order-detail__label">Email</span>
                <p className="admin-order-detail__value">{selected.email}</p>
              </div>
              <div>
                <span className="admin-order-detail__label">Estado</span>
                <p className="admin-order-detail__value">
                  <span
                    className={`admin-status ${statusClass(selected.status)}`}
                  >
                    {STATUS_LABEL[selected.status]}
                  </span>
                </p>
              </div>
              <div>
                <span className="admin-order-detail__label">Total</span>
                <p className="admin-order-detail__value">
                  {formatPrice(selected.totalCents, selected.currency)}
                </p>
              </div>
              <div>
                <span className="admin-order-detail__label">Fecha</span>
                <p className="admin-order-detail__value">
                  {new Date(selected.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
              {selected.stripeCheckoutSessionId && (
                <div>
                  <span className="admin-order-detail__label">
                    Stripe session
                  </span>
                  <p className="admin-order-detail__value">
                    {selected.stripeCheckoutSessionId}
                  </p>
                </div>
              )}
              {selected.stripePaymentIntentId && (
                <div>
                  <span className="admin-order-detail__label">
                    Payment intent
                  </span>
                  <p className="admin-order-detail__value">
                    {selected.stripePaymentIntentId}
                  </p>
                </div>
              )}
            </div>

            <div>
              <span className="admin-order-detail__label">Ítems</span>
              <ul className="admin-order-items">
                {selected.items.map((item) => (
                  <li key={item.variantId}>
                    <span>
                      {item.productName} · {item.variantName} × {item.quantity}
                    </span>
                    <span>
                      {formatPrice(
                        item.unitPriceCents * item.quantity,
                        selected.currency
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="admin-form__actions">
              <button
                type="button"
                className="admin-btn admin-btn--ember"
                onClick={() => setStatus("paid")}
              >
                Marcar pagado
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => setStatus("fulfilled")}
              >
                Marcar enviado
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={() => setStatus("cancelled")}
              >
                Cancelar
              </button>
            </div>

            {error && (
              <p role="alert" className="admin-feedback admin-feedback--error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="admin-feedback admin-feedback--ok">
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
