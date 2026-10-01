import { getContent } from "@/lib/content/store";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { Button } from "@/components/ui/Button";
import { SpotifyEmbed } from "@/components/ui/SpotifyEmbed";
import { FaSpotify } from "react-icons/fa6";

export const metadata = buildMetadata({
  title: "Música",
  description: "Escucha la música de Frantana en plataformas oficiales.",
});

export default async function MusicaPage() {
  const content = await getContent();
  const platforms = [
    {
      label: "Spotify",
      href: content.social.spotify ?? content.spotifyArtistUrl,
      icon: true,
    },
    { label: "Apple Music", href: content.social.appleMusic, icon: false },
    { label: "YouTube", href: content.social.youtube, icon: false },
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
          src="/media/gallery/frantana/06.jpg"
          alt="Frantana en concierto"
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
              <SpotifyEmbed
                embedUrl={content.spotifyEmbedUrl}
                className="spotify-embed"
                height={352}
              />
            ) : (
              <div className="bg-stage px-6 py-14 ring-1 ring-line md:px-10">
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
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fog">
              Escúchalo donde quieras. Enlaces oficiales al perfil.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3">
              {platforms.length ? (
                platforms.map((p) => (
                  <Button
                    key={p.label}
                    href={p.href!}
                    variant="ink-outline"
                    size="sm"
                    className="min-w-[11rem] justify-start"
                  >
                    {p.icon ? <FaSpotify aria-hidden size={16} /> : null}
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
            src="/media/gallery/frantana/02.jpg"
            alt="Frantana — fotografía oficial"
            className="aspect-[5/4] md:col-span-7"
          />
          <MediaReveal
            src="/media/gallery/frantana/05.jpg"
            alt="Frantana — fotografía oficial"
            className="aspect-[4/5] md:col-span-4 md:col-start-9 md:mt-20"
          />
        </div>
      </section>
    </div>
  );
}
