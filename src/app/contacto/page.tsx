import { getContent } from "@/lib/content/store";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Contacto",
  description:
    "Contacto y contrataciones de Frantana. Teléfono, correo y mensaje directo.",
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

  const phoneTel = content.contactPhone
    ? content.contactPhone.replace(/[^\d+]/g, "")
    : null;

  return (
    <div className="pt-[var(--header-h)] contact-page">
      <section className="section-pad surface-ivory">
        <div className="container-editorial contact-page__intro">
          <Reveal>
            <p className="contact-page__eyebrow">Contacto</p>
            <h1 className="contact-page__title">Hablemos</h1>
            <p className="contact-page__lede">
              Para contratación directa, escríbenos o deja un mensaje. Si ya
              tienes fecha en mente, mira también el calendario de reservas.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="contact-page__board section-pad">
        <div className="container-editorial contact-page__board-grid">
          <Reveal className="contact-page__direct">
            <p className="contact-page__kicker">Oficina del artista</p>
            <p className="contact-page__direct-line">
              Para contratación directa, comunícate con:
            </p>

            {content.contactPhone ? (
              <div className="contact-page__person">
                <p className="contact-page__person-role">Teléfono</p>
                <a
                  className="contact-page__phone"
                  href={`tel:${phoneTel}`}
                >
                  {content.contactPhone}
                </a>
              </div>
            ) : null}

            {content.contactEmail ? (
              <div className="contact-page__person">
                <p className="contact-page__person-role">Correo</p>
                <a
                  className="contact-page__email"
                  href={`mailto:${content.contactEmail}`}
                >
                  {content.contactEmail}
                </a>
              </div>
            ) : (
              <p className="text-fog text-sm">
                El correo de contacto se publicará pronto.
              </p>
            )}

            {content.contactPhone ? (
              <p className="contact-page__hint">{content.contactPhone}</p>
            ) : null}

            <div className="contact-page__cta-block">
              <p className="contact-page__cta-kicker">Reservas con calendario</p>
              <p className="contact-page__cta-text">
                Mira días libres u ocupados y solicita una fecha desde la web.
              </p>
              <Link href="/reservas" className="contact-page__cta">
                Ir a reservas →
              </Link>
            </div>

            {socials.length ? (
              <div className="contact-page__socials">
                <p className="contact-page__person-role">Redes</p>
                <ul>
                  {socials.map((s) => (
                    <li key={s.label}>
                      <Button href={s.href!} variant="ink-outline" size="sm">
                        {s.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>

          <Reveal className="contact-page__form-wrap" delay={0.06}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
