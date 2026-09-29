import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Admin · Frantana",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-beige/50 text-ink">
      {session && (
        <header className="border-b border-line bg-ivory">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/admin" className="font-display text-2xl no-underline">
                Admin
              </Link>
              <nav className="flex flex-wrap gap-4 text-[0.7rem] uppercase tracking-[0.16em]">
                <Link href="/admin/conciertos" className="no-underline hover:opacity-70">
                  Conciertos
                </Link>
                <Link href="/admin/contenido" className="no-underline hover:opacity-70">
                  Contenido
                </Link>
                <Link href="/admin/galeria" className="no-underline hover:opacity-70">
                  Galería
                </Link>
                <Link href="/admin/tienda" className="no-underline hover:opacity-70">
                  Catálogo
                </Link>
                <Link href="/admin/ajustes" className="no-underline hover:opacity-70">
                  Ajustes
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-taupe-dark">{session.email}</span>
              <Link href="/" className="no-underline hover:opacity-70">
                Ver web
              </Link>
              <LogoutButton />
            </div>
          </div>
          {!SHOP_ENABLED && (
            <p className="border-t border-line bg-beige px-4 py-2 text-center text-xs text-taupe-dark">
              Tienda pública desactivada (SHOP_ENABLED=false). El catálogo solo es
              visible aquí.
            </p>
          )}
        </header>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
