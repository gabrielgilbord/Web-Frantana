import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { AgendaChapter } from "@/components/experience/AgendaChapter";
import { MusicaChapter } from "@/components/experience/MusicaChapter";
import { getSocialLinks } from "@/lib/social";
import type { Concert, GalleryImage, SiteContent } from "@/types";

type Props = {
  content: SiteContent;
  gallery: GalleryImage[];
  concerts: Concert[];
};

export function HomeNarrative({ content, gallery, concerts }: Props) {
  const social = getSocialLinks(content);
  const portraits = gallery.slice(0, 6);
  // Real Frantana assets only — no stock "studio" imagery
  const presencia = [
    gallery[1] ?? gallery[0],
    gallery[2] ?? gallery[0],
    gallery[4] ?? gallery[0],
  ].filter(Boolean) as GalleryImage[];
  const directo = [
    gallery[3] ?? gallery[0],
    gallery[5] ?? gallery[1],
    gallery[7] ?? gallery[2],
  ].filter(Boolean) as GalleryImage[];
  const piel = portraits.length >= 4 ? portraits : portraits;

  return (
    <div className="home-narrative">
      {/* 01 — DESDE GRAN CANARIA */}
      <section className="chapter chapter--canaria" aria-labelledby="ch-01">
        <div className="chapter__media chapter__media--canaria" aria-hidden>
          <MediaReveal
            src="/media/editorial/gran-canaria.jpg"
            alt=""
            className="absolute inset-0 h-full w-full chapter__media-img"
            sizes="100vw"
            parallax
            priority
          />
          <div className="chapter__media-veil" />
        </div>
        <Reveal className="chapter__content chapter__content--canaria" y={40}>
          <p className="chapter__index">01 — Origen</p>
          <h2 id="ch-01" className="chapter__title">
            {content.homeIntroTitle}
          </h2>
          <p className="chapter__body">{content.homeIntroBody}</p>
          <p className="chapter__bridge">De aquí nace FRANTANA</p>
        </Reveal>
        <p className="chapter__island" aria-hidden>
          Isla
        </p>
      </section>

      {/* 02 — LA FIRMA */}
      <section className="chapter chapter--firma" aria-labelledby="ch-02">
        <Reveal className="order-2 md:order-1" y={36}>
          <p className="chapter__index">02 — La firma</p>
          <h2 id="ch-02" className="chapter__title">
            Quién es Frantana
          </h2>
          <p className="chapter__body">{content.aboutBody}</p>
          <p className="chapter__body" style={{ marginTop: "1rem" }}>
            {content.aboutStoryBody}
          </p>
        </Reveal>
        <Reveal
          className="order-1 md:order-2 chapter__portrait relative overflow-hidden"
          delay={0.08}
          y={48}
        >
          <MediaReveal
            src={gallery[0]?.src ?? "/media/brand/profile.jpg"}
            alt={gallery[0]?.alt ?? "Frantana"}
            className="absolute inset-0 h-full w-full"
            sizes="(max-width: 900px) 100vw, 42vw"
            parallax
            priority
          />
        </Reveal>
      </section>

      {/* 03 — MÚSICA */}
      <MusicaChapter content={content} />

      {/* 04 — PRESENCIA */}
      <section className="chapter chapter--oficio" aria-labelledby="ch-04">
        <Reveal y={32}>
          <p className="chapter__index">04 — Presencia</p>
          <h2 id="ch-04" className="chapter__title">
            En escena
          </h2>
          <p className="chapter__body">
            Años de escenario, agrupaciones y público real. La escena es el
            centro: show, voz y conexión.
          </p>
        </Reveal>
        {presencia.length > 0 && (
          <div className="chapter__rail">
            {presencia.map((item, i) => (
              <Reveal
                key={item.id}
                className="chapter__tile"
                delay={i * 0.07}
                y={48}
              >
                <MediaReveal
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 h-full w-full"
                  sizes="(max-width: 768px) 50vw, 30vw"
                  parallax={i === 1}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* 05 — EL DIRECTO */}
      <section className="chapter chapter--directo" aria-labelledby="ch-05">
        <Reveal className="chapter__intro" y={28}>
          <p className="chapter__index">05 — El directo</p>
          <h2 id="ch-05" className="chapter__title">
            Luces. Público. Acción.
          </h2>
        </Reveal>
        {directo.length > 0 && (
          <div className="chapter__blast">
            <Reveal className="chapter__blast-main" y={56} delay={0.04}>
              <MediaReveal
                src={directo[0].src}
                alt={directo[0].alt}
                className="absolute inset-0 h-full w-full"
                sizes="(max-width: 768px) 100vw, 60vw"
                parallax
              />
            </Reveal>
            <div className="chapter__blast-side">
              {directo[1] && (
                <Reveal y={40} delay={0.08}>
                  <MediaReveal
                    src={directo[1].src}
                    alt={directo[1].alt}
                    className="absolute inset-0 h-full w-full min-h-[28svh]"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </Reveal>
              )}
              {directo[2] && (
                <Reveal y={40} delay={0.12}>
                  <MediaReveal
                    src={directo[2].src}
                    alt={directo[2].alt}
                    className="absolute inset-0 h-full w-full min-h-[28svh]"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </Reveal>
              )}
            </div>
          </div>
        )}
        <p className="chapter__word" aria-hidden>
          EN VIVO
        </p>
      </section>

      {/* 06 — LA AGENDA */}
      <AgendaChapter
        concerts={concerts}
        content={content}
        atmosphereSrcs={[
          ...directo.map((d) => d.src),
          ...gallery.slice(0, 6).map((g) => g.src),
        ].filter(Boolean)}
      />

      {/* 07 — LA PIEL */}
      <section className="chapter chapter--piel" aria-labelledby="ch-07">
        <Reveal className="chapter__intro" y={28}>
          <p className="chapter__index">07 — La piel</p>
          <h2 id="ch-07" className="chapter__title">
            Identidad, noche, Canarias
          </h2>
          <p className="chapter__body">
            Personas, estilo y energía. Fragmentos del mundo Frantana.
          </p>
        </Reveal>
        <div className="piel-strip" role="list">
          {piel.slice(0, 6).map((img, i) => (
            <Reveal
              key={img.id}
              className="piel-frame"
              delay={i * 0.05}
              y={36}
              as="figure"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 58vw, 22rem"
                className="object-cover"
              />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 px-[var(--space-gutter)]" delay={0.1}>
          <div className="chapter--piel__continue">
            <Link
              href="/galeria"
              className="chapter__ghost"
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--fr-fog)",
                textDecoration: "none",
              }}
            >
              Ver galería →
            </Link>
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="chapter__ghost"
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--fr-fog)",
                  textDecoration: "none",
                }}
              >
                Instagram @frantana →
              </a>
            )}
          </div>
        </Reveal>
      </section>

      {/* 08 — LA LLAMADA */}
      <section className="chapter chapter--llamada" aria-labelledby="ch-08">
        <Reveal y={36}>
          <p className="chapter__index">08 — La llamada</p>
          <h2 id="ch-08" className="chapter__title">
            ¿Nos vemos en el próximo escenario?
          </h2>
          <p className="chapter__body" style={{ marginInline: "auto" }}>
            Contrataciones, prensa o simplemente saludar. La puerta del
            camerino está abierta.
          </p>
          <div className="chapter__actions">
            {content.contactEmail && (
              <a
                className="chapter__link"
                href={`mailto:${content.contactEmail}`}
              >
                {content.contactEmail}
              </a>
            )}
            {social.instagram && (
              <a
                className="chapter__ghost"
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
            {social.facebook && (
              <a
                className="chapter__ghost"
                href={social.facebook}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            )}
            <Link className="chapter__ghost" href="/contacto">
              Contacto
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
