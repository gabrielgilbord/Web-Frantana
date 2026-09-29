"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/sobre", label: "Sobre" },
  { href: "/musica", label: "Música" },
  { href: "/conciertos", label: "Conciertos" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

function subscribeScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollSnapshot() {
  return window.scrollY > 16;
}

function getScrollServerSnapshot() {
  return false;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrollSnapshot,
    getScrollServerSnapshot
  );
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isAdmin) return null;

  const solid = scrolled || !isHome || open;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,color] duration-500",
        solid
          ? "border-b border-line bg-ivory/94 text-ink backdrop-blur-md"
          : "border-b border-transparent bg-transparent text-ivory"
      )}
    >
      <div className="container-editorial flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-[1.35rem] leading-none tracking-[0.12em] no-underline md:text-[1.5rem]"
          aria-label="Frantana — inicio"
          onClick={() => setOpen(false)}
        >
          FRANTANA
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-[0.68rem] font-medium tracking-[0.16em] uppercase no-underline transition-opacity duration-300 hover:opacity-65",
                pathname === item.href && "opacity-65"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menú</span>
          <span aria-hidden className="flex w-5 flex-col gap-1.5">
            <span
              className={clsx(
                "h-px w-full bg-current transition-transform",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={clsx(
                "h-px w-full bg-current transition-opacity",
                open && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "h-px w-full bg-current transition-transform",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className={clsx(
          "border-t border-line bg-ivory text-ink md:hidden",
          open && "block"
        )}
      >
        <nav
          className="container-editorial flex flex-col py-3"
          aria-label="Móvil"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-[0.75rem] tracking-[0.14em] uppercase no-underline"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
