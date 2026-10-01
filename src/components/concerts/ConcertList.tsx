import type { Concert, TicketStatus } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

const STATUS_LABEL: Record<TicketStatus, string> = {
  available: "Entradas",
  limited: "Últimas entradas",
  sold_out: "Agotado",
  free: "Entrada libre",
  cancelled: "Cancelado",
  tba: "Próximamente",
};

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function ConcertRow({ concert }: { concert: Concert }) {
  const canBuy =
    concert.ticketUrl &&
    (concert.ticketStatus === "available" ||
      concert.ticketStatus === "limited" ||
      concert.ticketStatus === "free");

  return (
    <article className="concert-row border-t border-line px-2 py-7 md:px-3">
      <Link
        href={`/conciertos/${concert.id}`}
        className="concert-row__main no-underline text-inherit"
      >
        <time
          dateTime={concert.date}
          className="font-variant-numeric tabular-nums text-[0.8rem] tracking-wide text-fog"
        >
          {formatDate(concert.date)}
        </time>
        <div>
          <h3 className="font-display text-[1.75rem] leading-tight md:text-[2rem]">
            {concert.title}
          </h3>
          <p className="mt-1.5 text-sm text-fog">
            {concert.city} · {concert.venue}
            {concert.time ? ` · ${concert.time}` : ""}
          </p>
        </div>
        <span className="text-[0.65rem] uppercase tracking-[0.14em] text-fog">
          Ver fecha →
        </span>
      </Link>
      {canBuy && (
        <div className="mt-3 md:pl-[7rem]">
          <Button href={concert.ticketUrl!} variant="outline" size="sm">
            {STATUS_LABEL[concert.ticketStatus]}
          </Button>
        </div>
      )}
      {!canBuy && (
        <p className="mt-2 text-[0.65rem] uppercase tracking-[0.14em] text-taupe md:pl-[7rem]">
          {STATUS_LABEL[concert.ticketStatus]}
        </p>
      )}
    </article>
  );
}

export function ConcertList({
  concerts,
  emptyMessage,
}: {
  concerts: Concert[];
  emptyMessage: string;
}) {
  if (!concerts.length) {
    return <p className="provisional mt-6">{emptyMessage}</p>;
  }
  return (
    <div className="mt-2">
      {concerts.map((c) => (
        <ConcertRow key={c.id} concert={c} />
      ))}
    </div>
  );
}

export function ConcertPreview({ concerts }: { concerts: Concert[] }) {
  return (
    <section className="section-pad surface-ivory">
      <div className="container-editorial">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-title text-[clamp(2.75rem,8vw,5rem)]">
              Próximos conciertos
            </h2>
          </Reveal>
          <Link
            href="/conciertos"
            className="text-[0.68rem] tracking-[0.14em] uppercase no-underline transition-colors duration-300 hover:text-ember"
          >
            Agenda completa
          </Link>
        </div>
        <ConcertList
          concerts={concerts.slice(0, 4)}
          emptyMessage="Todavía no hay conciertos publicados. La agenda se actualiza desde el panel — sígueme en Instagram para fechas."
        />
      </div>
    </section>
  );
}
