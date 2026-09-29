import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { getConcerts, getGallery, getProducts } from "@/lib/content/store";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";

export default async function AdminHomePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [concerts, gallery, products] = await Promise.all([
    getConcerts({ includeUnpublished: true }),
    getGallery({ includeUnpublished: true }),
    getProducts({ includeUnpublished: true }),
  ]);

  return (
    <div>
      <h1 className="font-display text-5xl">Panel</h1>
      <p className="mt-2 text-taupe-dark">
        Gestiona contenidos, agenda, galería y catálogo (oculto en público).
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/conciertos" className="border border-line bg-ivory p-6 no-underline hover:bg-beige/60">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-taupe-dark">Conciertos</p>
          <p className="mt-3 font-display text-4xl">{concerts.length}</p>
        </Link>
        <Link href="/admin/galeria" className="border border-line bg-ivory p-6 no-underline hover:bg-beige/60">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-taupe-dark">Galería</p>
          <p className="mt-3 font-display text-4xl">{gallery.length}</p>
        </Link>
        <Link href="/admin/tienda" className="border border-line bg-ivory p-6 no-underline hover:bg-beige/60">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-taupe-dark">
            Productos {SHOP_ENABLED ? "" : "(solo admin)"}
          </p>
          <p className="mt-3 font-display text-4xl">{products.length}</p>
        </Link>
      </div>

      <ul className="mt-10 space-y-2 text-sm">
        <li>
          <Link href="/admin/contenido" className="underline">
            Editar biografía, subtítulo hero y redes
          </Link>
        </li>
        <li>
          <Link href="/admin/conciertos" className="underline">
            Crear o publicar conciertos
          </Link>
        </li>
        <li>
          <Link href="/admin/ajustes" className="underline">
            Revisar checklist de tienda / Stripe
          </Link>
        </li>
      </ul>
    </div>
  );
}
