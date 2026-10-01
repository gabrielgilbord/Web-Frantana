import Link from "next/link";
import { getOrderByCheckoutSession } from "@/lib/content/store";
import { formatPrice } from "@/lib/shop/format";
import { getStripe } from "@/lib/shop/stripe";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Pedido confirmado",
  description: "Gracias por formar parte de FRANTANA.",
});

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  let order = session_id
    ? await getOrderByCheckoutSession(session_id)
    : null;

  // If webhook hasn't landed yet, try Stripe session metadata
  if (!order && session_id) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.metadata?.orderId) {
          const { getOrderById } = await import("@/lib/content/store");
          order = await getOrderById(session.metadata.orderId);
        }
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="tienda pt-[var(--header-h)]">
      <section className="order-success">
        <p className="order-success__eyebrow">Pedido</p>
        <h1 className="order-success__title">Pedido confirmado</h1>
        <p className="order-success__lede">
          Gracias por formar parte. Te enviaremos el recibo por email cuando el
          pago esté asentado.
        </p>

        {order ? (
          <div className="order-success__summary">
            <p className="order-success__id">Ref. {order.id.slice(0, 8)}</p>
            <p className="order-success__status">Estado: {order.status}</p>
            <ul className="order-success__items">
              {order.items.map((item) => (
                <li key={`${item.variantId}-${item.quantity}`}>
                  <span>
                    {item.productName} · {item.variantName} × {item.quantity}
                  </span>
                  <span>
                    {formatPrice(
                      item.unitPriceCents * item.quantity,
                      order.currency
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="order-success__total">
              Total {formatPrice(order.totalCents, order.currency)}
            </p>
          </div>
        ) : (
          <p className="order-success__pending">
            Estamos confirmando el pago con Stripe. Si acabas de pagar, espera
            unos segundos y refresca — o revisa tu email.
          </p>
        )}

        <div className="order-success__actions">
          <Link href="/" className="order-success__link">
            Volver a FRANTANA →
          </Link>
          <Link href="/tienda" className="order-success__link order-success__link--ghost">
            Seguir en la tienda
          </Link>
        </div>
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{localStorage.removeItem('frantana-cart-v1')}catch(e){}`,
        }}
      />
    </div>
  );
}
