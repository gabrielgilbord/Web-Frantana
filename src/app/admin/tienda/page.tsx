import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getProducts } from "@/lib/content/store";
import { ShopAdminClient } from "@/components/admin/ShopAdminClient";

export default async function AdminShopPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const products = await getProducts({ includeUnpublished: true });
  return <ShopAdminClient initialProducts={products} />;
}
