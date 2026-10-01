"use client";

import { FormEvent, useState } from "react";
import type { GalleryImage } from "@/types";

export function GalleryAdminClient({
  initialImages,
}: {
  initialImages: GalleryImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [alt, setAlt] = useState("");
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/gallery");
    if (!res.ok) return;
    const data = await res.json();
    setImages(data.gallery ?? []);
  }

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Selecciona un archivo");
      return;
    }
    setUploading(true);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    if (!uploadRes.ok) {
      const data = await uploadRes.json().catch(() => ({}));
      setUploading(false);
      setError(data.error ?? "Error al subir");
      return;
    }
    const { src } = await uploadRes.json();
    const saveRes = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        src,
        alt: alt || "Fotografía Frantana",
        published,
        sortOrder: images.length + 1,
        width: 1600,
        height: 1067,
      }),
    });
    setUploading(false);
    if (!saveRes.ok) {
      setError("Subida ok, pero falló el registro");
      return;
    }
    setAlt("");
    setMessage("Imagen añadida");
    e.currentTarget.reset();
    await refresh();
  }

  async function toggle(image: GalleryImage) {
    setBusyId(image.id);
    try {
      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...image, published: !image.published }),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta imagen del catálogo?")) return;
    setBusyId(id);
    try {
      await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    const a = { ...next[index], sortOrder: index + 1 };
    const b = { ...next[target], sortOrder: target + 1 };
    setBusyId(images[index].id);
    try {
      await Promise.all([
        fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(a),
        }),
        fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b),
        }),
      ]);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Galería</h1>
          <p className="admin-page__lede">
            {images.length} fotos · usa ↑ ↓ para reordenar
          </p>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section__title">Subir foto</h2>
        <form onSubmit={onUpload} className="admin-section__body">
          <label className="admin-upload admin-upload--lg">
            <span>{uploading ? "Subiendo…" : "Elige o suelta una imagen"}</span>
            <span className="admin-upload__hint">
              JPEG, PNG, WebP o AVIF · zona táctil grande
            </span>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploading}
            />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Texto alternativo</span>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="admin-field__input"
              required
              placeholder="Describe la foto"
            />
          </label>
          <label className="admin-field admin-field--row">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span className="admin-field__label">Publicada al subir</span>
          </label>
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
          <button
            type="submit"
            className="admin-btn admin-btn--ember"
            disabled={uploading}
          >
            {uploading ? "Subiendo…" : "Subir"}
          </button>
        </form>
      </section>

      {!images.length ? (
        <p className="admin-empty">La galería está vacía.</p>
      ) : (
        <div className="admin-gallery-grid">
          {images.map((img, index) => (
            <article key={img.id} className="admin-gallery-card">
              <div className="admin-gallery-card__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} />
              </div>
              <div className="admin-gallery-card__meta">
                <p className="admin-gallery-card__alt">{img.alt}</p>
                <span
                  className={`admin-status ${
                    img.published
                      ? "admin-status--published"
                      : "admin-status--draft"
                  }`}
                >
                  {img.published ? "Publicada" : "Oculta"}
                </span>
              </div>
              <div className="admin-gallery-card__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => toggle(img)}
                  disabled={busyId === img.id}
                >
                  {img.published ? "Ocultar" : "Publicar"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--icon admin-btn--sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || busyId === img.id}
                  aria-label="Subir en el orden"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--icon admin-btn--sm"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1 || busyId === img.id}
                  aria-label="Bajar en el orden"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  onClick={() => remove(img.id)}
                  disabled={busyId === img.id}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
