"use client";

import { useMemo, useState } from "react";
import type { BookingRequest, BookingStatus } from "@/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "Nueva",
  read: "Leída",
  replied: "Respondida",
  archived: "Archivada",
};

const EVENT_LABEL: Record<BookingRequest["eventType"], string> = {
  privado: "Privado",
  boda: "Boda",
  corporativo: "Corporativo",
  fiesta: "Fiesta",
  otro: "Otro",
};

export function BookingsAdminClient({
  initialBookings,
}: {
  initialBookings: BookingRequest[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const visible = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  async function setStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? (data.booking as BookingRequest) : b))
      );
    } finally {
      setBusyId(null);
    }
  }

  async function reply(id: string) {
    const body = (drafts[id] ?? "").trim();
    if (!body) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/booking/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, body }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? (data.booking as BookingRequest) : b))
      );
      setDrafts((prev) => ({ ...prev, [id]: "" }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">Booking</p>
          <h1 className="admin-page__title">Reservas / contratación</h1>
          <p className="admin-page__lede">
            {bookings.length} solicitud{bookings.length === 1 ? "" : "es"} ·
            responde aquí; el cliente sigue el hilo con su enlace privado
          </p>
        </div>
      </header>

      <div className="admin-toolbar" style={{ marginBottom: "1rem" }}>
        {(
          [
            ["all", "Todas"],
            ["new", "Nuevas"],
            ["read", "Leídas"],
            ["replied", "Respondidas"],
            ["archived", "Archivadas"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              filter === value
                ? "admin-btn admin-btn--ghost is-active"
                : "admin-btn admin-btn--ghost"
            }
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="admin-empty">No hay solicitudes en este filtro.</p>
      ) : (
        <ul className="admin-booking-list">
          {visible.map((b) => (
            <li key={b.id} className="admin-booking-card">
              <div className="admin-booking-card__top">
                <div>
                  <p className="admin-booking-card__name">{b.name}</p>
                  <p className="admin-booking-card__meta">
                    {EVENT_LABEL[b.eventType]} · {b.city}
                    {b.preferredDate ? ` · ${b.preferredDate}` : ""}
                    {b.preferredTime ? ` · ${b.preferredTime}` : ""}
                  </p>
                </div>
                <span
                  className={`admin-status admin-status--${b.status === "new" ? "published" : "draft"}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
              </div>

              <p className="admin-booking-card__message">{b.message}</p>

              <div className="admin-booking-card__contacts">
                <a href={`mailto:${b.email}`}>{b.email}</a>
                {b.phone ? <a href={`tel:${b.phone}`}>{b.phone}</a> : null}
                {b.venue ? <span>{b.venue}</span> : null}
                {b.accessToken ? (
                  <a
                    href={`/reservas/seguimiento/${b.accessToken}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver seguimiento
                  </a>
                ) : null}
              </div>

              <div className="admin-booking-thread">
                {(b.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.from === "admin"
                        ? "admin-booking-thread__item is-admin"
                        : "admin-booking-thread__item"
                    }
                  >
                    <strong>{m.from === "admin" ? "Tú" : b.name}</strong>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>

              <div className="admin-booking-reply">
                <textarea
                  rows={3}
                  placeholder="Responder al cliente…"
                  value={drafts[b.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--ember"
                  disabled={busyId === b.id || !(drafts[b.id] ?? "").trim()}
                  onClick={() => reply(b.id)}
                >
                  Enviar respuesta
                </button>
              </div>

              <div className="admin-booking-card__actions">
                {(
                  [
                    ["read", "Marcar leída"],
                    ["replied", "Respondida"],
                    ["archived", "Archivar"],
                    ["new", "Reabrir"],
                  ] as const
                ).map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={busyId === b.id || b.status === status}
                    onClick={() => setStatus(b.id, status)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
