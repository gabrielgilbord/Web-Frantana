import { getContent } from "@/lib/content/store";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { Button } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Música",
  description: "Escucha la música de Frantana en plataformas oficiales.",
});

export default async function MusicaPage() {
  const content = await getContent();
  const platforms = [
    { label: "Spotify", href: content.social.spotify ?? content.spotifyArtistUrl },
    { label: "Apple Music", href: content.social.appleMusic },
    { label: "YouTube", href: content.social.youtube },
  ].filter((p) => Boolean(p.href));

  return (
    <div className="pt-[var(--header-h)]">
      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-10 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-6">
            <h1 className="display-title text-[clamp(3rem,12vw,7rem)]">Música</h1>
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8" delay={0.06}>
            <p
              className={
                content.musicIntro.includes("[TEXTO PROVISIONAL]")
                  ? "provisional"
                  : "prose-editorial"
              }
            >
              {content.musicIntro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <MediaReveal
          src="/media/editorial/vinyl-close.jpg"
          alt="Detalle de vinilo — fotografía editorial de archivo (placeholder, no representa a Frantana)"
          className="min-h-[48svh] w-full md:min-h-[62svh]"
          sizes="100vw"
          parallax
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(23,20,17,0.15)_0%,rgba(23,20,17,0.55)_100%)]" />
      </section>

      <section className="section-pad surface-beige">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            {content.spotifyEmbedUrl ? (
              <div className="overflow-hidden bg-ivory">
                <iframe
                  title="Reproductor de Spotify de Frantana"
                  src={content.spotifyEmbedUrl}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full border-0"
                />
              </div>
            ) : (
              <div className="bg-ivory px-6 py-14 md:px-10">
                <p className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
                  Escuchar
                </p>
                <p className="provisional mt-5 max-w-md">
                  [PROVISIONAL] Aún no hay embed de Spotify configurado. Añade la
                  URL de embed oficial desde el panel. No se inventan canciones ni
                  álbumes.
                </p>
              </div>
            )}
          </Reveal>

          <Reveal className="md:col-span-4 md:col-start-9" delay={0.08}>
            <h2 className="font-display text-[1.75rem] leading-tight md:text-[2rem]">
              Plataformas
            </h2>
            <div className="mt-6 flex flex-col items-start gap-3">
              {platforms.length ? (
                platforms.map((p) => (
                  <Button key={p.label} href={p.href!} variant="outline" size="sm">
                    {p.label}
                  </Button>
                ))
              ) : (
                <p className="provisional">
                  [PROVISIONAL] Enlaces a plataformas pendientes de configurar.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-5 md:grid-cols-12">
          <MediaReveal
            src="/media/editorial/studio-headphones.jpg"
            alt="Auriculares de estudio — fotografía editorial de archivo (placeholder)"
            className="aspect-[5/4] md:col-span-7"
          />
          <MediaReveal
            src="/media/editorial/piano-keys.jpg"
            alt="Teclas de piano — fotografía editorial de archivo (placeholder)"
            className="aspect-[4/5] md:col-span-4 md:col-start-9 md:mt-20"
          />
        </div>
      </section>
    </div>
  );
}
