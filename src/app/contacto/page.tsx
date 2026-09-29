import { getContent } from "@/lib/content/store";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contacto",
  description: "Contacto y redes de Frantana.",
});

export default async function ContactoPage() {
  const content = await getContent();
  const socials = [
    { label: "Instagram", href: content.social.instagram },
    { label: "Facebook", href: content.social.facebook },
    { label: "Spotify", href: content.social.spotify ?? content.spotifyArtistUrl },
    { label: "YouTube", href: content.social.youtube },
    { label: "TikTok", href: content.social.tiktok },
    { label: "Apple Music", href: content.social.appleMusic },
  ].filter((s) => Boolean(s.href));

  return (
    <div className="pt-[var(--header-h)]">
      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <h1 className="display-title text-[clamp(3rem,12vw,7rem)]">
              Contacto
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-taupe-dark">
              Gestión, prensa y colaboraciones. Los datos se editan desde el panel
              administrativo.
            </p>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7 space-y-10" delay={0.06}>
            <div>
              <h2 className="font-display text-2xl">Correo</h2>
              {content.contactEmail ? (
                <a
                  href={`mailto:${content.contactEmail}`}
                  className="mt-2 inline-block text-lg no-underline hover:opacity-70"
                >
                  {content.contactEmail}
                </a>
              ) : (
                <p className="provisional mt-2">
                  [PROVISIONAL] Correo pendiente de configurar en el panel.
                </p>
              )}
            </div>

            <div>
              <h2 className="font-display text-2xl">Teléfono</h2>
              {content.contactPhone ? (
                <a
                  href={`tel:${content.contactPhone.replace(/\s+/g, "")}`}
                  className="mt-2 inline-block text-lg no-underline hover:opacity-70"
                >
                  {content.contactPhone}
                </a>
              ) : (
                <p className="provisional mt-2">
                  [PROVISIONAL] Teléfono pendiente de configurar en el panel.
                </p>
              )}
            </div>

            <div>
              <h2 className="font-display text-2xl">Redes</h2>
              {socials.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <Button href={s.href!} variant="outline" size="sm">
                        {s.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="provisional mt-2">
                  [PROVISIONAL] Redes sociales pendientes de configurar.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative min-h-[45svh] md:min-h-[58svh]">
        <MediaReveal
          src="/media/editorial/crowd-hands.jpg"
          alt="Público en concierto — fotografía editorial de archivo (placeholder, no representa a Frantana)"
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          parallax
        />
      </section>
    </div>
  );
}
