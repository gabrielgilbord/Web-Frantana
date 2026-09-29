import type { Concert, TicketStatus } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
    <article className="grid gap-4 border-t border-line py-6 md:grid-cols-[7rem_1fr_auto] md:items-center">
      <time dateTime={concert.date} className="text-sm tracking-wide text-taupe-dark">
        {formatDate(concert.date)}
      </time>
      <div>
        <h3 className="font-display text-2xl md:text-3xl">{concert.title}</h3>
        <p className="mt-1 text-sm text-taupe-dark">
          {concert.city} · {concert.venue}
          {concert.time ? ` · ${concert.time}` : ""}
        </p>
        <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-taupe">
          {STATUS_LABEL[concert.ticketStatus]}
        </p>
      </div>
      <div>
        {canBuy ? (
          <Button href={concert.ticketUrl!} variant="ghost" className="min-w-[9rem]">
            Entradas
          </Button>
        ) : (
          <span className="text-sm text-taupe-dark">{STATUS_LABEL[concert.ticketStatus]}</span>
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
    <section className="section-pad">
      <div className="container-editorial">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Agenda</p>
            <h2 className="display-title mt-3 text-5xl md:text-6xl">Próximos conciertos</h2>
          </div>
          <Link href="/conciertos" className="text-[0.72rem] tracking-[0.16em] uppercase no-underline hover:opacity-70">
            Ver agenda completa
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
