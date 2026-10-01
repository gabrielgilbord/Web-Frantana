"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { OccupancyDay } from "@/types";
import { localTodayISO } from "@/lib/concerts/date";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function parseISO(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function AvailabilityCalendar({
  occupancy,
  value,
  onChange,
  minDate,
}: {
  occupancy: OccupancyDay[];
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
}) {
  const todayIso = localTodayISO();
  const min = parseISO(minDate ?? todayIso);
  const selected = parseISO(value);
  const [cursor, setCursor] = useState(() =>
    startOfMonth(selected ?? min ?? new Date())
  );

  const busyMap = useMemo(() => {
    const m = new Map<string, OccupancyDay["status"]>();
    for (const day of occupancy) m.set(day.date, day.status);
    return m;
  }, [occupancy]);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  return (
    <div className="avail-cal" aria-label="Calendario de disponibilidad">
      <div className="avail-cal__head">
        <div>
          <p className="avail-cal__eyebrow">Disponibilidad</p>
          <p className="avail-cal__title">Elige un día libre</p>
        </div>
        <div className="avail-cal__nav">
          <button
            type="button"
            className="avail-cal__nav-btn"
            aria-label="Mes anterior"
            onClick={() => setCursor((c) => addMonths(c, -1))}
          >
            <ChevronLeft size={18} />
          </button>
          <p className="avail-cal__month">{monthLabel}</p>
          <button
            type="button"
            className="avail-cal__nav-btn"
            aria-label="Mes siguiente"
            onClick={() => setCursor((c) => addMonths(c, 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="avail-cal__weekdays" aria-hidden>
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="avail-cal__grid" role="grid">
        {cells.map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isSelected = selected ? sameDay(d, selected) : false;
          const isToday = sameDay(d, today);
          const beforeMin = min
            ? d < new Date(min.getFullYear(), min.getMonth(), min.getDate())
            : false;
          const busy = busyMap.get(iso);
          const disabled = Boolean(beforeMin || busy);
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-label={
                busy
                  ? `${iso}: ocupado`
                  : beforeMin
                    ? `${iso}: no disponible`
                    : `${iso}: disponible`
              }
              className={clsx(
                "avail-cal__day",
                !inMonth && "is-muted",
                isSelected && "is-selected",
                isToday && "is-today",
                beforeMin && "is-past",
                busy === "public" && "is-busy-public",
                busy === "private" && "is-busy-private"
              )}
              onClick={() => {
                if (disabled) return;
                onChange(iso);
              }}
            >
              <span className="avail-cal__day-num">{d.getDate()}</span>
              {busy ? <span className="avail-cal__dot" aria-hidden /> : null}
            </button>
          );
        })}
      </div>

      <ul className="avail-cal__legend">
        <li>
          <span className="avail-cal__swatch is-free" /> Libre
        </li>
        <li>
          <span className="avail-cal__swatch is-public" /> Concierto / público
        </li>
        <li>
          <span className="avail-cal__swatch is-private" /> Reservado (privado)
        </li>
      </ul>
    </div>
  );
}
