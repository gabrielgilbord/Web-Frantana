"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteContent } from "@/types";

const NAV = [
  { href: "/sobre", label: "Sobre" },
  { href: "/musica", label: "Música" },
  { href: "/conciertos", label: "Conciertos" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
];

function SocialList({ content }: { content: SiteContent }) {
  const items = [
    { href: content.social.instagram, label: "Instagram" },
    { href: content.social.facebook, label: "Facebook" },
    { href: content.social.spotify ?? content.spotifyArtistUrl, label: "Spotify" },
    { href: content.social.youtube, label: "YouTube" },
    { href: content.social.tiktok, label: "TikTok" },
    { href: content.social.appleMusic, label: "Apple Music" },
  ].filter((i) => Boolean(i.href));

  if (!items.length) {
    return (
      <p className="provisional text-sm">
        [PROVISIONAL] Redes pendientes de configurar en el panel.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.72rem] tracking-[0.16em] uppercase no-underline hover:opacity-70"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter({ content }: { content: SiteContent }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-beige/40">
      <div className="container-editorial section-pad grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl tracking-[0.08em]">FRANTANA</p>
          <p className="mt-4 max-w-sm text-sm text-taupe-dark">
            Web oficial. Contenidos editables desde el panel de administración.
          </p>
        </div>
        <div>
          <p className="eyebrow">Navegación</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="no-underline hover:opacity-70">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Redes</p>
          <div className="mt-4">
            <SocialList content={content} />
          </div>
        </div>
      </div>
      <div className="container-editorial flex flex-col gap-3 border-t border-line py-6 text-xs text-taupe-dark md:flex-row md:items-center md:justify-between">
        <p>© {year} Frantana. Todos los derechos reservados.</p>
        <p>
          <span className="mr-4">Aviso legal</span>
          <span className="mr-4">Privacidad</span>
          <span>Cookies</span>
          <span className="ml-2 text-[0.65rem] italic opacity-70">
            (páginas legales pendientes de contenido definitivo)
          </span>
        </p>
      </div>
    </footer>
  );
}
