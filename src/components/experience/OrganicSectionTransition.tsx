"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Variant = "pliegue" | "telon";

type Props = {
  variant: Variant;
  from: string;
  to: string;
  className?: string;
};

/**
 * Compact organic section edge for FRANTANA.
 * ~120–180px visual band. No pin. No full-viewport takeover.
 */
export function OrganicSectionTransition({
  variant,
  from,
  to,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const shadeId = `ob-shade-${uid}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const edgeA = root.querySelector<SVGPathElement>("[data-ob-edge-a]");
    const edgeB = root.querySelector<SVGPathElement>("[data-ob-edge-b]");
    const depth = root.querySelector<SVGPathElement>("[data-ob-depth]");
    const band = root.querySelector<HTMLElement>("[data-ob-band]");

    const ctx = gsap.context(() => {
      if (reduce) {
        if (edgeA) gsap.set(edgeA, { autoAlpha: 0 });
        if (edgeB) gsap.set(edgeB, { autoAlpha: 1 });
        if (depth) gsap.set(depth, { autoAlpha: 0.22 });
        return;
      }

      if (edgeA) gsap.set(edgeA, { autoAlpha: 1 });
      if (edgeB) gsap.set(edgeB, { autoAlpha: 0 });
      if (depth) gsap.set(depth, { autoAlpha: 0.08 });
      if (band) gsap.set(band, { y: 10 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          end: "bottom 35%",
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      });

      if (band) tl.to(band, { y: 0, duration: 1 }, 0);
      if (edgeA && edgeB) {
        tl.to(edgeA, { autoAlpha: 0, duration: 0.55 }, 0.15);
        tl.to(edgeB, { autoAlpha: 1, duration: 0.55 }, 0.2);
      }
      if (depth) {
        tl.to(depth, { autoAlpha: 0.28, duration: 0.4 }, 0.1);
        tl.to(depth, { autoAlpha: 0.12, duration: 0.35 }, 0.65);
      }
    }, root);

    return () => ctx.revert();
  }, [variant]);

  const paths = variant === "pliegue" ? PLIEGUE : TELON;

  return (
    <div
      ref={rootRef}
      className={`organic-bridge organic-bridge--${variant} ${className}`.trim()}
      style={{ "--ob-from": from, "--ob-to": to } as CSSProperties}
      aria-hidden
    >
      <div className="organic-bridge__band" data-ob-band>
        <div className="organic-bridge__from" />
        <svg
          className="organic-bridge__svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(26,22,18,0.16)" />
              <stop offset="100%" stopColor="rgba(26,22,18,0)" />
            </linearGradient>
          </defs>
          <path data-ob-edge-a d={paths.a} fill="var(--ob-to)" />
          <path data-ob-edge-b d={paths.b} fill="var(--ob-to)" />
          <path data-ob-depth d={paths.shade} fill={`url(#${shadeId})`} />
        </svg>
      </div>
    </div>
  );
}

/** Compact asymmetric fold — scenic apron, not a stock wave */
const PLIEGUE = {
  a: "M0,48 C160,28 280,72 420,52 C560,30 680,12 820,40 C960,70 1100,88 1240,58 C1340,38 1400,28 1440,36 L1440,120 L0,120 Z",
  b: "M0,32 C170,58 290,18 440,46 C590,78 720,14 860,42 C1000,72 1140,92 1280,52 C1360,32 1410,26 1440,34 L1440,120 L0,120 Z",
  shade:
    "M0,44 C160,28 280,68 420,50 C560,30 680,16 820,38 C960,66 1100,82 1240,56 C1340,40 1400,30 1440,36 L1440,68 C1400,58 1340,64 1240,78 C1100,96 960,86 820,68 C680,50 560,62 420,74 C280,86 160,64 0,70 Z",
};

const TELON = {
  a: "M0,56 C200,40 400,68 600,50 C820,30 1040,26 1220,44 C1340,56 1400,62 1440,54 L1440,120 L0,120 Z",
  b: "M0,38 C220,52 420,24 640,40 C860,58 1060,70 1240,44 C1360,28 1410,34 1440,40 L1440,120 L0,120 Z",
  shade:
    "M0,52 C200,40 400,64 600,48 C820,32 1040,30 1220,44 C1340,54 1400,58 1440,52 L1440,78 C1400,80 1340,76 1220,68 C1040,56 860,70 640,62 C420,54 220,68 0,66 Z",
};
