"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaSpotify } from "react-icons/fa6";
import {
  FRANTANA_SPOTIFY_ARTIST_EMBED,
  FRANTANA_SPOTIFY_ARTIST_URI,
  FRANTANA_SPOTIFY_ARTIST_URL,
  FRANTANA_TRACKS,
  type FrantanaTrack,
} from "@/data/spotify-catalog";
import { getSocialLinks } from "@/lib/social";
import type { SiteContent } from "@/types";

type Props = {
  content: SiteContent;
};

const ease = [0.16, 1, 0.3, 1] as const;

type SpotifyEmbedController = {
  loadEntity: (uriOrUrl: string) => void;
  play: () => void;
  addListener: (
    event: string,
    cb: (e: { data?: { playingURI?: string } }) => void
  ) => void;
  destroy?: () => void;
};

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri?: string; url?: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

/**
 * Technical note (verified):
 * - No public Frantana playlist found.
 * - Releases are singles → album embeds are 1-track.
 * - Artist embed = multi-track Top tracks + native selection / next-prev inside Spotify UI.
 * - Partitura rows use official iFrame API loadEntity + play (real control),
 *   plus a separate external Spotify link.
 */
export function MusicaChapter({ content }: Props) {
  const reduce = useReducedMotion();
  const social = getSocialLinks(content);
  const embedHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const host = embedHostRef.current;
    if (!host) return;

    const boot = (IFrameAPI: SpotifyIFrameAPI) => {
      if (cancelled || !embedHostRef.current) return;
      const mount = embedHostRef.current;
      // Avoid double-mount if React Strict Mode remounts
      if (mount.dataset.spotifyMounted === "1") return;
      mount.dataset.spotifyMounted = "1";
      IFrameAPI.createController(
        mount,
        {
          uri: FRANTANA_SPOTIFY_ARTIST_URI,
          width: "100%",
          height: 352,
        },
        (controller) => {
          if (cancelled) return;
          controllerRef.current = controller;
          setReady(true);
          controller.addListener("ready", () => setReady(true));
          controller.addListener("playback_started", (e) => {
            const uri = e.data?.playingURI;
            if (!uri) return;
            const match = FRANTANA_TRACKS.find((t) => t.uri === uri);
            setActiveId(match?.id ?? null);
          });
        }
      );
    };

    const previousReady = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      (
        window as unknown as { __spotifyIFrameAPI?: SpotifyIFrameAPI }
      ).__spotifyIFrameAPI = api;
      previousReady?.(api);
      boot(api);
    };

    const cached = (
      window as unknown as { __spotifyIFrameAPI?: SpotifyIFrameAPI }
    ).__spotifyIFrameAPI;
    if (cached) {
      boot(cached);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-spotify-iframe-api="true"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.dataset.spotifyIframeApi = "true";
      script.onerror = () => {
        if (!cancelled) setApiFailed(true);
      };
      document.body.appendChild(script);
    }

    const failSafe = window.setTimeout(() => {
      if (!cancelled && !controllerRef.current) setApiFailed(true);
    }, 6000);

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      controllerRef.current?.destroy?.();
      controllerRef.current = null;
    };
  }, []);

  const playInEmbed = useCallback((track: FrantanaTrack) => {
    const controller = controllerRef.current;
    if (!controller) {
      window.open(track.url, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveId(track.id);
    controller.loadEntity(track.uri);
    // User gesture → play is allowed in most browsers
    try {
      controller.play();
    } catch {
      /* Spotify may require another click inside the iframe */
    }
  }, []);

  const onRowActivate = useCallback(
    (track: FrantanaTrack, e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      playInEmbed(track);
    },
    [playInEmbed]
  );

  const showArtist = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) {
      window.open(FRANTANA_SPOTIFY_ARTIST_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveId(null);
    controller.loadEntity(FRANTANA_SPOTIFY_ARTIST_URI);
  }, []);

  return (
    <section className="chapter chapter--musica" aria-labelledby="ch-03">
      <div className="musica-scene__atmosphere" aria-hidden>
        <Image
          src="/media/editorial/music-atmosphere-v2.jpg"
          alt=""
          fill
          sizes="100vw"
          className="musica-scene__atmosphere-img"
          priority={false}
        />
        <div className="musica-scene__atmosphere-veil" />
      </div>

      <div className="musica-scene">
        <header className="musica-scene__header">
          <motion.div
            className="musica-scene__eyebrow"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease }}
          >
            <span>03</span>
            <span className="musica-scene__eyebrow-sep" aria-hidden />
            <span>Listen</span>
          </motion.div>

          <div className="musica-scene__title-row">
            <motion.h2
              id="ch-03"
              className="musica-scene__title"
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.05, ease }}
            >
              Música
            </motion.h2>
            <motion.p
              className="musica-scene__lede"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.95, delay: 0.12, ease }}
            >
              La noche también
              <br />
              tiene una banda sonora.
            </motion.p>
          </div>

          <motion.div
            className="musica-scene__rule"
            aria-hidden
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.15, delay: 0.2, ease }}
          />
        </header>

        <motion.p
          className="musica-scene__meta"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          Frantana · Gran Canaria · Live
        </motion.p>
        <motion.p
          className="musica-scene__intro"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, delay: 0.12, ease }}
        >
          {content.musicIntro}
        </motion.p>

        {/* ── Repertorio (izq) + Spotify (der) ── */}
        <div className="musica-split">
          <motion.div
            className="musica-partitura"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, delay: 0.15, ease }}
          >
            <header className="musica-partitura__head">
              <h3 className="musica-partitura__title">Repertorio</h3>
              <p className="musica-partitura__hint">
                Elige un tema para cargarlo en el reproductor. El icono abre
                Spotify.
              </p>
            </header>

            <ol className="musica-partitura__list">
              {FRANTANA_TRACKS.map((track, index) => {
                const n = String(index + 1).padStart(2, "0");
                const isActive = activeId === track.id;
                return (
                  <li key={track.id} className="musica-partitura__item">
                    <button
                      type="button"
                      className={
                        isActive
                          ? "musica-partitura__row is-active"
                          : "musica-partitura__row"
                      }
                      onClick={(e) => onRowActivate(track, e)}
                      aria-pressed={isActive}
                      aria-label={`Reproducir ${track.title} en el reproductor de Spotify`}
                    >
                      <span className="musica-partitura__num">{n}</span>
                      <span className="musica-partitura__name">{track.title}</span>
                      <span className="musica-partitura__cue">Escuchar</span>
                    </button>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="musica-partitura__external"
                      aria-label={`Abrir ${track.title} en Spotify`}
                    >
                      <FaSpotify aria-hidden className="musica-partitura__icon" />
                      <span>↗ Spotify</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </motion.div>

          <motion.div
            className="musica-spotify"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1, delay: 0.22, ease }}
          >
            <div className="musica-spotify__head">
              <h3 className="musica-spotify__title">
                <FaSpotify aria-hidden className="musica-spotify__mark" />
                Spotify
              </h3>
              <div className="musica-spotify__actions">
                <button
                  type="button"
                  className="musica-spotify__artist"
                  onClick={showArtist}
                  disabled={!ready && !apiFailed}
                >
                  Top tracks del artista
                </button>
                {(social.spotify || FRANTANA_SPOTIFY_ARTIST_URL) && (
                  <a
                    href={social.spotify ?? FRANTANA_SPOTIFY_ARTIST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="musica-spotify__open"
                  >
                    Abrir perfil →
                  </a>
                )}
              </div>
            </div>

            <div className="musica-spotify__stage">
              {apiFailed ? (
                <iframe
                  title="Frantana en Spotify"
                  src={FRANTANA_SPOTIFY_ARTIST_EMBED}
                  width="100%"
                  height={352}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="spotify-embed__frame"
                  style={{ borderRadius: 0, border: 0 }}
                />
              ) : (
                <div
                  ref={embedHostRef}
                  className="musica-spotify__host"
                />
              )}
            </div>
          </motion.div>
        </div>

        <p className="musica-scene__echo" aria-hidden>
          Escucha
        </p>
      </div>
    </section>
  );
}
