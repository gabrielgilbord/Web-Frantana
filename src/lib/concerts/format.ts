import type { TicketStatus } from "@/types";

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  available: "Entradas disponibles",
  limited: "Últimas entradas",
  sold_out: "Agotado",
  free: "Entrada libre",
  cancelled: "Cancelado",
  tba: "Próximamente",
};

export const TICKET_CTA_LABEL: Record<TicketStatus, string> = {
  available: "Comprar entradas",
  limited: "Comprar entradas",
  sold_out: "Agotado",
  free: "Entrada libre",
  cancelled: "Cancelado",
  tba: "Entradas próximamente",
};

export type ConcertDateParts = {
  day: string;
  month: string;
  year: string;
};

export function concertDateParts(iso: string): ConcertDateParts {
  const d = new Date(`${iso}T12:00:00`);
  const month = d
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month,
    year: String(d.getFullYear()),
  };
}

export function formatConcertLongDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function canBuyTickets(status: TicketStatus, ticketUrl: string | null) {
  return (
    !!ticketUrl &&
    (status === "available" || status === "limited" || status === "free")
  );
}
