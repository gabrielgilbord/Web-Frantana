"use client";

import { FormEvent, useState } from "react";
import type { SiteContent } from "@/types";

export function ContentAdminClient({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Contenido</h1>
          <p className="admin-page__lede">
            Textos principales, biografía, Spotify y redes.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="admin-form">
        <section className="admin-section">
          <h2 className="admin-section__title">Hero</h2>
          <div className="admin-section__body">
            <label className="admin-field">
              <span className="admin-field__label">Subtítulo del hero</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={2}
                value={content.heroSubtitle ?? ""}
                onChange={(e) =>
                  setContent({ ...content, heroSubtitle: e.target.value })
                }
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section__title">Sobre mí</h2>
          <div className="admin-section__body">
            <label className="admin-field">
              <span className="admin-field__label">Título Sobre</span>
              <input
                className="admin-field__input"
                value={content.aboutTitle ?? ""}
                onChange={(e) =>
                  setContent({ ...content, aboutTitle: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Biografía</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={5}
                value={content.aboutBody ?? ""}
                onChange={(e) =>
                  setContent({ ...content, aboutBody: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Título storytelling</span>
              <input
                className="admin-field__input"
                value={content.aboutStoryTitle ?? ""}
                onChange={(e) =>
                  setContent({ ...content, aboutStoryTitle: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Texto storytelling</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={5}
                value={content.aboutStoryBody ?? ""}
                onChange={(e) =>
                  setContent({ ...content, aboutStoryBody: e.target.value })
                }
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section__title">Redes</h2>
          <div className="admin-section__body">
            {(
              [
                ["instagram", "Instagram"],
                ["facebook", "Facebook"],
                ["spotify", "Spotify"],
                ["youtube", "YouTube"],
                ["tiktok", "TikTok"],
                ["appleMusic", "Apple Music"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="admin-field">
                <span className="admin-field__label">{label}</span>
                <input
                  className="admin-field__input"
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
            <label className="admin-field">
              <span className="admin-field__label">Email contacto</span>
              <input
                className="admin-field__input"
                value={content.contactEmail ?? ""}
                onChange={(e) =>
                  setContent({ ...content, contactEmail: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Teléfono</span>
              <input
                className="admin-field__input"
                value={content.contactPhone ?? ""}
                onChange={(e) =>
                  setContent({ ...content, contactPhone: e.target.value })
                }
              />
            </label>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section__title">Home</h2>
          <div className="admin-section__body">
            <label className="admin-field">
              <span className="admin-field__label">Título presentación</span>
              <input
                className="admin-field__input"
                value={content.homeIntroTitle ?? ""}
                onChange={(e) =>
                  setContent({ ...content, homeIntroTitle: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Texto presentación</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={4}
                value={content.homeIntroBody ?? ""}
                onChange={(e) =>
                  setContent({ ...content, homeIntroBody: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Introducción música</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={3}
                value={content.musicIntro ?? ""}
                onChange={(e) =>
                  setContent({ ...content, musicIntro: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">URL embed Spotify</span>
              <input
                className="admin-field__input"
                value={content.spotifyEmbedUrl ?? ""}
                onChange={(e) =>
                  setContent({ ...content, spotifyEmbedUrl: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">URL artista Spotify</span>
              <input
                className="admin-field__input"
                value={content.spotifyArtistUrl ?? ""}
                onChange={(e) =>
                  setContent({ ...content, spotifyArtistUrl: e.target.value })
                }
              />
            </label>
            <label className="admin-field">
              <span className="admin-field__label">Descripción SEO</span>
              <textarea
                className="admin-field__input admin-field__input--area"
                rows={2}
                value={content.seoDescription ?? ""}
                onChange={(e) =>
                  setContent({ ...content, seoDescription: e.target.value })
                }
              />
            </label>
          </div>
        </section>

        <div className="admin-sticky-actions">
          {(error || message) && (
            <div className="admin-sticky-actions__feedback">
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
            </div>
          )}
          <button
            type="submit"
            className="admin-btn admin-btn--ember"
            disabled={saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn--ghost"
          >
            Previsualizar home
          </a>
        </div>
      </form>
    </div>
  );
}
