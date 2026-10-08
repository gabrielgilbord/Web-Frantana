import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { BookingForm } from "@/components/booking/BookingForm";
import { buildMetadata } from "@/lib/seo/metadata";
import { getOccupancy } from "@/lib/content/store";

export const metadata = buildMetadata({
  title: "Reservas",
  description:
    "Consulta disponibilidad y solicita a Frantana para tu evento: bodas, privados, corporativos y fiestas.",
});

export default async function ReservasPage() {
  const occupancy = await getOccupancy();

  return (
    <div className="booking-page-shell pt-[var(--header-h)]">
      <section className="booking-hero" aria-hidden>
        <Image
          src="/media/gallery/frantana/shot-09.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="booking-hero__img booking-hero__img--wide"
          style={{ objectFit: "cover", objectPosition: "50% 40%" }}
        />
        <div className="booking-hero__veil" />
        <div className="booking-hero__copy container-editorial">
          <Reveal y={20}>
            <p className="booking-hero__eyebrow">Booking</p>
            <p className="booking-hero__line">Escenario · voz · tu fecha</p>
          </Reveal>
        </div>
      </section>

      <section className="booking-page" aria-labelledby="reservas-title">
        <div className="container-editorial booking-page__layout">
          <Reveal className="booking-page__intro">
            <p className="booking-section__eyebrow">Reservas</p>
            <h1 id="reservas-title" className="booking-section__title">
              ¿Nos vemos en tu evento?
            </h1>
            <p className="booking-section__lede">
              Mira el calendario antes de pedir día: conciertos publicados y
              fechas privadas ya ocupadas aparecen bloqueadas.
            </p>
            <aside className="booking-page__promise">
              <p className="booking-page__promise-kicker">A mano</p>
              <p className="booking-page__promise-text">
                Cada reserva la revisa el equipo de Frantana. Tras enviarla
                tendrás un enlace privado para hablar con nosotros sobre esa
                solicitud — sin SMTP ni apps externas.
              </p>
            </aside>
            <ul className="booking-page__pillars" aria-label="Tipos de evento">
              <li>Privado</li>
              <li>Boda</li>
              <li>Corporativo</li>
              <li>Fiesta</li>
            </ul>
            <p className="booking-page__aside">
              ¿Solo quieres escribir?
              <Link href="/contacto"> Ir a contacto →</Link>
            </p>
          </Reveal>

          <Reveal className="booking-page__form-wrap" delay={0.08} y={36}>
            <BookingForm occupancy={occupancy} />
          </Reveal>
        </div>

        <p className="booking-page__echo" aria-hidden>
          En vivo
        </p>
      </section>
    </div>
  );
}
