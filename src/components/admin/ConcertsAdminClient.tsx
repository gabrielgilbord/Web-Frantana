"use client";

import { FormEvent, useState } from "react";
import type { Concert, TicketStatus } from "@/types";
import { Button } from "@/components/ui/Button";

const STATUSES: TicketStatus[] = [
  "available",
  "limited",
  "sold_out",
  "free",
  "cancelled",
  "tba",
];

const empty = {
  title: "",
  date: "",
  time: "",
  city: "",
  venue: "",
  ticketUrl: "",
  ticketStatus: "tba" as TicketStatus,
  published: false,
  notes: "",
};

export function ConcertsAdminClient({
  initialConcerts,
}: {
  initialConcerts: Concert[];
}) {
  const [concerts, setConcerts] = useState(initialConcerts);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/concerts");
    if (!res.ok) return;
    const data = await res.json();
    setConcerts(data.concerts ?? []);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch("/api/concerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId ?? undefined,
        ...form,
        time: form.time || null,
        ticketUrl: form.ticketUrl || null,
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
    await refresh();
  }

  function edit(c: Concert) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      date: c.date,
      time: c.time ?? "",
      city: c.city,
      venue: c.venue,
      ticketUrl: c.ticketUrl ?? "",
      ticketStatus: c.ticketStatus,
      published: c.published,
      notes: c.notes ?? "",
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este concierto?")) return;
    await fetch(`/api/concerts?id=${id}`, { method: "DELETE" });
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

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <h1 className="font-display text-4xl">Conciertos</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3 border border-line bg-ivory p-5">
          <h2 className="font-display text-2xl">{editingId ? "Editar" : "Nuevo"}</h2>
          {(
            [
              ["title", "Título"],
              ["date", "Fecha (YYYY-MM-DD)"],
              ["time", "Hora (HH:mm)"],
              ["city", "Ciudad"],
              ["venue", "Recinto"],
              ["ticketUrl", "URL entradas"],
            ] as const
          ).map(([name, label]) => (
            <label key={name} className="block text-sm">
              {label}
              <input
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                required={name !== "time" && name !== "ticketUrl"}
                type={name === "date" ? "date" : name === "time" ? "time" : "text"}
                className="mt-1 w-full border border-line px-3 py-2"
              />
            </label>
          ))}
          <label className="block text-sm">
            Estado entradas
            <select
              value={form.ticketStatus}
              onChange={(e) =>
                setForm({ ...form, ticketStatus: e.target.value as TicketStatus })
              }
              className="mt-1 w-full border border-line px-3 py-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicado
          </label>
          <label className="block text-sm">
            Notas
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full border border-line px-3 py-2"
              rows={3}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-taupe-dark">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Guardar" : "Crear"}</Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display text-3xl">Listado</h2>
        {!concerts.length && (
          <p className="provisional mt-4">No hay conciertos todavía.</p>
        )}
        <ul className="mt-4 space-y-3">
          {concerts.map((c) => (
            <li key={c.id} className="border border-line bg-ivory p-4">
              <p className="font-display text-xl">{c.title}</p>
              <p className="text-sm text-taupe-dark">
                {c.date} · {c.city} · {c.venue} ·{" "}
                {c.published ? "Publicado" : "Borrador"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => edit(c)}>
                  Editar
                </Button>
                <Button type="button" variant="ghost" onClick={() => togglePublish(c)}>
                  {c.published ? "Despublicar" : "Publicar"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => remove(c.id)}>
                  Eliminar
                </Button>
                {c.published && (
                  <a
                    href="/conciertos"
                    className="text-sm underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Previsualizar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
