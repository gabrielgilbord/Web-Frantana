"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

function normalizeTime(value: string): { h: string; m: string } | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, "0");
  const minRaw = Number(m[2]);
  const snapped = MINUTES.includes(String(minRaw).padStart(2, "0"))
    ? String(minRaw).padStart(2, "0")
    : MINUTES.reduce((best, cur) =>
        Math.abs(Number(cur) - minRaw) < Math.abs(Number(best) - minRaw)
          ? cur
          : best
      );
  return { h, m: snapped };
}

export function AdminTimePicker({
  value,
  onChange,
  label = "Hora",
  id,
  className,
}: {
  value: string;
  onChange: (hhmm: string) => void;
  label?: string;
  id?: string;
  className?: string;
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const parsed = normalizeTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed?.h ?? "22");
  const [minute, setMinute] = useState(parsed?.m ?? "00");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 240 });
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const p = normalizeTime(value);
    if (p) {
      setHour(p.h);
      setMinute(p.m);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 240), window.innerWidth - 24);
      let left = r.left;
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      const panelH = 280;
      const preferredTop = r.bottom + 8;
      const top =
        preferredTop + panelH > window.innerHeight - 12
          ? Math.max(12, r.top - panelH - 8)
          : preferredTop;
      setPos({ top, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
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

  const display = value || "Elegir hora";

  function commit(h: string, m: string) {
    onChange(`${h}:${m}`);
  }

  const panel =
    open && mounted
      ? createPortal(
          <div
            className="admin-picker__panel admin-timepicker__panel admin-picker__panel--portal"
            role="dialog"
            aria-label="Selector de hora"
            data-picker-portal
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 1200,
            }}
          >
            <div className="admin-timepicker__cols">
              <div
                className="admin-timepicker__col"
                role="listbox"
                aria-label="Hora"
              >
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={h === hour}
                    className={
                      h === hour
                        ? "admin-timepicker__opt is-selected"
                        : "admin-timepicker__opt"
                    }
                    onClick={() => {
                      setHour(h);
                      commit(h, minute);
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div
                className="admin-timepicker__col"
                role="listbox"
                aria-label="Minutos"
              >
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="option"
                    aria-selected={m === minute}
                    className={
                      m === minute
                        ? "admin-timepicker__opt is-selected"
                        : "admin-timepicker__opt"
                    }
                    onClick={() => {
                      setMinute(m);
                      commit(hour, m);
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-picker__footer">
              <button
                type="button"
                className="admin-btn admin-btn--ember admin-btn--sm"
                onClick={() => {
                  commit(hour, minute);
                  setOpen(false);
                }}
              >
                Listo · {hour}:{minute}
              </button>
              {value && (
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
        <Clock size={18} aria-hidden />
        <span className={value ? undefined : "admin-picker__placeholder"}>
          {display}
        </span>
      </button>
      {panel}
    </div>
  );
}
