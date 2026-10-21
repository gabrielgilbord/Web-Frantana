import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata: Metadata = {
  title: "Página no encontrada · Frantana",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__stage" aria-hidden>
        <Image
          src="/media/gallery/frantana/shot-08.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="not-found__img"
        />
        <div className="not-found__veil" />
        <div className="not-found__grain" />
      </div>

      <div className="not-found__content">
        <p className="not-found__code">404</p>
        <BrandLogo decorative className="brand-logo--not-found" />
        <h1 className="not-found__title">Esta página se fue de gira</h1>
        <p className="not-found__lede">
          El enlace no existe o ya no está en el tablón. Vuelve al escenario o
          elige otro camino.
        </p>
        <div className="not-found__actions">
          <Link href="/" className="not-found__cta not-found__cta--primary">
            Ir al inicio
          </Link>
          <Link href="/novedades" className="not-found__cta">
            Novedades
          </Link>
          <Link href="/conciertos" className="not-found__cta">
            Conciertos
          </Link>
          <Link href="/contacto" className="not-found__cta">
            Contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
