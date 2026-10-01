"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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

export function AdminDatePicker({
  value,
  onChange,
  required,
  label = "Fecha",
  id,
  className,
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  label?: string;
  id?: string;
  className?: string;
  minDate?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const selected = parseISO(value);
  const min = minDate ? parseISO(minDate) : null;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() =>
    startOfMonth(selected ?? min ?? new Date())
  );
  const [pos, setPos] = useState({ top: 0, left: 0, width: 296 });
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (selected) setCursor(startOfMonth(selected));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 296), window.innerWidth - 24);
      let left = r.left;
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      const preferredTop = r.bottom + 8;
      const panelH = 360;
      const top =
        preferredTop + panelH > window.innerHeight - 12
          ? Math.max(12, r.top - panelH - 8)
          : preferredTop;
      setPos({ top, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if ((e.target as HTMLElement)?.closest?.("[data-picker-portal]")) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

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

  const display = selected
    ? selected.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Elegir fecha";

  const monthLabel = cursor.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

  const panel =
    open && mounted
      ? createPortal(
          <div
            className="admin-picker__panel admin-datepicker__panel admin-picker__panel--portal"
            role="dialog"
            aria-label="Calendario"
            data-picker-portal
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 1200,
            }}
          >
            <div className="admin-datepicker__nav">
              <button
                type="button"
                className="admin-picker__icon-btn"
                aria-label="Mes anterior"
                onClick={() => setCursor((c) => addMonths(c, -1))}
              >
                <ChevronLeft size={18} />
              </button>
              <p className="admin-datepicker__month">{monthLabel}</p>
              <button
                type="button"
                className="admin-picker__icon-btn"
                aria-label="Mes siguiente"
                onClick={() => setCursor((c) => addMonths(c, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="admin-datepicker__weekdays" aria-hidden>
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div className="admin-datepicker__grid" role="grid">
              {cells.map((d) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const isSelected = selected ? sameDay(d, selected) : false;
                const isToday = sameDay(d, today);
                const beforeMin = min
                  ? d <
                    new Date(min.getFullYear(), min.getMonth(), min.getDate())
                  : false;
                return (
                  <button
                    key={toISO(d)}
                    type="button"
                    role="gridcell"
                    disabled={beforeMin}
                    className={[
                      "admin-datepicker__day",
                      !inMonth && "is-muted",
                      isSelected && "is-selected",
                      isToday && "is-today",
                      beforeMin && "is-disabled",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (beforeMin) return;
                      onChange(toISO(d));
                      setOpen(false);
                    }}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="admin-picker__footer">
              <button
                type="button"
                className="admin-linkish"
                onClick={() => {
                  const pick =
                    min &&
                    today <
                      new Date(min.getFullYear(), min.getMonth(), min.getDate())
                      ? min
                      : today;
                  onChange(toISO(pick));
                  setOpen(false);
                }}
              >
                Hoy
              </button>
              {!required && value && (
                <button
                  type="button"
                  className="admin-linkish"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      className={["admin-field admin-picker", className].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <span className="admin-field__label" id={`${fieldId}-label`}>
        {label}
        {required ? " *" : ""}
      </span>
      <button
        type="button"
        id={fieldId}
        ref={triggerRef}
        className="admin-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${fieldId}-label`}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarDays size={18} aria-hidden />
        <span className={selected ? undefined : "admin-picker__placeholder"}>
          {display}
        </span>
      </button>
      {panel}
      <input type="hidden" value={value} required={required} readOnly />
    </div>
  );
}
