"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/tokens";

/**
 * Hero media — sustituye estos paths cuando tengas vídeo/foto de show propios.
 * Deja el poster y el mp4 en /public/media/hero/
 */
const HERO_POSTER = "/media/hero/hero-poster.jpg";
const HERO_POSTER_MOBILE = "/media/hero/hero-poster-mobile.jpg";
const HERO_VIDEO_720 = "/media/hero/hero-cinematic-720.mp4";
const HERO_VIDEO = "/media/hero/hero-cinematic.mp4";

gsap.registerPlugin(ScrollTrigger);

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

/**
 * Fase C final — Ascending Name title sequence
 * Perfect center opening → identity reveal → Cormorant→Outfit → navbar land
 */
export function HeroExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const brandDisplayRef = useRef<HTMLSpanElement>(null);
  const brandMarkRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLParagraphElement>(null);
  const originRef = useRef<HTMLParagraphElement>(null);
  const pillarsRef = useRef<HTMLUListElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    void video.play().catch(() => {});
    return () => {
      video.pause();
    };
  }, [reduce]);

  useEffect(() => {
    if (!portalReady) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    const videoWrap = videoWrapRef.current;
    const plate = plateRef.current;
    const atmosphere = atmosphereRef.current;
    const overlay = overlayRef.current;
    const brand = brandRef.current;
    const brandDisplay = brandDisplayRef.current;
    const brandMark = brandMarkRef.current;
    const cue = cueRef.current;
    const coords = coordsRef.current;
    const origin = originRef.current;
    const pillars = pillarsRef.current;
    if (
      !root ||
      !stage ||
      !videoWrap ||
      !plate ||
      !atmosphere ||
      !overlay ||
      !brand ||
      !brandDisplay ||
      !brandMark ||
      !cue ||
      !coords ||
      !origin ||
      !pillars
    ) {
      return;
    }

    const pillarItems = gsap.utils.toArray<HTMLElement>(
      pillars.querySelectorAll("li")
    );
    const isMobile = () => window.innerWidth < 768;
    const doc = document.documentElement;
    doc.dataset.heroExperience = "true";
    doc.dataset.heroProgress = "0";
    doc.style.setProperty("--hero-progress", "0");
    doc.style.setProperty("--nav-links-opacity", "0");

    const setProgress = (p: number) => {
      doc.style.setProperty("--hero-progress", String(p));
      doc.dataset.heroProgress =
        p >= 0.97 ? "1" : p <= 0.02 ? "0" : p.toFixed(3);
      const links = gsap.utils.clamp(0, 1, (p - 0.78) / 0.18);
      doc.style.setProperty("--nav-links-opacity", String(links));
    };

    const headerTarget = () => {
      const slot = document.querySelector<HTMLElement>("[data-nav-brand-slot]");
      const mobile = isMobile();
      const fontSize = mobile ? 19 : 21;
      if (!slot) {
        return { left: mobile ? 20 : 24, top: 34, fontSize };
      }
      const s = slot.getBoundingClientRect();
      return {
        left: s.left,
        top: s.top + s.height / 2,
        fontSize,
      };
    };

    const centerFont = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return Math.min(vw * 0.12, vh * 0.15, 172);
    };

    /** Exact visual center of the viewport */
    const placeBrandAtCenter = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      gsap.set(brand, {
        position: "fixed",
        left: vw / 2,
        top: vh / 2,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        fontSize: centerFont(),
        autoAlpha: 1,
        filter: "blur(0px)",
        lineHeight: 1,
        zIndex: 60,
        margin: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(brandDisplay, {
        letterSpacing: "-0.045em",
        fontWeight: 400,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
      });
      gsap.set(brandMark, {
        letterSpacing: "0.2em",
        fontWeight: 500,
        scale: 1,
        autoAlpha: 0,
        filter: "blur(0px)",
      });
    };

    const placeBrandAtHeader = () => {
      const t = headerTarget();
      gsap.set(brand, {
        left: t.left,
        top: t.top,
        xPercent: 0,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        fontSize: t.fontSize,
        filter: "blur(0px)",
        transformOrigin: "0% 50%",
      });
      gsap.set(brandDisplay, { autoAlpha: 0, scale: 1 });
      gsap.set(brandMark, {
        autoAlpha: 1,
        letterSpacing: "0.16em",
        scale: 1,
        filter: "blur(0px)",
      });
    };

    gsap.set(coords, { autoAlpha: 0, y: 20 });
    gsap.set(origin, { autoAlpha: 0, y: 28 });
    gsap.set(pillarItems, { autoAlpha: 0, y: 18 });
    gsap.set(plate, {
      autoAlpha: 0,
      clipPath: "inset(50% 50% 50% 50%)",
      scale: 1.06,
    });
    gsap.set(atmosphere, { autoAlpha: 0 });
    gsap.set(pillars, { autoAlpha: 1 });

    if (reduce) {
      setProgress(1);
      doc.style.setProperty("--nav-links-opacity", "1");
      placeBrandAtHeader();
      gsap.set(videoWrap, { scale: 1 });
      gsap.set(overlay, { opacity: 1 });
      gsap.set(cue, { autoAlpha: 0 });
      gsap.set([coords, origin, ...pillarItems], { autoAlpha: 0 });
      gsap.set(plate, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" });
      return () => {
        delete doc.dataset.heroExperience;
        delete doc.dataset.heroProgress;
        doc.style.removeProperty("--hero-progress");
        doc.style.removeProperty("--nav-links-opacity");
      };
    }

    placeBrandAtCenter();
    gsap.set(videoWrap, {
      scale: 1,
      filter: "brightness(1)",
      transformOrigin: "50% 45%",
    });
    gsap.set(overlay, { opacity: 1 });
    gsap.set(cue, { scaleY: 1, autoAlpha: 0.75, transformOrigin: "50% 0%" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "frantana-fase-c-final",
        trigger: root,
        start: "top top",
        end: MOTION.ascending.pinEnd,
        pin: stage,
        scrub: MOTION.ascending.scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          const p = Number(
            doc.style.getPropertyValue("--hero-progress") || "0"
          );
          if (p < 0.04) placeBrandAtCenter();
        },
        onUpdate: (self) => setProgress(self.progress),
        onLeave: () => {
          doc.dataset.heroProgress = "1";
          doc.style.setProperty("--nav-links-opacity", "1");
        },
        onEnterBack: () => {
          doc.dataset.heroProgress = "scrubbing";
        },
        onLeaveBack: () => {
          doc.dataset.heroProgress = "0";
          doc.style.setProperty("--nav-links-opacity", "0");
          placeBrandAtCenter();
        },
      },
    });

    // ─── 0.00–0.12 OPENING hold (perfect center) ───
    tl.to(cue, { scaleY: 0.55, duration: 0.1 }, 0);
    tl.to(atmosphere, { autoAlpha: 0.15, duration: 0.12 }, 0);

    // ─── 0.12 ASCEND + coords ───
    tl.to(
      brand,
      {
        top: () => window.innerHeight * 0.36,
        scale: 1.04,
        duration: 0.16,
      },
      0.12
    );
    tl.to(brandDisplay, { letterSpacing: "-0.02em", duration: 0.16 }, 0.12);
    tl.to(
      videoWrap,
      { scale: 1.035, filter: "brightness(0.94)", duration: 0.2 },
      0.12
    );
    tl.to(atmosphere, { autoAlpha: 0.35, duration: 0.2 }, 0.12);
    tl.to(coords, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.18);
    tl.to(cue, { scaleY: 0.15, autoAlpha: 0.35, duration: 0.12 }, 0.2);

    // ─── 0.32 ORIGIN ───
    tl.to(
      brand,
      {
        top: () => window.innerHeight * (isMobile() ? 0.24 : 0.28),
        fontSize: () => centerFont() * 0.88,
        scale: 1,
        duration: 0.18,
      },
      0.32
    );
    tl.to(
      brandDisplay,
      { letterSpacing: "0em", duration: 0.18 },
      0.32
    );
    tl.to(origin, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.34);
    tl.to(
      plate,
      {
        autoAlpha: isMobile() ? 0.2 : 0.32,
        clipPath: "inset(12% 18% 28% 18%)",
        scale: 1.03,
        duration: 0.24,
      },
      0.32
    );
    tl.to(
      videoWrap,
      { scale: 1.055, filter: "brightness(0.88)", duration: 0.24 },
      0.32
    );
    tl.to(atmosphere, { autoAlpha: 0.5, duration: 0.24 }, 0.32);
    tl.to(cue, { scaleY: 0, autoAlpha: 0, duration: 0.08 }, 0.36);

    // ─── 0.48 TYPE MORPH (evident Cormorant → Outfit) + pillars ───
    // Beat A: serif stretches / softens
    tl.to(
      brandDisplay,
      {
        letterSpacing: "0.06em",
        scale: 1.06,
        filter: "blur(1.5px)",
        duration: 0.1,
      },
      0.48
    );
    // Beat B: Outfit arrives, Cormorant exits — overlapping window
    tl.to(
      brandMark,
      {
        autoAlpha: 1,
        scale: 1,
        letterSpacing: "0.16em",
        filter: "blur(0px)",
        duration: 0.14,
      },
      0.54
    );
    tl.to(
      brandDisplay,
      {
        autoAlpha: 0,
        scale: 1.12,
        letterSpacing: "0.14em",
        filter: "blur(4px)",
        duration: 0.14,
      },
      0.54
    );
    tl.to(
      brand,
      {
        top: () => window.innerHeight * (isMobile() ? 0.15 : 0.18),
        left: () =>
          isMobile()
            ? window.innerWidth / 2
            : headerTarget().left + Math.min(90, window.innerWidth * 0.05),
        xPercent: () => (isMobile() ? -50 : -28),
        fontSize: () => headerTarget().fontSize * (isMobile() ? 2.2 : 2.75),
        transformOrigin: "0% 50%",
        duration: 0.22,
      },
      0.48
    );

    if (!isMobile()) {
      tl.to(
        pillarItems,
        { autoAlpha: 0.85, y: 0, duration: 0.1, stagger: 0.045 },
        0.52
      );
    }

    tl.to(
      plate,
      {
        autoAlpha: isMobile() ? 0.25 : 0.4,
        clipPath: "inset(6% 10% 18% 10%)",
        scale: 1,
        duration: 0.2,
      },
      0.5
    );
    tl.to(
      videoWrap,
      {
        scale: MOTION.ascending.videoScale,
        filter: "brightness(0.82)",
        duration: 0.24,
      },
      0.48
    );
    tl.to(atmosphere, { autoAlpha: 0.62, duration: 0.24 }, 0.48);

    // ─── 0.68 APPROACH — credits leave, name docks ───
    tl.to([coords, origin], { autoAlpha: 0, y: -18, duration: 0.12 }, 0.68);
    tl.to(
      pillarItems,
      { autoAlpha: 0, y: -14, duration: 0.1, stagger: 0.02 },
      0.68
    );
    tl.to(
      brand,
      {
        left: () => headerTarget().left,
        top: () => headerTarget().top,
        xPercent: 0,
        yPercent: -50,
        fontSize: () => headerTarget().fontSize,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.24,
      },
      0.74
    );
    tl.to(brandMark, { letterSpacing: "0.16em", scale: 1, duration: 0.24 }, 0.74);
    tl.to(
      plate,
      {
        autoAlpha: 0.15,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.2,
      },
      0.76
    );
    tl.to(
      videoWrap,
      {
        scale: MOTION.ascending.videoScale,
        filter: "brightness(0.85)",
        duration: 0.2,
      },
      0.76
    );
    tl.to(atmosphere, { autoAlpha: 0.45, duration: 0.2 }, 0.76);

    // ─── 0.92 LAND ───
    tl.to(plate, { autoAlpha: 0.08, duration: 0.08 }, 0.92);
    tl.to(
      brand,
      {
        left: () => headerTarget().left,
        top: () => headerTarget().top,
        fontSize: () => headerTarget().fontSize,
        duration: 0.06,
      },
      0.94
    );

    const onResize = () => {
      ScrollTrigger.refresh();
      const p = Number(doc.style.getPropertyValue("--hero-progress") || "0");
      if (p >= 0.999) placeBrandAtHeader();
      else if (p <= 0.02) placeBrandAtCenter();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      tl.scrollTrigger?.kill();
      tl.kill();
      delete doc.dataset.heroExperience;
      delete doc.dataset.heroProgress;
      doc.style.removeProperty("--hero-progress");
      doc.style.removeProperty("--nav-links-opacity");
      if (brand.isConnected) {
        gsap.set(brand, { clearProps: "all" });
      }
    };
  }, [reduce, portalReady]);

  const brandNode = (
    <a
      ref={brandRef}
      href="/"
      className="hero-experience__brand"
      aria-label="Frantana — inicio"
      tabIndex={-1}
    >
      <span
        ref={brandDisplayRef}
        className="hero-experience__brand-layer hero-experience__brand-layer--display"
        aria-hidden
      >
        FRANTANA
      </span>
      <span
        ref={brandMarkRef}
        className="hero-experience__brand-layer hero-experience__brand-layer--mark"
        aria-hidden
      >
        FRANTANA
      </span>
    </a>
  );

  return (
    <section
      ref={rootRef}
      className="hero-experience"
      aria-label="Presentación Frantana"
    >
      <div ref={stageRef} className="hero-experience__stage">
        <div ref={videoWrapRef} className="hero-experience__video-wrap">
          <div className="hero-experience__video">
            {reduce ? (
              <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet={HERO_POSTER_MOBILE}
                />
                <img
                  src={HERO_POSTER}
                  alt=""
                  className="media-fill"
                  aria-hidden
                />
              </picture>
            ) : (
              <video
                ref={videoRef}
                className="media-fill"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={HERO_POSTER}
                aria-hidden
              >
                <source
                  src={HERO_VIDEO_720}
                  type="video/mp4"
                  media="(max-width: 768px)"
                />
                <source src={HERO_VIDEO} type="video/mp4" />
              </video>
            )}
          </div>

          <div ref={plateRef} className="hero-experience__plate" aria-hidden>
            <img
              src="/media/gallery/bw-stage-05.jpg"
              alt=""
              className="media-fill"
            />
          </div>

          <div
            ref={atmosphereRef}
            className="hero-experience__atmosphere"
            aria-hidden
          />
          <div ref={overlayRef} className="hero-experience__overlay" aria-hidden />
        </div>

        <div className="hero-experience__credits" aria-hidden>
          <p ref={coordsRef} className="hero-experience__coords">
            28°06′N · 15°25′W
          </p>
          <p ref={originRef} className="hero-experience__origin">
            Desde Gran Canaria
          </p>
          <ul ref={pillarsRef} className="hero-experience__pillars">
            <li>Música</li>
            <li>Show</li>
            <li>Directo</li>
          </ul>
        </div>

        <div ref={cueRef} className="hero-experience__cue" aria-hidden>
          <span className="hero-experience__cue-line" />
        </div>
      </div>

      <h1 className="sr-only">Frantana</h1>
      {portalReady ? (
        createPortal(
          brandNode,
          document.getElementById("fr-portal-root") ?? document.body
        )
      ) : null}
    </section>
  );
}
