"use client";

import { useMemo, useState } from "react";
import type { BookingRequest } from "@/types";

const STATUS_LABEL: Record<BookingRequest["status"], string> = {
  new: "Nueva — pendiente de revisión",
  read: "En revisión",
  replied: "Hay respuesta del equipo",
  confirmed: "Confirmada — conversación abierta",
  rejected: "No disponible / rechazada",
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
  const [notice, setNotice] = useState<string | null>(null);

  const title = useMemo(
    () => `${booking.eventType} · ${booking.city}`,
    [booking.city, booking.eventType]
  );

  const canChat =
    booking.status !== "rejected" && booking.status !== "archived";
  const isConfirmed = booking.status === "confirmed";

  async function send() {
    if (!text.trim() || !canChat) return;
    setBusy(true);
    setError(null);
    setNotice(null);
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
      if (data.warning) setNotice(data.warning);
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
        <h1 className="booking-track__title">
          {isConfirmed ? "Tu reserva confirmada" : "Tu solicitud"}
        </h1>
        <p className="booking-track__status">{STATUS_LABEL[booking.status]}</p>
        <p className="booking-track__meta">
          {title}
          {booking.preferredDate ? ` · ${booking.preferredDate}` : ""}
          {booking.preferredTime ? ` · ${booking.preferredTime}` : ""}
        </p>
        {isConfirmed ? (
          <p className="booking-track__review">
            La fecha está cerrada. Usa este chat para logística, horarios,
            sonido o cualquier detalle con Frantana. Cada mensaje avisa por
            correo.
          </p>
        ) : canChat ? (
          <p className="booking-track__review">
            Cada mensaje lo revisa el equipo de Frantana a mano. No hay respuesta
            automática.
          </p>
        ) : (
          <p className="booking-track__review">
            Esta solicitud ya no admite nuevos mensajes. Si quieres otra fecha,
            vuelve a solicitar una reserva.
          </p>
        )}
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

      {canChat ? (
        <div className="booking-track__composer">
          <label className="booking-track__label" htmlFor="track-msg">
            {isConfirmed ? "Escribe a Frantana" : "Escribe al equipo"}
          </label>
          <textarea
            id="track-msg"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isConfirmed
                ? "Horario de sonido, acceso, catering, cambios…"
                : "Dudas, cambios de fecha, detalles del evento…"
            }
          />
          {error ? <p className="booking-form__error">{error}</p> : null}
          {notice ? <p className="booking-track__review">{notice}</p> : null}
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
      ) : null}
    </div>
  );
}
