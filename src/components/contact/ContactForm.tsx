"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import Link from "next/link";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "contratacion",
  message: "",
};

const SUBJECTS = [
  { value: "contratacion", label: "Contratación / evento" },
  { value: "prensa", label: "Prensa" },
  { value: "otro", label: "Otro" },
] as const;

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }
      setStatus("ok");
      setForm(INITIAL);
    } catch {
      setStatus("error");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  if (status === "ok") {
    return (
      <div className="contact-form contact-form--ok" role="status">
        <p className="contact-form__ok-eyebrow">Enviado</p>
        <p className="contact-form__ok-title">Mensaje recibido.</p>
        <p className="contact-form__ok-body">
          Te responderemos al correo que has dejado. Si es para un evento con
          fecha concreta, también puedes mirar disponibilidad en reservas.
        </p>
        <Link href="/reservas" className="contact-form__cta">
          Ver calendario de reservas →
        </Link>
        <button
          type="button"
          className="contact-form__again"
          onClick={() => setStatus("idle")}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <p className="contact-form__eyebrow">Escríbenos</p>
      <h2 className="contact-form__title">Mensaje directo</h2>
      <p className="contact-form__lede">
        Nombre, datos y mensaje. Llega a la oficina de Frantana para
        contrataciones y consultas.
      </p>

      <div className="contact-form__grid">
        <label className="contact-form__field">
          <span>Nombre *</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        <label className="contact-form__field">
          <span>Email *</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="tu@email.com"
          />
        </label>
        <label className="contact-form__field">
          <span>Teléfono</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+34 …"
          />
        </label>
        <label className="contact-form__field">
          <span>Asunto *</span>
          <select
            name="subject"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="contact-form__field contact-form__field--wide">
          <span>Mensaje *</span>
          <textarea
            required
            name="message"
            rows={5}
            minLength={10}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Cuéntanos el motivo del contacto, fecha orientativa, ciudad…"
          />
        </label>
      </div>

      {error ? <p className="contact-form__error">{error}</p> : null}

      <button
        type="submit"
        className={clsx(
          "contact-form__submit",
          status === "loading" && "is-loading"
        )}
        disabled={status === "loading"}
      >
        <span>{status === "loading" ? "Enviando…" : "Enviar mensaje"}</span>
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
