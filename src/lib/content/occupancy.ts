import type { Concert, OccupancyDay } from "@/types";
import { localTodayISO } from "@/lib/concerts/date";

/** A date is busy if published, or unpublished but flagged to block the calendar. */
export function concertOccupiesDate(c: Concert): boolean {
  if (c.ticketStatus === "cancelled") return false;
  if (c.published) return true;
  return Boolean(c.blocksCalendar);
}

export function occupancyFromConcerts(
  concerts: Concert[],
  options?: { from?: string; to?: string }
): OccupancyDay[] {
  const from = options?.from ?? localTodayISO();
  const to = options?.to;
  const byDate = new Map<string, OccupancyDay["status"]>();

  for (const c of concerts) {
    if (!concertOccupiesDate(c)) continue;
    if (c.date < from) continue;
    if (to && c.date > to) continue;
    const status: OccupancyDay["status"] = c.published ? "public" : "private";
    const prev = byDate.get(c.date);
    // Prefer "public" if both exist the same day
    if (!prev || (prev === "private" && status === "public")) {
      byDate.set(c.date, status);
    }
  }

  return [...byDate.entries()]
    .map(([date, status]) => ({ date, status }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function normalizeConcert(c: Concert): Concert {
  return {
    ...c,
    image: c.image ?? null,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
    blocksCalendar: c.blocksCalendar ?? true,
  };
}
