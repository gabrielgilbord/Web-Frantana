"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/shop/CartProvider";

const NAV = [
  { href: "/sobre", label: "Sobre mí" },
  { href: "/musica", label: "Música" },
  { href: "/conciertos", label: "Conciertos" },
  { href: "/tienda", label: "Tienda" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

const SHOP_PUBLIC =
  process.env.NEXT_PUBLIC_SHOP_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_SHOP_ENABLED === "1";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 5.5h1.7l1.35 9.15a1.5 1.5 0 0 0 1.48 1.28h8.55a1.5 1.5 0 0 0 1.47-1.2L19.5 8H7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="19" r="1.15" fill="currentColor" />
      <circle cx="16.3" cy="19" r="1.15" fill="currentColor" />
    </svg>
  );
}

function BagButton({
  className,
  showLabel = false,
  onAfterOpen,
}: {
  className?: string;
  showLabel?: boolean;
  onAfterOpen?: () => void;
}) {
  const { count, ready, openBag, bagOpen } = useCart();
  const label =
    ready && count > 0
      ? `Abrir carrito, ${count} ${count === 1 ? "pieza" : "piezas"}`
      : "Abrir carrito";

  return (
    <button
      type="button"
      className={clsx("site-header__bag", bagOpen && "is-active", className)}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={bagOpen}
      onClick={() => {
        openBag();
        onAfterOpen?.();
      }}
    >
      <CartIcon className="site-header__bag-icon" />
      {showLabel ? <span className="site-header__bag-text">Carrito</span> : null}
      {ready && count > 0 ? (
        <span className="site-header__bag-count" aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const scrollLockY = useRef(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-menu-open", menuOpen);
    return () => {
      document.documentElement.classList.remove("nav-menu-open");
    };
  }, [menuOpen]);

  /* iOS-safe body scroll lock without jumping the hero / FRANTANA brand */
  useEffect(() => {
    if (!menuOpen) return;

    const html = document.documentElement;
    const body = document.body;
    scrollLockY.current = window.scrollY;
    const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);

    body.dataset.scrollLocked = "true";
    body.style.position = "fixed";
    body.style.top = `-${scrollLockY.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      const y = scrollLockY.current;
      delete body.dataset.scrollLocked;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = "";
      window.scrollTo(0, y);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (isAdmin) return null;

  return (
    <header
      className={clsx(
        "site-header fixed inset-x-0 top-0 z-50",
        isHome ? "site-header--home text-mist" : "text-ink",
        menuOpen && "site-header--menu-open"
      )}
    >
      <div className="container-editorial site-header__inner">
        <Link
          href="/"
          data-nav-brand-slot
          className={clsx(
            "site-header__brand font-sans text-[1.15rem] font-medium leading-none tracking-[0.16em] uppercase no-underline md:text-[1.25rem]",
            isHome && !menuOpen && "site-header__brand--deferred"
          )}
          aria-label="Frantana — inicio"
          tabIndex={isHome && !menuOpen ? -1 : 0}
          onClick={() => setMenuOpen(false)}
        >
          FRANTANA
        </Link>

        <div className="site-header__actions">
          <nav data-site-nav className="site-header__nav" aria-label="Principal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-header__link"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {SHOP_PUBLIC && (
            <BagButton className={clsx(menuOpen && "site-header__bag--hidden-when-menu")} />
          )}

          <button
            type="button"
            className="site-header__menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">{menuOpen ? "Cerrar" : "Menú"}</span>
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span
                className={clsx(
                  "h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-soft)]",
                  menuOpen && "translate-y-[7px] rotate-45"
                )}
              />
              <span
                className={clsx(
                  "h-px w-full bg-current transition-opacity duration-300",
                  menuOpen && "opacity-0"
                )}
              />
              <span
                className={clsx(
                  "h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-soft)]",
                  menuOpen && "-translate-y-[7px] -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={clsx("site-header__drawer md:hidden", menuOpen && "is-open")}
        aria-hidden={!menuOpen}
      >
        <div className="site-header__drawer-atmosphere" aria-hidden />
        <nav className="site-header__drawer-nav" aria-label="Móvil">
          {NAV.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "site-header__drawer-link",
                pathname === item.href && "is-current"
              )}
              style={{ "--nav-i": index } as CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {SHOP_PUBLIC && (
            <BagButton
              showLabel
              className="site-header__bag--drawer"
              onAfterOpen={() => setMenuOpen(false)}
            />
          )}
        </nav>
      </div>
    </header>
  );
}
