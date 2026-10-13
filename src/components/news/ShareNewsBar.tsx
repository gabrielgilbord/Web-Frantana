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

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function ShareNewsBar({ title, url, excerpt }: Props) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const text = excerpt?.trim()
    ? `${title}\n\n${excerpt.trim()}\n\n${url}`
    : `${title}\n\n${url}`;

  function flash(kind: "ok" | "hint", msg: string) {
    setFeedback({ kind, text: msg });
  }

  async function copyLink(silent = false) {
    try {
      await navigator.clipboard.writeText(url);
      if (!silent) flash("ok", "Enlace copiado");
      return true;
    } catch {
      if (!silent) {
        flash(
          "hint",
          "No se pudo copiar. Selecciona y copia la URL del navegador."
        );
      }
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
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=640"
    );
  }

  function shareX() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=640"
    );
  }

  /**
   * Instagram no tiene sharer web oficial.
   * En móvil: abre la app en el selector de compartir (historia / publicación / chat).
   * En escritorio: copia el enlace y abre Instagram.
   */
  async function shareInstagram() {
    await copyLink(true);

    // 1) Deep link al sharesheet de Instagram (iOS y algunas builds Android)
    const sharesheet = `instagram://sharesheet?text=${encodeURIComponent(text)}`;

    // 2) Android: intent directo a la app de Instagram
    if (isAndroid()) {
      const intent = [
        "intent://#Intent",
        "action=android.intent.action.SEND",
        "type=text/plain",
        `S.android.intent.extra.TEXT=${encodeURIComponent(text)}`,
        "package=com.instagram.android",
        `S.browser_fallback_url=${encodeURIComponent(sharesheet)}`,
        "end",
      ].join(";");

      window.location.href = intent;
      flash(
        "hint",
        "Si no se abre, ten Instagram instalado y elige historia o publicación."
      );
      return;
    }

    if (isAppleMobile()) {
      const leftAt = Date.now();
      window.location.href = sharesheet;

      window.setTimeout(() => {
        // Si seguimos en la página, la app no capturó el deep link
        if (document.visibilityState !== "visible") return;
        if (Date.now() - leftAt < 900) return;

        if (typeof navigator.share === "function") {
          void navigator
            .share({ title, text: excerpt || title, url })
            .catch((err) => {
              if (err instanceof DOMException && err.name === "AbortError") {
                return;
              }
              flash(
                "hint",
                "Enlace copiado. Abre Instagram y elige historia o publicación."
              );
            });
          return;
        }

        flash(
          "hint",
          "Enlace copiado. Abre Instagram y elige historia o publicación."
        );
      }, 1100);
      return;
    }

    // Móvil genérico con Web Share (abre el menú; elige Instagram ahí)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: excerpt || title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    // Escritorio / fallback
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    flash(
      "hint",
      "Enlace copiado. En Instagram pégalo en una historia o publicación."
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
              aria-label="Abrir Instagram para compartir"
              title="Abrir Instagram y elegir historia o publicación"
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
              onClick={() => void copyLink(false)}
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
          Instagram abre la app para elegir historia, publicación o chat. En
          ordenador se copia el enlace.
        </p>
      )}
    </aside>
  );
}
