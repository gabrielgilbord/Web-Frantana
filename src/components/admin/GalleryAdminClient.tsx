"use client";

import { FormEvent, useState } from "react";
import type { GalleryImage } from "@/types";
import { Button } from "@/components/ui/Button";

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
    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...image, published: !image.published }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta imagen del catálogo?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Galería</h1>
      <form
        onSubmit={onUpload}
        className="mt-6 max-w-xl space-y-3 border border-line bg-ivory p-5"
      >
        <label className="block text-sm">
          Archivo
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="mt-1 block w-full"
          />
        </label>
        <label className="block text-sm">
          Texto alternativo
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="mt-1 w-full border border-line px-3 py-2"
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publicada
        </label>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <Button type="submit" disabled={uploading}>
          {uploading ? "Subiendo…" : "Subir"}
        </Button>
      </form>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <li key={img.id} className="border border-line bg-ivory p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="aspect-[4/3] w-full object-cover" />
            <p className="mt-2 text-sm">{img.alt}</p>
            <p className="text-xs text-taupe-dark">
              {img.published ? "Publicada" : "Oculta"}
            </p>
            <div className="mt-2 flex gap-2">
              <Button type="button" variant="ghost" onClick={() => toggle(img)}>
                {img.published ? "Ocultar" : "Publicar"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => remove(img.id)}>
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
