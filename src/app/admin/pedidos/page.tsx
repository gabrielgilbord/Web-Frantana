import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getOrders } from "@/lib/content/store";
import { OrdersAdminClient } from "@/components/admin/OrdersAdminClient";

export default async function AdminPedidosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const orders = await getOrders();
  return <OrdersAdminClient initialOrders={orders} />;
}
