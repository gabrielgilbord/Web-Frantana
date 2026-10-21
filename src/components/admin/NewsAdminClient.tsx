"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { NewsCategory, NewsPost } from "@/types";
import { NEWS_CATEGORY_LABEL } from "@/lib/news/render";
import {
  fromDatetimeLocalValue,
  newsPublishState,
  toDatetimeLocalValue,
} from "@/lib/news/schedule";
import { slugifyNews } from "@/lib/news/slug";
import { NewsBodyEditor } from "@/components/admin/NewsBodyEditor";

function bodyHasContent(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length > 0;
}

const CATEGORIES: NewsCategory[] = [
  "lanzamiento",
  "promocion",
  "noticia",
  "otro",
];

const STATE_LABEL = {
  draft: "Borrador",
  scheduled: "Programada",
  live: "Publicada",
} as const;

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  category: "noticia" as NewsCategory,
  published: false,
  publishAtLocal: "",
};

export function NewsAdminClient({
  initialPosts,
}: {
  initialPosts: NewsPost[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.slug.includes(q)
    );
  }, [posts, query]);

  async function refresh() {
    const res = await fetch("/api/news");
    if (!res.ok) return;
    const data = await res.json();
    setPosts(data.posts ?? []);
  }

  function startCreate() {
    setEditingId(null);
    setForm(empty);
    setError(null);
    setMessage(null);
    setMode("edit");
  }

  function edit(p: NewsPost) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      body: p.body,
      coverImage: p.coverImage ?? "",
      category: p.category,
      published: p.published,
      publishAtLocal: toDatetimeLocalValue(p.publishedAt),
    });
    setError(null);
    setMessage(null);
    setMode("edit");
  }

  async function savePost(overrides?: {
    published?: boolean;
    publishAtLocal?: string;
  }) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const next = { ...form, ...overrides };
      if (!bodyHasContent(next.body)) {
        setError("Escribe el cuerpo de la novedad.");
        return;
      }
      const existing = editingId
        ? posts.find((p) => p.id === editingId)
        : null;
      const publishedAt = next.published
        ? fromDatetimeLocalValue(next.publishAtLocal) ||
          new Date().toISOString()
        : fromDatetimeLocalValue(next.publishAtLocal);

      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          title: next.title,
          slug: next.slug || slugifyNews(next.title),
          excerpt: next.excerpt,
          body: next.body,
          coverImage: next.coverImage || null,
          category: next.category,
          published: next.published,
          publishedAt,
          createdAt: existing?.createdAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      if (overrides) setForm(next);
      const state = newsPublishState(data.post as NewsPost);
      setMessage(
        state === "scheduled"
          ? "Novedad programada. Se publicará sola en la fecha indicada."
          : state === "live"
            ? "Novedad publicada."
            : "Borrador guardado."
      );
      await refresh();
      setMode("list");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await savePost();
  }

  async function publishNow() {
    await savePost({
      published: true,
      publishAtLocal: toDatetimeLocalValue(new Date().toISOString()),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta novedad?")) return;
    const res = await fetch(`/api/news?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    await refresh();
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Error al subir imagen");
        return;
      }
      setForm((f) => ({ ...f, coverImage: data.src ?? "" }));
    } finally {
      setUploading(false);
    }
  }

  if (mode === "edit") {
    const previewState = newsPublishState({
      published: form.published,
      publishedAt: fromDatetimeLocalValue(form.publishAtLocal),
    });

    return (
      <div className="admin-page">
        <header className="admin-page__head">
          <div>
            <p className="admin-page__eyebrow">Editorial</p>
            <h1 className="admin-page__title">
              {editingId ? "Editar novedad" : "Nueva novedad"}
            </h1>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setMode("list")}
          >
            Volver
          </button>
        </header>

        <form className="admin-form" onSubmit={onSubmit}>
          <label>
            Título
            <input
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: f.slug || slugifyNews(title),
                }));
              }}
            />
          </label>
          <label>
            Slug (URL)
            <input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugifyNews(e.target.value) }))
              }
              placeholder="mi-lanzamiento"
            />
          </label>
          <label>
            Categoría
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as NewsCategory,
                }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {NEWS_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Extracto
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
              placeholder="Una línea para la home y el listado…"
            />
          </label>
          <div className="admin-form__editor">
            <span className="admin-form__editor-label">Cuerpo</span>
            <NewsBodyEditor
              value={form.body}
              onChange={(body) => setForm((f) => ({ ...f, body }))}
            />
          </div>
          <label>
            Portada
            <input
              value={form.coverImage}
              onChange={(e) =>
                setForm((f) => ({ ...f, coverImage: e.target.value }))
              }
              placeholder="/media/…"
            />
          </label>
          <label className="admin-form__file">
            Subir portada
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCover(file);
              }}
            />
          </label>
          {form.coverImage ? (
            <div className="relative h-40 w-full overflow-hidden rounded-sm">
              <Image
                src={form.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          ) : null}

          <fieldset className="admin-form__schedule">
            <legend>Publicación</legend>
            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    published: e.target.checked,
                    publishAtLocal:
                      e.target.checked && !f.publishAtLocal
                        ? toDatetimeLocalValue(new Date().toISOString())
                        : f.publishAtLocal,
                  }))
                }
              />
              Activar publicación (o programarla)
            </label>
            <label>
              Fecha y hora de publicación
              <input
                type="datetime-local"
                value={form.publishAtLocal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publishAtLocal: e.target.value }))
                }
              />
            </label>
            <p className="admin-form__hint">
              Si la fecha es futura y la casilla está activa, la novedad queda{" "}
              <strong>programada</strong> y aparece sola en la web ese día (sin
              cron). Estado actual: {STATE_LABEL[previewState]}.
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={
                saving || !form.title.trim() || !bodyHasContent(form.body)
              }
              onClick={() => void publishNow()}
            >
              {saving ? "Publicando…" : "Publicar ahora"}
            </button>
          </fieldset>

          {error ? <p className="admin-empty">{error}</p> : null}
          {message ? <p className="admin-empty">{message}</p> : null}
          <button
            type="submit"
            className="admin-btn admin-btn--ember"
            disabled={saving}
          >
            {saving
              ? "Guardando…"
              : form.published
                ? newsPublishState({
                      published: form.published,
                      publishedAt: fromDatetimeLocalValue(form.publishAtLocal),
                    }) === "scheduled"
                  ? "Guardar programación"
                  : "Guardar y publicar"
                : "Guardar borrador"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="admin-page__eyebrow">Editorial</p>
          <h1 className="admin-page__title">Novedades</h1>
          <p className="admin-page__lede">
            {posts.length} novedad{posts.length === 1 ? "" : "es"} · puedes
            programar la fecha de salida
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ember"
          onClick={startCreate}
        >
          Nueva novedad
        </button>
      </header>

      <div className="admin-toolbar" style={{ marginBottom: "1rem" }}>
        <input
          type="search"
          placeholder="Buscar…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: "14rem" }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">Aún no hay novedades.</p>
      ) : (
        <ul className="admin-booking-list">
          {filtered.map((p) => {
            const state = newsPublishState(p);
            return (
              <li key={p.id} className="admin-booking-card">
                <div className="admin-booking-card__top">
                  <div>
                    <p className="admin-booking-card__name">{p.title}</p>
                    <p className="admin-booking-card__meta">
                      {NEWS_CATEGORY_LABEL[p.category]} · /{p.slug}
                      {p.publishedAt
                        ? ` · ${new Date(p.publishedAt).toLocaleString("es-ES", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`admin-status admin-status--${state === "live" ? "published" : "draft"}`}
                  >
                    {STATE_LABEL[state]}
                  </span>
                </div>
                {p.excerpt ? (
                  <p className="admin-booking-card__message">{p.excerpt}</p>
                ) : null}
                <div className="admin-booking-card__actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => edit(p)}
                  >
                    Editar
                  </button>
                  {state === "live" ? (
                    <a
                      className="admin-btn admin-btn--ghost"
                      href={`/novedades/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => remove(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
