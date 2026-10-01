import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";
import { SHOP_ENABLED } from "@/lib/shop/feature-flag";
import { AdminShell } from "@/components/admin/AdminShell";

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

  if (!session) {
    return <div className="admin-app admin-app--auth">{children}</div>;
  }

  return (
    <AdminShell email={session.email} shopEnabled={SHOP_ENABLED}>
      {children}
    </AdminShell>
  );
}
