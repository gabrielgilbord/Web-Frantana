import Link from "next/link";
import {
  TICKET_STATUS_LABEL,
  concertDateParts,
} from "@/lib/concerts/format";
import type { Concert } from "@/types";

function Stop({ concert }: { concert: Concert }) {
  const parts = concertDateParts(concert.date);
  const cta =
    concert.ticketUrl &&
    (concert.ticketStatus === "available" ||
      concert.ticketStatus === "limited" ||
      concert.ticketStatus === "free")
      ? "Entradas"
      : "Ver fecha";

  return (
    <li className="concerts-archive__stop">
      <Link href={`/conciertos/${concert.id}`} className="concerts-archive__hit">
        <span className="concerts-archive__node" aria-hidden />
        <time className="concerts-archive__date" dateTime={concert.date}>
          <span className="concerts-archive__day">{parts.day}</span>
          <span className="concerts-archive__month">{parts.month}</span>
          <span className="concerts-archive__year">{parts.year}</span>
        </time>
        <span className="concerts-archive__body">
          <span className="concerts-archive__show">{concert.title}</span>
          <span className="concerts-archive__meta">
            {concert.venue} · {concert.city}
          </span>
          {concert.time ? (
            <span className="concerts-archive__time">{concert.time} h</span>
          ) : null}
          <span className="concerts-archive__status">
            {TICKET_STATUS_LABEL[concert.ticketStatus]}
          </span>
        </span>
        <span className="concerts-archive__cta">
          {cta} <span aria-hidden>→</span>
        </span>
      </Link>
    </li>
  );
}

export function ConcertsArchive({
  upcoming,
  past,
}: {
  upcoming: Concert[];
  past: Concert[];
}) {
  return (
    <div className="concerts-archive">
      <header className="concerts-archive__header">
        <p className="concerts-archive__eyebrow">Agenda</p>
        <h1 className="concerts-archive__title">Conciertos</h1>
        <p className="concerts-archive__lede">
          Próximas fechas públicas y archivo reciente.
        </p>
        <Link href="/reservas" className="concerts-archive__hire">
          ¿Nos vemos en tu evento? →
        </Link>
      </header>

      <div className="concerts-archive__rail">
        <div className="concerts-archive__line" aria-hidden />

        <section
          className="concerts-archive__section"
          aria-labelledby="conc-upcoming"
        >
          <h2 id="conc-upcoming" className="concerts-archive__section-title">
            Próximos
          </h2>
          {upcoming.length > 0 ? (
            <ol className="concerts-archive__list">
              {upcoming.map((c) => (
                <Stop key={c.id} concert={c} />
              ))}
            </ol>
          ) : (
            <p className="concerts-archive__empty">
              No hay conciertos próximos publicados.
            </p>
          )}
        </section>

        {past.length > 0 && (
          <section
            className="concerts-archive__section concerts-archive__section--past"
            aria-labelledby="conc-past"
          >
            <h2 id="conc-past" className="concerts-archive__section-title">
              Anteriores
            </h2>
            <ol className="concerts-archive__list">
              {past.map((c) => (
                <Stop key={c.id} concert={c} />
              ))}
            </ol>
          </section>
        )}
      </div>

      <aside className="concerts-archive__booking" aria-labelledby="conc-hire">
        <p className="concerts-archive__booking-eyebrow">Reservas</p>
        <h2 id="conc-hire" className="concerts-archive__booking-title">
          ¿Nos vemos en tu evento?
        </h2>
        <p className="concerts-archive__booking-body">
          Bodas, privados, corporativos y fiestas. Cuéntanos fecha, ciudad y
          formato: revisamos cada propuesta a mano.
        </p>
        <Link href="/reservas" className="concerts-archive__booking-cta">
          Solicitar fecha →
        </Link>
      </aside>
    </div>
  );
}
