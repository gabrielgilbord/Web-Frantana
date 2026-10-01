"use client";

import { useMemo, useState } from "react";
import type { BookingRequest } from "@/types";

const STATUS_LABEL: Record<BookingRequest["status"], string> = {
  new: "Nueva — pendiente de revisión",
  read: "En revisión",
  replied: "Hay respuesta del equipo",
  archived: "Archivada",
};

export function BookingTrackClient({
  initial,
}: {
  initial: BookingRequest;
}) {
  const [booking, setBooking] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => `${booking.eventType} · ${booking.city}`,
    [booking.city, booking.eventType]
  );

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: booking.accessToken,
          body: text.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar");
        return;
      }
      setBooking((prev) => ({
        ...prev,
        status: data.booking.status,
        messages: data.booking.messages,
        updatedAt: data.booking.updatedAt,
      }));
      setText("");
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="booking-track">
      <header className="booking-track__head">
        <p className="booking-track__eyebrow">Seguimiento</p>
        <h1 className="booking-track__title">Tu solicitud</h1>
        <p className="booking-track__status">{STATUS_LABEL[booking.status]}</p>
        <p className="booking-track__meta">
          {title}
          {booking.preferredDate ? ` · ${booking.preferredDate}` : ""}
          {booking.preferredTime ? ` · ${booking.preferredTime}` : ""}
        </p>
        <p className="booking-track__review">
          Cada mensaje lo revisa el equipo de Frantana a mano. No hay respuesta
          automática.
        </p>
      </header>

      <ol className="booking-track__thread">
        {booking.messages.map((m) => (
          <li
            key={m.id}
            className={
              m.from === "admin"
                ? "booking-track__bubble is-admin"
                : "booking-track__bubble is-client"
            }
          >
            <p className="booking-track__who">
              {m.from === "admin" ? "Frantana" : "Tú"}
            </p>
            <p className="booking-track__body">{m.body}</p>
            <time dateTime={m.createdAt}>
              {new Date(m.createdAt).toLocaleString("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </li>
        ))}
      </ol>

      <div className="booking-track__composer">
        <label className="booking-track__label" htmlFor="track-msg">
          Escribe al equipo
        </label>
        <textarea
          id="track-msg"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dudas, cambios de fecha, detalles del evento…"
        />
        {error ? <p className="booking-form__error">{error}</p> : null}
        <button
          type="button"
          className="booking-form__submit"
          disabled={busy || !text.trim()}
          onClick={send}
        >
          <span>{busy ? "Enviando…" : "Enviar mensaje"}</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
