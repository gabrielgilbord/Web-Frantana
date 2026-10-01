import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getProducts, upsertOrder } from "@/lib/content/store";
import { getStripe, siteUrl, stripeConfigured } from "@/lib/shop/stripe";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import type { Order } from "@/types";

const lineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive().max(20),
});

const bodySchema = z.object({
  email: z.string().email(),
  lines: z.array(lineSchema).min(1).max(30),
});

export async function GET() {
  return NextResponse.json({
    configured: stripeConfigured() && SHOP_ENABLED,
    shopEnabled: SHOP_ENABLED,
    stripeReady: stripeConfigured(),
  });
}

export async function POST(request: Request) {
  if (!SHOP_ENABLED) {
    return NextResponse.json(
      { error: "La tienda pública está desactivada." },
      { status: 403 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe no está configurado. Añade STRIPE_SECRET_KEY y NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en el entorno.",
      },
      { status: 503 }
    );
  }

  try {
    const body = bodySchema.parse(await request.json());
    const products = await getProducts();
    const lineItems: Array<{
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; images?: string[] };
      };
      quantity: number;
    }> = [];
    const orderItems: Order["items"] = [];
    let totalCents = 0;
    let currency = "EUR";

    for (const line of body.lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product || !product.published) {
        return NextResponse.json(
          { error: "Producto no disponible." },
          { status: 400 }
        );
      }
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: "Variante no disponible." },
          { status: 400 }
        );
      }
      if (variant.stock < line.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name} (${variant.name}). Disponible: ${variant.stock}.`,
          },
          { status: 409 }
        );
      }

      currency = variant.currency || "EUR";
      totalCents += variant.priceCents * line.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        quantity: line.quantity,
        unitPriceCents: variant.priceCents,
      });

      const absoluteImage = product.images[0]
        ? product.images[0].startsWith("http")
          ? product.images[0]
          : `${siteUrl()}${product.images[0]}`
        : undefined;

      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: variant.priceCents,
          product_data: {
            name: `${product.name} — ${variant.name}`,
            images: absoluteImage ? [absoluteImage] : undefined,
          },
        },
        quantity: line.quantity,
      });
    }

    const orderId = randomUUID();
    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      status: "pending_payment",
      email: body.email,
      items: orderItems,
      totalCents,
      currency,
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      createdAt: now,
      updatedAt: now,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: body.email,
      line_items: lineItems,
      success_url: `${siteUrl()}/tienda/pedido/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/tienda/carrito?cancelled=1`,
      metadata: { orderId },
      payment_intent_data: {
        metadata: { orderId },
      },
    });

    order.stripeCheckoutSessionId = session.id;
    await upsertOrder(order);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderId,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de checkout" },
      { status: 400 }
    );
  }
}
