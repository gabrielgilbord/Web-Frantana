"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteContent } from "@/types";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { getSocialLinks } from "@/lib/social";

const NAV = [
  { href: "/sobre", label: "Sobre" },
  { href: "/musica", label: "Música" },
  { href: "/conciertos", label: "Conciertos" },
  { href: "/tienda", label: "Tienda" },
  { href: "/galeria", label: "Galería" },
  { href: "/reservas", label: "Reservas" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteFooter({ content }: { content: SiteContent }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();
  const links = getSocialLinks(content);

  return (
    <footer className="site-footer">
      <div className="site-footer__media" aria-hidden>
        <Image
          src="/media/editorial/gran-canaria.jpg"
          alt=""
          fill
          sizes="100vw"
          className="site-footer__media-img"
          style={{ objectFit: "cover", objectPosition: "50% 38%" }}
        />
        <div className="site-footer__overlay" />
      </div>

      <div className="site-footer__stage">
        <p className="site-footer__brand">FRANTANA</p>
        <p className="site-footer__pillars" aria-hidden>
          Música · Show · Directo
        </p>
        <p className="site-footer__line">
          Desde Gran Canaria. Para el escenario.
        </p>

        <SocialIcons content={content} className="site-footer__social" />

        {links.spotify && (
          <a
            href={links.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__spotify"
          >
            Escúchame en Spotify
          </a>
        )}

        <nav className="site-footer__nav" aria-label="Pie de página">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="site-footer__nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="site-footer__base">
        <p>© {year} Frantana</p>
        <p className="site-footer__legal">
          <span>Aviso legal</span>
          <span>Privacidad</span>
          <span>Cookies</span>
        </p>
      </div>
    </footer>
  );
}
