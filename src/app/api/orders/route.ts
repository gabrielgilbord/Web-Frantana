import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getOrderById, getOrders, upsertOrder } from "@/lib/content/store";
import { z } from "zod";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    return NextResponse.json({ order });
  }
  return NextResponse.json({ orders: await getOrders() });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum([
    "draft",
    "pending_payment",
    "paid",
    "fulfilled",
    "cancelled",
    "refunded",
  ]),
});

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const parsed = patchSchema.parse(await request.json());
    const order = await getOrderById(parsed.id);
    if (!order) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const next = await upsertOrder({ ...order, status: parsed.status });
    return NextResponse.json({ order: next });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Datos inválidos" },
      { status: 400 }
    );
  }
}
