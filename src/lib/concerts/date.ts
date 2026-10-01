/**
 * Fecha local YYYY-MM-DD (evita desfase UTC de toISOString).
 */
export function localTodayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** True si la fecha del concierto (día completo) aún no ha pasado. */
export function isUpcomingConcertDate(
  isoDate: string,
  now = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  return isoDate >= localTodayISO(now);
}
