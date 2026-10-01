"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeSaveData(cb: () => void) {
  const conn = (
    navigator as Navigator & {
      connection?: EventTarget & {
        saveData?: boolean;
        effectiveType?: string;
      };
    }
  ).connection;
  if (!conn) return () => {};
  conn.addEventListener("change", cb);
  return () => conn.removeEventListener("change", cb);
}

function getSaveDataSnapshot() {
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return (
    Boolean(conn?.saveData) ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "slow-2g"
  );
}

function getSaveDataServerSnapshot() {
  return false;
}

type HeroProps = {
  subtitle: string;
};

export function HeroCinematic({ subtitle }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const saveData = useSyncExternalStore(
    subscribeSaveData,
    getSaveDataSnapshot,
    getSaveDataServerSnapshot
  );
  const [playbackFailed, setPlaybackFailed] = useState(false);

  const usePoster = reduce || saveData || playbackFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || usePoster) return;
    let cancelled = false;
    video.play().catch(() => {
      if (!cancelled) setPlaybackFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [usePoster]);

  return (
    <section className="hero-plane" aria-label="Presentación Frantana">
      <div className="hero-plane__media">
        {!usePoster ? (
          <video
            ref={videoRef}
            className="media-fill"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/hero/hero-poster.jpg"
            aria-hidden
          >
            <source
              src="/media/hero/hero-cinematic-720.mp4"
              type="video/mp4"
              media="(max-width: 768px)"
            />
            <source src="/media/hero/hero-cinematic.mp4" type="video/mp4" />
          </video>
        ) : (
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="/media/hero/hero-poster-mobile.jpg"
            />
            <img
              src="/media/hero/hero-poster.jpg"
              alt=""
              className="media-fill"
              aria-hidden
            />
          </picture>
        )}
      </div>

      <div className="hero-plane__overlay" aria-hidden />

      <div className="hero-plane__content">
        <div className="mx-auto w-full max-w-[78rem]">
          <h1 className="hero-brand hero-anim hero-anim-2">FRANTANA</h1>
          <p className="hero-sub hero-anim hero-anim-3">{subtitle}</p>
          <div className="hero-actions hero-anim hero-anim-4">
            <Button href="/musica" variant="on-dark" size="sm">
              Escuchar música
            </Button>
            <Button href="/conciertos" variant="on-dark-outline" size="sm">
              Próximos conciertos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
