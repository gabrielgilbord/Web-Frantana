"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Concert, SiteContent } from "@/types";
import { isUpcomingConcertDate } from "@/lib/concerts/date";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  concerts: Concert[];
  content: SiteContent;
  /** Stage stills for each stop (from gallery). */
  atmosphereSrcs?: string[];
};

type DateParts = {
  day: string;
  month: string;
  year: string;
};

type TourItem =
  | { kind: "year"; year: string; key: string }
  | { kind: "stop"; concert: Concert; key: string; parts: DateParts };

function upcomingConcerts(concerts: Concert[]) {
  return concerts
    .filter((c) => isUpcomingConcertDate(c.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function dateParts(iso: string): DateParts {
  const d = new Date(`${iso}T12:00:00`);
  const month = d
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month,
    year: String(d.getFullYear()),
  };
}

function buildTourItems(concerts: Concert[]): TourItem[] {
  const items: TourItem[] = [];
  const years = new Set(concerts.map((c) => c.date.slice(0, 4)));
  const showYearMarks = years.size > 1 || concerts.length >= 3;
  let lastYear: string | null = null;
  for (const concert of concerts) {
    const parts = dateParts(concert.date);
    if (showYearMarks && parts.year !== lastYear) {
      items.push({
        kind: "year",
        year: parts.year,
        key: `year-${parts.year}`,
      });
      lastYear = parts.year;
    }
    items.push({
      kind: "stop",
      concert,
      key: concert.id,
      parts,
    });
  }
  return items;
}

/**
 * Chapter 06 — La Agenda.
 * Tour Line: scroll-scrubbed editorial timeline (not a SaaS calendar).
 */
export function AgendaChapter({
  concerts,
  content,
  atmosphereSrcs = [],
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLDivElement>(null);
  const [hotId, setHotId] = useState<string | null>(null);

  const upcoming = useMemo(
    () => upcomingConcerts(concerts),
    [concerts]
  );
  const items = useMemo(() => buildTourItems(upcoming), [upcoming]);
  const contactHref = content.contactEmail
    ? `mailto:${content.contactEmail}`
    : "/contacto";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const lineFill = lineFillRef.current;
      const bead = beadRef.current;
      const eyebrow = root.querySelector<HTMLElement>("[data-tour-eyebrow]");
      const title = root.querySelector<HTMLElement>("[data-tour-title]");
      const lede = root.querySelector<HTMLElement>("[data-tour-lede]");
      const rail = root.querySelector<HTMLElement>("[data-tour-rail]");
      const stops = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-tour-stop]")
      );

      if (reduce) {
        gsap.set([eyebrow, title, lede, lineFill, bead, ...stops], {
          clearProps: "all",
          autoAlpha: 1,
        });
        if (lineFill) gsap.set(lineFill, { scaleY: 1 });
        return;
      }

      gsap.set(eyebrow, { autoAlpha: 0, y: 12 });
      gsap.set(title, { autoAlpha: 0, y: 48, scale: 1.06, transformOrigin: "0% 100%" });
      gsap.set(lede, { autoAlpha: 0, y: 18 });
      if (lineFill) gsap.set(lineFill, { scaleY: 0, transformOrigin: "50% 0%" });
      if (bead) gsap.set(bead, { autoAlpha: 0, top: "0%" });

      stops.forEach((stop) => {
        const date = stop.querySelector<HTMLElement>("[data-tour-date]");
        const body = stop.querySelector<HTMLElement>("[data-tour-body]");
        const cta = stop.querySelector<HTMLElement>("[data-tour-cta]");
        const node = stop.querySelector<HTMLElement>("[data-tour-node]");
        gsap.set(date, { autoAlpha: 0, scale: 1.2, y: 16, transformOrigin: "0% 50%" });
        gsap.set(body, { autoAlpha: 0, x: 22 });
        gsap.set(cta, { autoAlpha: 0, x: 12 });
        gsap.set(node, { scale: 0, autoAlpha: 0 });
      });

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
          end: "top 18%",
          scrub: 0.65,
        },
      });

      intro
        .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.35 }, 0)
        .to(
          title,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
          0.08
        )
        .to(lede, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.22);

      if (lineFill) {
        intro.to(lineFill, { scaleY: 0.22, duration: 0.5, ease: "none" }, 0.12);
      }
      if (bead) {
        intro.to(bead, { autoAlpha: 1, duration: 0.25 }, 0.28);
      }

      if (rail && lineFill && bead && stops.length > 0) {
        gsap.fromTo(
          lineFill,
          { scaleY: 0.22 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: rail,
              start: "top 55%",
              end: "bottom 35%",
              scrub: 0.55,
            },
          }
        );

        gsap.fromTo(
          bead,
          { top: "0%" },
          {
            top: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: rail,
              start: "top 55%",
              end: "bottom 35%",
              scrub: 0.55,
            },
          }
        );
      } else if (lineFill && stops.length === 0) {
        gsap.set(lineFill, { scaleY: 1 });
        if (bead) gsap.set(bead, { autoAlpha: 1, top: "42%" });
      }

      // Each stop: subtle stagger into view (kept short so 4 stops don't drag)
      stops.forEach((stop) => {
        const date = stop.querySelector<HTMLElement>("[data-tour-date]");
        const body = stop.querySelector<HTMLElement>("[data-tour-body]");
        const cta = stop.querySelector<HTMLElement>("[data-tour-cta]");
        const node = stop.querySelector<HTMLElement>("[data-tour-node]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stop,
            start: "top 90%",
            end: "top 62%",
            scrub: 0.45,
          },
        });

        tl.to(node, { scale: 1, autoAlpha: 1, duration: 0.2, ease: "back.out(1.6)" }, 0)
          .to(
            date,
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.4,
              ease: "power3.out",
            },
            0.04
          )
          .to(
            body,
            { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" },
            0.14
          )
          .to(
            cta,
            { autoAlpha: 1, x: 0, duration: 0.28, ease: "power2.out" },
            0.24
          );
      });
    }, root);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [items.length]);

  return (
    <section
      ref={rootRef}
      className="chapter chapter--agenda tour-agenda"
      aria-labelledby="ch-06"
    >
      <div className="tour-agenda__grain" aria-hidden />

      <header className="tour-agenda__header">
        <p className="tour-agenda__eyebrow" data-tour-eyebrow>
          <span>06</span>
          <span className="tour-agenda__eyebrow-sep" aria-hidden />
          <span>La agenda</span>
        </p>
        <h2 id="ch-06" className="tour-agenda__title" data-tour-title>
          Próximas fechas
        </h2>
        <p className="tour-agenda__lede" data-tour-lede>
          El escenario siguiente.
        </p>
      </header>

      {upcoming.length > 0 ? (
        <div className="tour-agenda__rail" data-tour-rail>
          <div className="tour-agenda__line" aria-hidden>
            <div className="tour-agenda__line-track" />
            <div ref={lineFillRef} className="tour-agenda__line-fill" />
            <div ref={beadRef} className="tour-agenda__bead">
              <span className="tour-agenda__bead-core" />
              <span className="tour-agenda__bead-ring" />
            </div>
          </div>

          <ol className="tour-agenda__list">
            {(() => {
              let stopIndex = 0;
              return items.map((item) => {
              if (item.kind === "year") {
                return (
                  <li key={item.key} className="tour-agenda__year" aria-hidden>
                    <span className="tour-agenda__year-mark">{item.year}</span>
                  </li>
                );
              }

              const { concert, parts } = item;
              const isHot = hotId === concert.id;
              const ctaLabel = concert.ticketUrl ? "Entradas" : "Ver fecha";
              const stillSrc =
                atmosphereSrcs.length > 0
                  ? atmosphereSrcs[stopIndex % atmosphereSrcs.length]
                  : null;
              stopIndex += 1;

              return (
                <li
                  key={item.key}
                  className={
                    isHot
                      ? "tour-agenda__stop is-hot"
                      : "tour-agenda__stop"
                  }
                  data-tour-stop
                  onMouseEnter={() => setHotId(concert.id)}
                  onMouseLeave={() => setHotId(null)}
                  onFocus={() => setHotId(concert.id)}
                  onBlur={() => setHotId(null)}
                >
                  <Link
                    href={`/conciertos/${concert.id}`}
                    className="tour-agenda__hit"
                  >
                    {stillSrc && (
                      <span className="tour-agenda__atmosphere" aria-hidden>
                        <Image
                          src={stillSrc}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 100vw, 70vw"
                          className="tour-agenda__atmosphere-img"
                        />
                        <span className="tour-agenda__veil" />
                      </span>
                    )}

                    <span className="tour-agenda__node" data-tour-node aria-hidden>
                      <span className="tour-agenda__node-dot" />
                    </span>

                    <span className="tour-agenda__panel">
                      <time
                        className="tour-agenda__date"
                        dateTime={concert.date}
                        data-tour-date
                      >
                        <span className="tour-agenda__daystack">
                          <span className="tour-agenda__day">{parts.day}</span>
                          <span className="tour-agenda__month">{parts.month}</span>
                          <span className="tour-agenda__year-sm">{parts.year}</span>
                        </span>
                        {concert.time ? (
                          <span className="tour-agenda__clock">{concert.time} h</span>
                        ) : null}
                      </time>

                      <span className="tour-agenda__body" data-tour-body>
                        <span className="tour-agenda__show">{concert.title}</span>
                        <span className="tour-agenda__meta">
                          <span className="tour-agenda__venue">{concert.venue}</span>
                          <span className="tour-agenda__meta-sep" aria-hidden>
                            ·
                          </span>
                          <span className="tour-agenda__city">{concert.city}</span>
                        </span>
                      </span>

                      <span className="tour-agenda__cta" data-tour-cta>
                        <span className="tour-agenda__cta-label">{ctaLabel}</span>
                        <span className="tour-agenda__cta-arrow" aria-hidden>
                          →
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            });
            })()}
          </ol>
        </div>
      ) : (
        <div className="tour-agenda__empty" data-tour-rail>
          <div className="tour-agenda__line tour-agenda__line--empty" aria-hidden>
            <div className="tour-agenda__line-track" />
            <div
              ref={lineFillRef}
              className="tour-agenda__line-fill"
              style={{ transform: "scaleY(1)" }}
            />
            <div ref={beadRef} className="tour-agenda__bead" style={{ top: "42%" }}>
              <span className="tour-agenda__bead-core" />
              <span className="tour-agenda__bead-ring" />
            </div>
          </div>
          <p className="tour-agenda__empty-title">
            No hay ninguna fecha publicada.
          </p>
          <a href={contactHref} className="tour-agenda__empty-link">
            Escribe y preguntamos por el próximo show
            <span aria-hidden> →</span>
          </a>
        </div>
      )}

      <p className="tour-agenda__echo" aria-hidden>
        Tour
      </p>
    </section>
  );
}
