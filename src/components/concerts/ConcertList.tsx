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
    <article className="grid gap-3 border-t border-line py-6 md:grid-cols-[6.5rem_1fr_auto] md:items-center md:gap-6">
      <time
        dateTime={concert.date}
        className="text-[0.8rem] tracking-wide text-taupe-dark"
      >
        {formatDate(concert.date)}
      </time>
      <div>
        <h3 className="font-display text-[1.65rem] leading-tight md:text-3xl">
          {concert.title}
        </h3>
        <p className="mt-1 text-sm text-taupe-dark">
          {concert.city} · {concert.venue}
          {concert.time ? ` · ${concert.time}` : ""}
        </p>
      </div>
      <div>
        {canBuy ? (
          <Button href={concert.ticketUrl!} variant="outline" size="sm">
            {STATUS_LABEL[concert.ticketStatus]}
          </Button>
        ) : (
          <span className="text-[0.65rem] uppercase tracking-[0.14em] text-taupe">
            {STATUS_LABEL[concert.ticketStatus]}
          </span>
        )}
      </div>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="display-title text-[clamp(2.75rem,8vw,5rem)]">
              Próximos conciertos
            </h2>
          </Reveal>
          <Link
            href="/conciertos"
            className="text-[0.68rem] tracking-[0.14em] uppercase no-underline hover:opacity-70"
          >
            Agenda completa
          </Link>
        </div>
        <ConcertList
          concerts={concerts.slice(0, 4)}
          emptyMessage="[PROVISIONAL] Todavía no hay conciertos publicados. Se gestionarán desde el panel."
        />
      </div>
    </section>
  );
}
