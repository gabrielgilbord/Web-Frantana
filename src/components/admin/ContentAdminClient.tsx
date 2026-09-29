"use client";

import { FormEvent, useState } from "react";
import type { SiteContent } from "@/types";
import { Button } from "@/components/ui/Button";

export function ContentAdminClient({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al guardar");
      return;
    }
    const data = await res.json();
    setContent(data.content);
    setMessage("Contenido guardado");
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Contenido</h1>
      <p className="mt-2 text-sm text-taupe-dark">
        Textos principales, biografía, Spotify y redes.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-line bg-ivory p-6">
        {(
          [
            ["heroSubtitle", "Subtítulo del hero"],
            ["homeIntroTitle", "Título presentación home"],
            ["homeIntroBody", "Texto presentación home"],
            ["aboutTitle", "Título Sobre"],
            ["aboutBody", "Biografía"],
            ["aboutStoryTitle", "Título storytelling"],
            ["aboutStoryBody", "Texto storytelling"],
            ["musicIntro", "Introducción música"],
            ["spotifyEmbedUrl", "URL embed Spotify"],
            ["spotifyArtistUrl", "URL artista Spotify"],
            ["contactEmail", "Email contacto"],
            ["contactPhone", "Teléfono"],
            ["seoDescription", "Descripción SEO"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            {label}
            {key.includes("Body") ||
            key.includes("Intro") ||
            key === "heroSubtitle" ||
            key === "seoDescription" ? (
              <textarea
                className="mt-1 w-full border border-line px-3 py-2"
                rows={key.includes("Body") ? 5 : 2}
                value={(content[key] as string) ?? ""}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
              />
            ) : (
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={(content[key] as string) ?? ""}
                onChange={(e) => setContent({ ...content, [key]: e.target.value })}
              />
            )}
          </label>
        ))}

        <fieldset className="space-y-3 border-t border-line pt-4">
          <legend className="font-display text-2xl">Redes</legend>
          {(
            [
              "instagram",
              "facebook",
              "spotify",
              "youtube",
              "tiktok",
              "appleMusic",
            ] as const
          ).map((key) => (
            <label key={key} className="block text-sm capitalize">
              {key}
              <input
                className="mt-1 w-full border border-line px-3 py-2"
                value={content.social[key] ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    social: { ...content.social, [key]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </fieldset>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Guardar</Button>
          <a href="/" target="_blank" rel="noreferrer" className="self-center text-sm underline">
            Previsualizar home
          </a>
        </div>
      </form>
    </div>
  );
}
