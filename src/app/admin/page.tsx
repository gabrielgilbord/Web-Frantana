import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import {
  getConcerts,
  getGallery,
  getOrders,
  getProducts,
} from "@/lib/content/store";
import { formatConcertLongDate } from "@/lib/concerts/format";
import { isUpcomingConcertDate } from "@/lib/concerts/date";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import type { Concert, Order, Product } from "@/types";

function nextConcert(concerts: Concert[]): Concert | null {
  if (!concerts.length) return null;
  const upcoming = concerts
    .filter((c) => isUpcomingConcertDate(c.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length) return upcoming[0];
  return [...concerts].sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
}

function productStock(product: Product) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

function isPendingOrder(order: Order) {
  return order.status === "pending_payment" || order.status === "paid";
}

export default async function AdminHomePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [concerts, gallery, products, orders] = await Promise.all([
    getConcerts({ includeUnpublished: true }),
    getGallery({ includeUnpublished: true }),
    getProducts({ includeUnpublished: true }),
    getOrders(),
  ]);

  const upcoming = nextConcert(concerts);
  const lowStockCount = products.filter((p) => productStock(p) < 5).length;
  const pendingOrders = orders.filter(isPendingOrder).length;

  return (
    <div className="admin-home">
      <header className="admin-home__intro">
        <p className="admin-home__eyebrow">Panel</p>
        <h1 className="admin-home__title">Central de trabajo</h1>
        <p className="admin-home__lede">
          Agenda, tienda y pedidos en un solo sitio.
        </p>
      </header>

      <section className="admin-home__block" aria-labelledby="admin-hoy">
        <div className="admin-home__block-head">
          <h2 id="admin-hoy" className="admin-home__block-title">
            Hoy
          </h2>
        </div>
        <div className="admin-card">
          {upcoming ? (
            <div className="admin-home__concert">
              <div className="admin-home__concert-main">
                <p className="admin-home__concert-label">Próximo concierto</p>
                <p className="admin-home__concert-title">{upcoming.title}</p>
                <p className="admin-home__concert-meta">
                  {formatConcertLongDate(upcoming.date)}
                  {upcoming.time ? ` · ${upcoming.time}` : ""}
                  {" · "}
                  {upcoming.city}
                  {upcoming.venue ? ` · ${upcoming.venue}` : ""}
                </p>
              </div>
              <Link
                href="/admin/conciertos"
                className="admin-btn admin-btn--ghost"
              >
                Editar
              </Link>
            </div>
          ) : (
            <p className="admin-empty">No hay conciertos todavía.</p>
          )}
        </div>
      </section>

      <section className="admin-home__block" aria-labelledby="admin-tienda">
        <div className="admin-home__block-head">
          <h2 id="admin-tienda" className="admin-home__block-title">
            Tienda
          </h2>
          {!SHOP_ENABLED && (
            <span className="admin-status admin-status--off">Solo admin</span>
          )}
        </div>
        <div className="admin-card admin-card--stats">
          <div className="admin-home__stat">
            <span className="admin-home__stat-value">{products.length}</span>
            <span className="admin-home__stat-label">Productos</span>
          </div>
          <div className="admin-home__stat">
            <span className="admin-home__stat-value">{lowStockCount}</span>
            <span className="admin-home__stat-label">Stock bajo</span>
          </div>
          <div className="admin-home__stat">
            <span className="admin-home__stat-value">{pendingOrders}</span>
            <span className="admin-home__stat-label">Pedidos pendientes</span>
          </div>
          <div className="admin-home__stat admin-home__stat--muted">
            <span className="admin-home__stat-value">{gallery.length}</span>
            <span className="admin-home__stat-label">Galería</span>
          </div>
        </div>
      </section>

      <section className="admin-home__block" aria-labelledby="admin-acciones">
        <div className="admin-home__block-head">
          <h2 id="admin-acciones" className="admin-home__block-title">
            Acciones rápidas
          </h2>
        </div>
        <div className="admin-home__actions">
          <Link href="/admin/conciertos" className="admin-home__action">
            <span className="admin-home__action-label">Nuevo concierto</span>
            <span className="admin-home__action-hint">Agenda y entradas</span>
          </Link>
          <Link href="/admin/tienda" className="admin-home__action">
            <span className="admin-home__action-label">Tienda</span>
            <span className="admin-home__action-hint">Catálogo y stock</span>
          </Link>
          <Link href="/admin/galeria" className="admin-home__action">
            <span className="admin-home__action-label">Galería</span>
            <span className="admin-home__action-hint">Fotos y créditos</span>
          </Link>
          <Link href="/admin/pedidos" className="admin-home__action">
            <span className="admin-home__action-label">Pedidos</span>
            <span className="admin-home__action-hint">Pagos y envíos</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
