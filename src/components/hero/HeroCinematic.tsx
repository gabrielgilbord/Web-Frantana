"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getMobileServerSnapshot() {
  return false;
}

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

function prefersSaveData() {
  if (typeof navigator === "undefined") return false;
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
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
  const [paused, setPaused] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);

  const useImageFallback = reduce || isMobile || prefersSaveData() || playbackFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useImageFallback) return;
    let cancelled = false;
    video.play().catch(() => {
      if (!cancelled) setPlaybackFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [useImageFallback]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <section
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-ivory"
      aria-label="Presentación Frantana"
    >
      {!useImageFallback ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero/hero-poster.jpg"
          aria-hidden
        >
          <source src="/media/hero/hero-cinematic.mp4" type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/media/hero/hero-poster.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,20,17,0.35)_0%,rgba(23,20,17,0.25)_40%,rgba(23,20,17,0.78)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full container-editorial pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-20">
        <p className="hero-enter hero-enter--1 text-[0.72rem] font-medium tracking-[0.22em] uppercase text-taupe-mid">
          Web oficial
        </p>

        <h1 className="hero-enter hero-enter--2 display-title mt-4 max-w-[11ch] text-[clamp(4.2rem,16vw,11rem)] text-ivory">
          FRANTANA
        </h1>

        <p className="hero-enter hero-enter--3 mt-6 max-w-xl text-base text-ivory/85 md:text-lg">
          {subtitle}
        </p>

        <div className="hero-enter hero-enter--4 mt-10 flex flex-wrap gap-3">
          <Button href="/musica" variant="inverse">
            Escuchar
          </Button>
          <Button href="/conciertos" variant="secondary">
            Conciertos
          </Button>
        </div>

        {!useImageFallback && (
          <button
            type="button"
            onClick={togglePlayback}
            className="mt-8 min-h-11 text-[0.68rem] tracking-[0.18em] uppercase text-ivory/75 underline-offset-4 hover:text-ivory"
          >
            {paused ? "Reproducir vídeo" : "Pausar vídeo"}
          </button>
        )}
      </div>

      <div className="absolute bottom-6 right-[var(--space-gutter)] z-10 hidden md:flex flex-col items-center gap-2 text-ivory/70">
        <span className="text-[0.62rem] tracking-[0.22em] uppercase">Scroll</span>
        <span
          className="scroll-indicator block h-10 w-px overflow-hidden bg-ivory/25"
          aria-hidden
        >
          <span className="scroll-indicator__bar block h-full w-full bg-ivory/80" />
        </span>
      </div>
    </section>
  );
}
