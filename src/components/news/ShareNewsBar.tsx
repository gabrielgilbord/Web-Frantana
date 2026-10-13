"use client";

import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaShareNodes,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

type Props = {
  title: string;
  url: string;
  excerpt?: string | null;
};

type Feedback = { kind: "ok" | "hint"; text: string } | null;

export function ShareNewsBar({ title, url, excerpt }: Props) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 4200);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const text = excerpt?.trim()
    ? `${title}\n\n${excerpt.trim()}\n\n${url}`
    : `${title}\n\n${url}`;

  function flash(kind: "ok" | "hint", msg: string) {
    setFeedback({ kind, text: msg });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      flash("ok", "Enlace copiado");
      return true;
    } catch {
      flash("hint", "No se pudo copiar. Selecciona y copia la URL del navegador.");
      return false;
    }
  }

  async function shareNative() {
    try {
      await navigator.share({ title, text: excerpt || title, url });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      flash("hint", "Usa los botones de abajo para compartir.");
    }
  }

  function shareWhatsApp() {
    const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=640");
  }

  function shareX() {
    const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=640");
  }

  async function shareInstagram() {
    const ok = await copyLink();
    if (!ok) return;
    flash(
      "hint",
      "Enlace copiado. Ábrelo en Instagram y pégalo en una historia o publicación."
    );
  }

  return (
    <aside className="share-news" aria-label="Compartir esta novedad">
      <div className="share-news__row">
        <p className="share-news__label">Compartir</p>
        <ul className="share-news__list">
          {canNativeShare ? (
            <li>
              <button
                type="button"
                className="share-news__btn"
                onClick={shareNative}
                aria-label="Compartir con el menú del dispositivo"
                title="Compartir (Instagram, WhatsApp, etc.)"
              >
                <FaShareNodes aria-hidden />
                <span>Más</span>
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              className="share-news__btn"
              onClick={shareWhatsApp}
              aria-label="Compartir por WhatsApp"
              title="WhatsApp: enviar a un contacto o pegar en un estado"
            >
              <FaWhatsapp aria-hidden />
              <span>WhatsApp</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-news__btn"
              onClick={shareFacebook}
              aria-label="Compartir en Facebook"
              title="Publicar en Facebook"
            >
              <FaFacebookF aria-hidden />
              <span>Facebook</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-news__btn"
              onClick={shareInstagram}
              aria-label="Compartir en Instagram"
              title="Copiar enlace para historia o publicación de Instagram"
            >
              <FaInstagram aria-hidden />
              <span>Instagram</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-news__btn"
              onClick={shareX}
              aria-label="Compartir en X"
              title="Publicar en X"
            >
              <FaXTwitter aria-hidden />
              <span>X</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="share-news__btn"
              onClick={copyLink}
              aria-label="Copiar enlace"
              title="Copiar enlace"
            >
              <FaLink aria-hidden />
              <span>Copiar</span>
            </button>
          </li>
        </ul>
      </div>
      {feedback ? (
        <p
          className={
            feedback.kind === "ok"
              ? "share-news__feedback share-news__feedback--ok"
              : "share-news__feedback"
          }
          role="status"
        >
          {feedback.text}
        </p>
      ) : (
        <p className="share-news__note">
          En el móvil, «Más» abre el menú del sistema (historias, estados, chats…).
        </p>
      )}
    </aside>
  );
}
