"use client";

import { motion, useReducedMotion } from "framer-motion";
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

function prefersSaveData() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(conn?.saveData) || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g";
}

type HeroProps = {
  subtitle: string;
};

export function HeroCinematic({ subtitle }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  const [paused, setPaused] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);

  const useImageFallback = Boolean(reduce) || isMobile || prefersSaveData() || playbackFailed;

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
        <motion.p
          className="text-[0.72rem] font-medium tracking-[0.22em] uppercase text-taupe-mid"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Web oficial
        </motion.p>

        <motion.h1
          className="display-title mt-4 max-w-[11ch] text-[clamp(4.2rem,16vw,11rem)] text-ivory"
          initial={reduce ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          FRANTANA
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-base text-ivory/85 md:text-lg"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-3"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button href="/musica" variant="inverse">
            Escuchar
          </Button>
          <Button href="/conciertos" variant="secondary">
            Conciertos
          </Button>
        </motion.div>

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
        <span className="scroll-indicator block h-10 w-px overflow-hidden bg-ivory/25" aria-hidden>
          <span className="scroll-indicator__bar block h-full w-full bg-ivory/80" />
        </span>
      </div>
    </section>
  );
}
