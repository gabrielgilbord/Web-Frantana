"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  appleMapsExternalUrl,
  googleMapsEmbedUrl,
  googleMapsExternalUrl,
} from "@/lib/concerts/maps";
import {
  TICKET_CTA_LABEL,
  TICKET_STATUS_LABEL,
  canBuyTickets,
  concertDateParts,
  formatConcertLongDate,
} from "@/lib/concerts/format";
import type { Concert } from "@/types";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  concert: Concert;
  heroImage: string;
};

export function ConcertDetailExperience({ concert, heroImage }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const parts = concertDateParts(concert.date);
  const buy = canBuyTickets(concert.ticketStatus, concert.ticketUrl);
  const mapSrc = googleMapsEmbedUrl(concert);
  const coord =
    concert.lat != null && concert.lng != null
      ? `${concert.lat.toFixed(4)} · ${concert.lng.toFixed(4)}`
      : null;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const heroImg = root.querySelector<HTMLElement>("[data-concert-hero-img]");
      const heroVeil = root.querySelector<HTMLElement>("[data-concert-hero-veil]");
      const back = root.querySelector<HTMLElement>("[data-concert-back]");
      const stack = root.querySelectorAll<HTMLElement>("[data-concert-hero-item]");
      const mapBlock = root.querySelector<HTMLElement>("[data-concert-map]");
      const mapPin = root.querySelector<HTMLElement>("[data-concert-pin]");
      const mapFrame = root.querySelector<HTMLElement>("[data-concert-map-frame]");

      if (reduce) {
        gsap.set([heroImg, heroVeil, back, ...stack, mapBlock, mapPin, mapFrame], {
          clearProps: "all",
          autoAlpha: 1,
        });
        return;
      }

      gsap.set(heroImg, { scale: 1.08, autoAlpha: 0 });
      gsap.set(heroVeil, { autoAlpha: 0 });
      gsap.set(back, { autoAlpha: 0, y: -8 });
      gsap.set(stack, { autoAlpha: 0, y: 36 });
      gsap.set(mapBlock, { autoAlpha: 0, y: 48 });
      gsap.set(mapPin, { scale: 0, autoAlpha: 0 });
      gsap.set(mapFrame, { clipPath: "inset(100% 0% 0% 0%)" });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to(heroImg, { autoAlpha: 1, scale: 1, duration: 1.4 }, 0)
        .to(heroVeil, { autoAlpha: 1, duration: 1.1 }, 0.15)
        .to(back, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.35)
        .to(
          stack,
          { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1 },
          0.45
        );

      if (mapBlock) {
        gsap.timeline({
          scrollTrigger: {
            trigger: mapBlock,
            start: "top 78%",
            end: "top 35%",
            scrub: 0.65,
          },
        })
          .to(mapBlock, { autoAlpha: 1, y: 0, ease: "none" }, 0)
          .to(mapPin, { scale: 1, autoAlpha: 1, ease: "back.out(1.6)" }, 0.25)
          .to(
            mapFrame,
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
            0.35
          );
      }
    }, root);

    return () => ctx.revert();
  }, [concert.id]);

  return (
    <div ref={rootRef} className="concert-night">
      <section className="concert-night__hero" aria-labelledby="concert-title">
        <div className="concert-night__hero-media" aria-hidden>
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="concert-night__hero-img"
            data-concert-hero-img
          />
          <div className="concert-night__hero-veil" data-concert-hero-veil />
        </div>

        <div className="concert-night__hero-inner">
          <Link href="/conciertos" className="concert-night__back" data-concert-back>
            ← Agenda
          </Link>

          <div className="concert-night__hero-copy">
            <p className="concert-night__eyebrow" data-concert-hero-item>
              FRANTANA EN VIVO
            </p>
            <time
              className="concert-night__date-stack"
              dateTime={concert.date}
              data-concert-hero-item
            >
              <span className="concert-night__day">{parts.day}</span>
              <span className="concert-night__month">{parts.month}</span>
              <span className="concert-night__year">{parts.year}</span>
            </time>
            <p className="concert-night__long-date" data-concert-hero-item>
              {formatConcertLongDate(concert.date)}
            </p>
            <h1 id="concert-title" className="concert-night__title" data-concert-hero-item>
              {concert.title}
            </h1>
            <p className="concert-night__venue" data-concert-hero-item>
              {concert.venue}
            </p>
            <p className="concert-night__city" data-concert-hero-item>
              {concert.city}
            </p>
            {concert.time && (
              <p className="concert-night__time" data-concert-hero-item>
                {concert.time} h
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="concert-night__body">
        <div className="concert-night__editorial">
          <div className="concert-night__facts">
            <div className="concert-night__fact">
              <span className="concert-night__fact-k">Fecha</span>
              <span className="concert-night__fact-v">
                {parts.day} {parts.month} {parts.year}
              </span>
            </div>
            {concert.time && (
              <div className="concert-night__fact">
                <span className="concert-night__fact-k">Hora</span>
                <span className="concert-night__fact-v">{concert.time} h</span>
              </div>
            )}
            <div className="concert-night__fact">
              <span className="concert-night__fact-k">Lugar</span>
              <span className="concert-night__fact-v">{concert.venue}</span>
            </div>
            <div className="concert-night__fact">
              <span className="concert-night__fact-k">Ciudad</span>
              <span className="concert-night__fact-v">{concert.city}</span>
            </div>
            <div className="concert-night__fact">
              <span className="concert-night__fact-k">Entradas</span>
              <span className="concert-night__fact-v">
                {TICKET_STATUS_LABEL[concert.ticketStatus]}
              </span>
            </div>
          </div>

          {concert.notes && (
            <p className="concert-night__notes">{concert.notes}</p>
          )}

          <div className="concert-night__actions">
            {buy ? (
              <a
                href={concert.ticketUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="concert-night__cta"
              >
                {TICKET_CTA_LABEL[concert.ticketStatus]} →
              </a>
            ) : (
              <span className="concert-night__cta concert-night__cta--ghost">
                {TICKET_CTA_LABEL[concert.ticketStatus]}
              </span>
            )}
          </div>
        </div>

        <section
          className="concert-night__where"
          aria-labelledby="concert-where"
          data-concert-map
        >
          <p className="concert-night__where-kicker">Dónde sucede</p>
          <p className="concert-night__where-label">Venue</p>
          <h2 id="concert-where" className="concert-night__where-title">
            {concert.venue}
          </h2>
          <p className="concert-night__where-city">{concert.city}</p>
          {coord && (
            <p className="concert-night__coord" data-concert-pin>
              <span className="concert-night__coord-dot" aria-hidden />
              {coord}
            </p>
          )}

          <div className="concert-night__map-stage" data-concert-map-frame>
            <iframe
              title={`Mapa · ${concert.venue}, ${concert.city}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="concert-night__map-links">
            <a
              href={googleMapsExternalUrl(concert)}
              target="_blank"
              rel="noopener noreferrer"
              className="concert-night__map-link"
            >
              Cómo llegar →
            </a>
            <a
              href={appleMapsExternalUrl(concert)}
              target="_blank"
              rel="noopener noreferrer"
              className="concert-night__map-link"
            >
              Abrir en Maps ↗
            </a>
          </div>
        </section>
      </section>
    </div>
  );
}
