import { NextResponse } from "next/server";
import {
  decrementStock,
  getOrderByCheckoutSession,
  getOrderById,
  upsertOrder,
} from "@/lib/content/store";
import { getStripe } from "@/lib/shop/stripe";
import type { Order } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook Stripe no configurado" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Firma de webhook inválida",
      },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      let order: Order | null = null;

      if (orderId) order = await getOrderById(orderId);
      if (!order && session.id) {
        order = await getOrderByCheckoutSession(session.id);
      }
      if (!order) {
        return NextResponse.json({ received: true, note: "order-not-found" });
      }

      // Idempotency: already paid
      if (order.status === "paid" || order.status === "fulfilled") {
        return NextResponse.json({ received: true, note: "already-paid" });
      }

      if (session.payment_status === "paid") {
        const stock = await decrementStock(
          order.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          }))
        );

        // Paid regardless of stock write outcome — payment already captured.
        // JSON stock is best-effort; failure is logged for ops follow-up.
        if (!stock.ok) {
          console.error("[stripe webhook] stock decrement failed", {
            orderId: order.id,
            error: stock.error,
          });
        }

        await upsertOrder({
          ...order,
          status: "paid",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : order.stripePaymentIntentId,
          email: session.customer_details?.email || order.email,
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const order =
        (session.metadata?.orderId
          ? await getOrderById(session.metadata.orderId)
          : null) ??
        (session.id ? await getOrderByCheckoutSession(session.id) : null);
      if (order && order.status === "pending_payment") {
        await upsertOrder({ ...order, status: "cancelled" });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook error" },
      { status: 500 }
    );
  }
}
