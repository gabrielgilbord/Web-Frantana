"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  Menu,
  MessageSquare,
  Store,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV_LINKS = [
  { href: "/admin", label: "Inicio", match: "exact" as const },
  { href: "/admin/conciertos", label: "Conciertos", match: "prefix" as const },
  { href: "/admin/reservas", label: "Reservas", match: "prefix" as const },
  { href: "/admin/contenido", label: "Contenido", match: "prefix" as const },
  { href: "/admin/galeria", label: "Galería", match: "prefix" as const },
  { href: "/admin/tienda", label: "Tienda", match: "prefix" as const },
  { href: "/admin/pedidos", label: "Pedidos", match: "prefix" as const },
  { href: "/admin/ajustes", label: "Ajustes", match: "prefix" as const },
];

const BOTTOM_NAV = [
  { href: "/admin", label: "Inicio", match: "exact" as const, Icon: Home },
  {
    href: "/admin/reservas",
    label: "Reservas",
    match: "prefix" as const,
    Icon: MessageSquare,
  },
  { href: "/admin/tienda", label: "Tienda", match: "prefix" as const, Icon: Store },
  {
    href: "/admin/conciertos",
    label: "Conciertos",
    match: "prefix" as const,
    Icon: CalendarDays,
  },
];

function isActive(
  pathname: string,
  href: string,
  match: "exact" | "prefix"
) {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminShellProps = {
  email: string;
  shopEnabled: boolean;
  children: React.ReactNode;
};

export function AdminShell({ email, shopEnabled, children }: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTitleId = useId();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="admin-app">
      {!shopEnabled && (
        <p className="admin-app__banner" role="status">
          Tienda pública desactivada. El catálogo solo es visible aquí.
        </p>
      )}

      <header className="admin-app__header">
        <div className="admin-app__header-inner">
          <div className="admin-app__brand-row">
            <Link href="/admin" className="admin-app__brand">
              <span className="admin-app__brand--full">FRANTANA ADMIN</span>
              <span className="admin-app__brand--short">FRANTANA</span>
            </Link>

            <button
              type="button"
              className="admin-app__menu-btn"
              aria-expanded={drawerOpen}
              aria-controls="admin-drawer"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
              <span className="sr-only">{drawerOpen ? "Cerrar menú" : "Abrir menú"}</span>
            </button>
          </div>

          <nav className="admin-app__nav" aria-label="Admin">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(pathname, link.href, link.match)
                    ? "admin-app__nav-link is-active"
                    : "admin-app__nav-link"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="admin-app__header-actions">
            <span className="admin-app__email" title={email}>
              {email}
            </span>
            <Link href="/" className="admin-app__nav-link admin-app__nav-link--quiet">
              Ver web
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div
        id="admin-drawer"
        className={drawerOpen ? "admin-app__drawer is-open" : "admin-app__drawer"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerTitleId}
        aria-hidden={!drawerOpen}
      >
        <div
          className="admin-app__drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
        <div className="admin-app__drawer-panel">
          <div className="admin-app__drawer-head">
            <p id={drawerTitleId} className="admin-app__drawer-title">
              Menú
            </p>
            <button
              type="button"
              className="admin-app__menu-btn"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={22} aria-hidden />
              <span className="sr-only">Cerrar</span>
            </button>
          </div>
          <nav className="admin-app__drawer-nav" aria-label="Admin móvil">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(pathname, link.href, link.match)
                    ? "admin-app__drawer-link is-active"
                    : "admin-app__drawer-link"
                }
              >
                {link.label}
              </Link>
            ))}
            <Link href="/" className="admin-app__drawer-link">
              Ver web
            </Link>
            <div className="admin-app__drawer-logout">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </div>

      <main className="admin-app__main">{children}</main>

      <nav className="admin-app__bottom-nav" aria-label="Accesos rápidos">
        {BOTTOM_NAV.map(({ href, label, match, Icon }) => {
          const active = isActive(pathname, href, match);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "admin-app__bottom-link is-active"
                  : "admin-app__bottom-link"
              }
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
