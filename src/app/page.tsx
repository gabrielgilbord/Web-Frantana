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
      <div className="hero-plane" aria-busy="true" aria-label="Cargando presentación" />
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

      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-10 md:grid-cols-12 md:items-end md:gap-8">
          <Reveal className="md:col-span-5">
            <h2 className="display-title text-[clamp(2.75rem,8vw,5.5rem)]">
              {content.homeIntroTitle}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
            <p
              className={
                content.homeIntroBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional"
                  : "prose-editorial"
              }
            >
              {content.homeIntroBody}
            </p>
            <div className="mt-7">
              <Button href="/sobre" variant="outline" size="sm">
                Conocer más
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad surface-beige">
        <div className="container-editorial grid gap-10 md:grid-cols-12 md:items-center">
          <Reveal className="order-2 md:order-1 md:col-span-6">
            <MediaReveal
              src="/media/editorial/vinyl-close.jpg"
              alt="Detalle editorial de vinilo — fotografía de archivo (placeholder)"
              className="aspect-[4/5] w-full"
              parallax
            />
          </Reveal>
          <Reveal className="order-1 md:order-2 md:col-span-5 md:col-start-8" delay={0.08}>
            <h2 className="display-title text-[clamp(2.75rem,8vw,5rem)]">Música</h2>
            <p
              className={
                content.musicIntro.includes("[TEXTO PROVISIONAL]")
                  ? "provisional mt-5"
                  : "prose-editorial mt-5"
              }
            >
              {content.musicIntro}
            </p>
            <div className="mt-7">
              <Button href="/musica" variant="solid" size="sm">
                Escuchar música
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <ConcertPreview concerts={upcoming} />

      {editorial && (
        <section className="relative">
          <MediaReveal
            src={editorial.src}
            alt={editorial.alt}
            className="min-h-[70svh] w-full md:min-h-[80svh]"
            sizes="100vw"
            parallax
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(23,20,17,0.78))]" />
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="container-editorial pb-10 pt-24 md:pb-14">
              <Reveal>
                <p className="max-w-md text-sm text-ivory/85">
                  Fotografía editorial de archivo. Las imágenes oficiales del artista
                  sustituirán estos placeholders.
                </p>
                <div className="mt-5">
                  <Button href="/galeria" variant="on-dark-outline" size="sm">
                    Ver galería
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      <section className="section-pad surface-ivory">
        <div className="container-editorial flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-title max-w-xl text-[clamp(2.75rem,8vw,5.5rem)]">
              En escena y en estudio
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Button href="/contacto" variant="solid" size="sm">
              Contacto
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
