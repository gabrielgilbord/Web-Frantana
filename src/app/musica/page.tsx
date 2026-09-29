import { getContent } from "@/lib/content/store";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/Reveal";
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
      <section className="section-pad">
        <div className="container-editorial max-w-3xl">
          <Reveal>
            <h1 className="display-title text-6xl md:text-8xl">Música</h1>
            <p
              className={
                content.musicIntro.includes("[TEXTO PROVISIONAL]")
                  ? "provisional mt-6"
                  : "prose-editorial mt-6"
              }
            >
              {content.musicIntro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-[var(--space-section)]">
        <div className="container-editorial">
          {content.spotifyEmbedUrl ? (
            <Reveal>
              <div className="overflow-hidden border border-line bg-beige/40">
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
            </Reveal>
          ) : (
            <Reveal>
              <div className="border border-line px-6 py-12 md:px-10">
                <p className="provisional">
                  [PROVISIONAL] Aún no hay embed de Spotify configurado. Añade la
                  URL de embed oficial desde el panel de administración. No se
                  inventan canciones ni álbumes.
                </p>
              </div>
            </Reveal>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            {platforms.length ? (
              platforms.map((p) => (
                <Button key={p.label} href={p.href!} variant="ghost">
                  {p.label}
                </Button>
              ))
            ) : (
              <p className="provisional">
                [PROVISIONAL] Enlaces a plataformas pendientes de configurar.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
