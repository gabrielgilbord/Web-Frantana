import dynamic from "next/dynamic";
import { getContent, getConcerts, getGallery, splitConcerts } from "@/lib/content/store";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { ConcertPreview } from "@/components/concerts/ConcertList";
import { buildMetadata } from "@/lib/seo/metadata";

const HeroCinematic = dynamic(
  () =>
    import("@/components/hero/HeroCinematic").then((m) => m.HeroCinematic),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-[100svh] bg-ink"
        aria-busy="true"
        aria-label="Cargando presentación"
      />
    ),
  }
);

export const metadata = buildMetadata({
  title: "Frantana",
  description: "Web oficial de Frantana — música, conciertos y novedades.",
});

export default async function HomePage() {
  const [content, concerts, gallery] = await Promise.all([
    getContent(),
    getConcerts(),
    getGallery(),
  ]);
  const { upcoming } = splitConcerts(concerts);
  const editorial = gallery[0];

  return (
    <>
      <HeroCinematic subtitle={content.heroSubtitle} />

      <section className="section-pad">
        <div className="container-editorial grid gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5">
            <h2 className="display-title text-5xl md:text-6xl lg:text-7xl">
              {content.homeIntroTitle}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.12}>
            <p
              className={
                content.homeIntroBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional prose-editorial"
                  : "prose-editorial"
              }
            >
              {content.homeIntroBody}
            </p>
            <div className="mt-8">
              <Button href="/sobre" variant="ghost">
                Conocer más
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-beige/35 section-pad">
        <div className="container-editorial grid items-end gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <h2 className="display-title text-5xl md:text-6xl">Música</h2>
            <p
              className={
                content.musicIntro.includes("[TEXTO PROVISIONAL]")
                  ? "provisional mt-5"
                  : "prose-editorial mt-5"
              }
            >
              {content.musicIntro}
            </p>
            <div className="mt-8">
              <Button href="/musica" variant="primary">
                Escuchar
              </Button>
            </div>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
            <MediaReveal
              src="/media/editorial/vinyl-close.jpg"
              alt="Detalle editorial de vinilo — fotografía de archivo (placeholder)"
              className="aspect-[4/5] w-full"
              parallax
            />
          </Reveal>
        </div>
      </section>

      <ConcertPreview concerts={upcoming} />

      {editorial && (
        <section className="relative">
          <MediaReveal
            src={editorial.src}
            alt={editorial.alt}
            className="aspect-[16/9] w-full md:aspect-[21/9]"
            sizes="100vw"
            parallax
          />
          <div className="container-editorial absolute inset-x-0 bottom-0 z-10 pb-10 pt-24 bg-[linear-gradient(180deg,transparent,rgba(23,20,17,0.72))]">
            <Reveal>
              <p className="max-w-md text-sm text-ivory/85">
                Fotografía editorial de archivo. Las imágenes oficiales del artista
                sustituirán estos placeholders.
              </p>
              <div className="mt-4">
                <Button href="/galeria" variant="secondary">
                  Galería
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-editorial flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-title max-w-xl text-5xl md:text-7xl">
              Síguelo en escena y en estudio
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/contacto" variant="primary">
              Contacto
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
