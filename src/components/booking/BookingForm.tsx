"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import clsx from "clsx";
import gsap from "gsap";
import { AdminTimePicker } from "@/components/admin/ui/AdminTimePicker";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { localTodayISO } from "@/lib/concerts/date";
import type { OccupancyDay } from "@/types";

const EVENT_TYPES = [
  { value: "privado", label: "Privado" },
  { value: "boda", label: "Boda" },
  { value: "corporativo", label: "Corporativo" },
  { value: "fiesta", label: "Fiesta" },
  { value: "otro", label: "Otro" },
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  eventType: (typeof EVENT_TYPES)[number]["value"];
  preferredDate: string;
  preferredTime: string;
  city: string;
  venue: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  eventType: "privado",
  preferredDate: "",
  preferredTime: "",
  city: "",
  venue: "",
  message: "",
};

export function BookingForm({
  occupancy = [],
}: {
  occupancy?: OccupancyDay[];
}) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLFormElement>(null);
  const today = localTodayISO();
  const busySet = new Set(occupancy.map((d) => d.date));

  const [trackUrl, setTrackUrl] = useState<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || status === "ok") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const items = root.querySelectorAll<HTMLElement>("[data-booking-field]");
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.045,
        ease: "power3.out",
        delay: 0.12,
      }
    );
  }, [status]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    if (form.preferredDate && busySet.has(form.preferredDate)) {
      setStatus("error");
      setError("Esa fecha ya está ocupada. Elige otro día en el calendario.");
      return;
    }
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "No se pudo enviar la solicitud.");
        return;
      }
      const token = data.booking?.accessToken as string | undefined;
      if (token) {
        setTrackUrl(`/reservas/seguimiento/${token}`);
      }
      setStatus("ok");
      setForm(INITIAL);
    } catch {
      setStatus("error");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (status === "ok") {
    return (
      <div className="booking-form booking-form--ok" role="status">
        <p className="booking-form__ok-eyebrow">Enviado</p>
        <p className="booking-form__ok-title">Ya lo tenemos.</p>
        <p className="booking-form__ok-body">
          Un miembro del equipo revisará tu propuesta a mano. Guarda el enlace de
          seguimiento para ver respuestas y escribirnos desde aquí — sin
          depender del correo.
        </p>
        {trackUrl ? (
          <a href={trackUrl} className="booking-form__track-link">
            Abrir seguimiento de esta reserva →
          </a>
        ) : null}
        <button
          type="button"
          className="booking-form__again"
          onClick={() => {
            setStatus("idle");
            setTrackUrl(null);
          }}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form
      ref={rootRef}
      className="booking-form"
      onSubmit={onSubmit}
      noValidate
    >
      <div data-booking-field>
        <AvailabilityCalendar
          occupancy={occupancy}
          value={form.preferredDate}
          onChange={(iso) => set("preferredDate", iso)}
          minDate={today}
        />
        {form.preferredDate ? (
          <p className="booking-form__picked">
            Fecha elegida:{" "}
            <strong>
              {new Date(`${form.preferredDate}T12:00:00`).toLocaleDateString(
                "es-ES",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>
          </p>
        ) : (
          <p className="booking-form__picked booking-form__picked--hint">
            Toca un día libre para continuar.
          </p>
        )}
      </div>

      <div className="booking-form__grid">
        <label className="booking-form__field" data-booking-field>
          <span>Nombre *</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>

        <label className="booking-form__field" data-booking-field>
          <span>Email *</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>

        <label className="booking-form__field" data-booking-field>
          <span>Teléfono</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>

        <label className="booking-form__field" data-booking-field>
          <span>Ciudad *</span>
          <input
            required
            name="city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </label>

        <div
          className="booking-form__field booking-form__field--wide"
          data-booking-field
        >
          <span className="booking-form__chips-label">Tipo de evento *</span>
          <div className="booking-form__chips" role="radiogroup" aria-label="Tipo de evento">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={form.eventType === t.value}
                className={clsx(
                  "booking-form__chip",
                  form.eventType === t.value && "is-active"
                )}
                onClick={() => set("eventType", t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-form__field" data-booking-field>
          <AdminTimePicker
            label="Hora orientativa"
            value={form.preferredTime}
            onChange={(hhmm) => set("preferredTime", hhmm)}
            className="booking-picker"
          />
        </div>

        <label className="booking-form__field" data-booking-field>
          <span>Lugar / recinto</span>
          <input
            name="venue"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="Sala, salón, plaza…"
          />
        </label>

        <label className="booking-form__field booking-form__field--wide" data-booking-field>
          <span>Cuéntanos el evento *</span>
          <textarea
            required
            name="message"
            rows={5}
            minLength={10}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Formato (acústico / banda), duración, aforo, ambiente…"
          />
        </label>
      </div>

      <input type="hidden" name="preferredDate" value={form.preferredDate} required readOnly />

      {error ? <p className="booking-form__error">{error}</p> : null}

      <button
        type="submit"
        className={clsx(
          "booking-form__submit",
          status === "loading" && "is-loading"
        )}
        disabled={status === "loading" || !form.preferredDate}
        data-booking-field
      >
        <span>{status === "loading" ? "Enviando…" : "Solicitar fecha"}</span>
        <span aria-hidden>→</span>
      </button>

      <p className="booking-form__note booking-form__note--accent" role="note">
        <strong>Revisión personal.</strong> No es una reserva automática: alguien
        del equipo lee cada solicitud y responde por el seguimiento de la
        reserva. Los días marcados ya están ocupados (conciertos públicos o
        fiestas privadas sin detalle).
      </p>
    </form>
  );
}
