"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { Concert, TicketStatus } from "@/types";
import { AdminDatePicker } from "@/components/admin/ui/AdminDatePicker";
import { AdminTimePicker } from "@/components/admin/ui/AdminTimePicker";
import {
  formatCoords,
  parseGoogleMapsUrl,
} from "@/lib/maps/parse-google-maps-url";

const STATUSES: TicketStatus[] = [
  "available",
  "limited",
  "sold_out",
  "free",
  "cancelled",
  "tba",
];

const STATUS_LABEL: Record<TicketStatus, string> = {
  available: "Disponibles",
  limited: "Limitadas",
  sold_out: "Agotadas",
  free: "Gratis",
  cancelled: "Cancelado",
  tba: "Por confirmar",
};

const empty = {
  title: "",
  date: "",
  time: "",
  city: "",
  venue: "",
  lat: "",
  lng: "",
  mapsUrl: "",
  image: "",
  ticketUrl: "",
  ticketStatus: "tba" as TicketStatus,
  published: false,
  blocksCalendar: true,
  notes: "",
};

function formatConcertDate(date: string) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { day: "—", month: "—" };
  }
  return {
    day: d.toLocaleDateString("es-ES", { day: "2-digit" }),
    month: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
  };
}

export function ConcertsAdminClient({
  initialConcerts,
}: {
  initialConcerts: Concert[];
}) {
  const [concerts, setConcerts] = useState(initialConcerts);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvingMaps, setResolvingMaps] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return concerts;
    return concerts.filter((c) => c.title.toLowerCase().includes(q));
  }, [concerts, query]);

  const hasCoords = Boolean(form.lat && form.lng);
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.lng) - 0.02}%2C${Number(form.lat) - 0.015}%2C${Number(form.lng) + 0.02}%2C${Number(form.lat) + 0.015}&layer=mapnik&marker=${form.lat}%2C${form.lng}`
    : null;
  const mapLink = hasCoords
    ? `https://www.google.com/maps?q=${form.lat},${form.lng}`
    : null;

  async function refresh() {
    const res = await fetch("/api/concerts");
    if (!res.ok) return;
    const data = await res.json();
    setConcerts(data.concerts ?? []);
  }

  function startCreate() {
    setEditingId(null);
    setForm(empty);
    setError(null);
    setMessage(null);
    setMode("edit");
  }

  function edit(c: Concert) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      date: c.date,
      time: c.time ?? "",
      city: c.city,
      venue: c.venue,
      lat: c.lat != null ? String(c.lat) : "",
      lng: c.lng != null ? String(c.lng) : "",
      mapsUrl:
        c.lat != null && c.lng != null
          ? `https://www.google.com/maps?q=${c.lat},${c.lng}`
          : "",
      image: c.image ?? "",
      ticketUrl: c.ticketUrl ?? "",
      ticketStatus: c.ticketStatus,
      published: c.published,
      blocksCalendar: c.blocksCalendar ?? true,
      notes: c.notes ?? "",
    });
    setError(null);
    setMessage(null);
    setMode("edit");
  }

  function backToList() {
    setMode("list");
    setEditingId(null);
    setForm(empty);
    setError(null);
    setMessage(null);
  }

  async function applyMapsUrl(url: string) {
    const trimmed = url.trim();
    setForm((f) => ({ ...f, mapsUrl: trimmed }));
    if (!trimmed) {
      setForm((f) => ({ ...f, mapsUrl: "", lat: "", lng: "" }));
      return;
    }

    const local = parseGoogleMapsUrl(trimmed);
    if (local) {
      setForm((f) => ({
        ...f,
        mapsUrl: trimmed,
        lat: String(local.lat),
        lng: String(local.lng),
      }));
      setError(null);
      return;
    }

    const looksShort =
      /maps\.app\.goo\.gl|goo\.gl\/maps|g\.page/i.test(trimmed);
    if (!looksShort) {
      setError(
        "No se leyeron coordenadas de ese enlace. Usa Compartir → Copiar enlace en Google Maps."
      );
      return;
    }

    setResolvingMaps(true);
    setError(null);
    try {
      const res = await fetch("/api/maps/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo resolver el enlace de Maps");
        return;
      }
      setForm((f) => ({
        ...f,
        mapsUrl: data.resolvedUrl || trimmed,
        lat: String(data.lat),
        lng: String(data.lng),
      }));
    } catch {
      setError("Error de red al resolver Google Maps");
    } finally {
      setResolvingMaps(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/concerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          title: form.title,
          date: form.date,
          time: form.time || null,
          city: form.city,
          venue: form.venue,
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
          image: form.image || null,
          ticketUrl: form.ticketUrl || null,
          ticketStatus: form.ticketStatus,
          published: form.published,
          blocksCalendar: form.blocksCalendar,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar");
        return;
      }
      setMessage(editingId ? "Concierto actualizado" : "Concierto creado");
      setForm(empty);
      setEditingId(null);
      setMode("list");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este concierto?")) return;
    await fetch(`/api/concerts?id=${id}`, { method: "DELETE" });
    if (editingId === id) backToList();
    await refresh();
  }

  async function togglePublish(c: Concert) {
    await fetch("/api/concerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, published: !c.published }),
    });
    await refresh();
  }

  if (mode === "edit") {
    return (
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <button
              type="button"
              className="admin-linkish admin-editor-back"
              onClick={backToList}
            >
              ← Volver al listado
            </button>
            <h1 className="admin-page__title">
              {editingId ? "Editar concierto" : "Nuevo concierto"}
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="admin-form">
          <section className="admin-section">
            <h2 className="admin-section__title">Identidad</h2>
            <div className="admin-section__body">
              <label className="admin-field">
                <span className="admin-field__label">Título</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="admin-field__input"
                />
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Fecha y hora</h2>
            <div className="admin-section__body admin-section__body--row">
              <AdminDatePicker
                value={form.date}
                onChange={(date) => setForm({ ...form, date })}
                required
              />
              <AdminTimePicker
                value={form.time}
                onChange={(time) => setForm({ ...form, time })}
              />
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Lugar</h2>
            <div className="admin-section__body">
              <label className="admin-field">
                <span className="admin-field__label">Ciudad</span>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="admin-field__input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Recinto</span>
                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  required
                  className="admin-field__input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">
                  Enlace de Google Maps
                </span>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="Pega aquí el enlace del sitio (Compartir → Copiar enlace)"
                  value={form.mapsUrl}
                  onChange={(e) =>
                    setForm({ ...form, mapsUrl: e.target.value })
                  }
                  onBlur={(e) => {
                    void applyMapsUrl(e.target.value);
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text) {
                      e.preventDefault();
                      void applyMapsUrl(text);
                    }
                  }}
                  className="admin-field__input"
                />
                <span className="admin-field__hint">
                  {resolvingMaps
                    ? "Resolviendo enlace…"
                    : hasCoords
                      ? `Ubicación: ${formatCoords(Number(form.lat), Number(form.lng))}`
                      : "No hace falta latitud/longitud — pega la URL y se guarda el pin automáticamente."}
                </span>
              </label>
              {hasCoords && (
                <button
                  type="button"
                  className="admin-linkish"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      mapsUrl: "",
                      lat: "",
                      lng: "",
                    }))
                  }
                >
                  Quitar ubicación del mapa
                </button>
              )}
              {mapSrc && mapLink && (
                <div>
                  <div className="admin-map-preview">
                    <iframe
                      title="Vista previa del mapa"
                      src={mapSrc}
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-map-preview__link"
                  >
                    Abrir en Google Maps →
                  </a>
                </div>
              )}
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Imagen</h2>
            <div className="admin-section__body">
              {form.image ? (
                <div className="admin-media-item">
                  <div className="admin-media-item__preview admin-media-item__preview--wide">
                    <Image
                      src={form.image}
                      alt=""
                      fill
                      sizes="640px"
                      className="object-cover"
                    />
                  </div>
                  <div className="admin-media-item__actions">
                    <button
                      type="button"
                      className="admin-linkish"
                      onClick={() => setForm({ ...form, image: "" })}
                    >
                      Quitar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <p className="admin-empty">
                  Sin imagen — se usará fallback de galería.
                </p>
              )}
              <label className="admin-upload admin-upload--lg">
                <span>
                  {uploading ? "Subiendo…" : "Subir imagen del concierto"}
                </span>
                <span className="admin-upload__hint">
                  JPEG, PNG, WebP o AVIF · toca para elegir
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploading(true);
                    setError(null);
                    try {
                      const body = new FormData();
                      body.append("file", file);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body,
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setError(data.error ?? "Error al subir");
                        return;
                      }
                      setForm((f) => ({ ...f, image: data.src }));
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Entradas</h2>
            <div className="admin-section__body">
              <label className="admin-field">
                <span className="admin-field__label">URL entradas</span>
                <input
                  value={form.ticketUrl}
                  onChange={(e) =>
                    setForm({ ...form, ticketUrl: e.target.value })
                  }
                  type="url"
                  className="admin-field__input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field__label">Estado entradas</span>
                <select
                  value={form.ticketStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ticketStatus: e.target.value as TicketStatus,
                    })
                  }
                  className="admin-field__input"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="admin-section__title">Publicación</h2>
            <div className="admin-section__body">
              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />
                <span className="admin-field__label">Publicado</span>
              </label>
              <label className="admin-field admin-field--row">
                <input
                  type="checkbox"
                  checked={form.blocksCalendar}
                  onChange={(e) =>
                    setForm({ ...form, blocksCalendar: e.target.checked })
                  }
                />
                <span className="admin-field__label">
                  Ocupa calendario de reservas
                </span>
              </label>
              <p className="admin-field__hint">
                Si no está publicado pero marca esta casilla, la fecha aparece
                ocupada en /reservas sin revelar el título (fiestas privadas).
              </p>
              <label className="admin-field">
                <span className="admin-field__label">Notas</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="admin-field__input admin-field__input--area"
                  rows={3}
                />
              </label>
            </div>
          </section>

          <div className="admin-sticky-actions">
            {(error || message) && (
              <div className="admin-sticky-actions__feedback">
                {error && (
                  <p
                    role="alert"
                    className="admin-feedback admin-feedback--error"
                  >
                    {error}
                  </p>
                )}
                {message && (
                  <p
                    role="status"
                    className="admin-feedback admin-feedback--ok"
                  >
                    {message}
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="admin-btn admin-btn--ember"
              disabled={saving}
            >
              {saving ? "Guardando…" : editingId ? "Guardar" : "Crear"}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={backToList}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Conciertos</h1>
          <p className="admin-page__lede">{concerts.length} en total</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ember"
          onClick={startCreate}
        >
          + Nuevo
        </button>
      </div>

      {concerts.length > 3 && (
        <div className="admin-page__toolbar">
          <input
            type="search"
            className="admin-search"
            placeholder="Buscar por título…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar conciertos por título"
          />
        </div>
      )}

      {!filtered.length ? (
        <p className="admin-empty">
          {concerts.length
            ? "Ningún concierto coincide con la búsqueda."
            : "No hay conciertos todavía."}
        </p>
      ) : (
        <ul className="admin-list">
          {filtered.map((c) => {
            const { day, month } = formatConcertDate(c.date);
            return (
              <li key={c.id} className="admin-list-row">
                <div className="admin-list-row__date" aria-hidden>
                  <span className="admin-list-row__date-day">{day}</span>
                  <span className="admin-list-row__date-month">{month}</span>
                </div>
                <div className="admin-list-row__main">
                  <p className="admin-list-row__title">{c.title}</p>
                  <p className="admin-list-row__meta">
                    {c.venue} · {c.city}
                    {c.time ? ` · ${c.time}` : ""}
                  </p>
                  <div className="admin-list-row__badges">
                    <span
                      className={`admin-status ${
                        c.published
                          ? "admin-status--published"
                          : "admin-status--draft"
                      }`}
                    >
                      {c.published ? "Publicado" : "Borrador"}
                    </span>
                    {(c.published || c.blocksCalendar) && (
                      <span className="admin-status admin-status--draft">
                        Calendario
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-list-row__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => edit(c)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => togglePublish(c)}
                  >
                    {c.published ? "Despublicar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => remove(c.id)}
                  >
                    Eliminar
                  </button>
                  {c.published && (
                    <a
                      href={`/conciertos/${c.id}`}
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
