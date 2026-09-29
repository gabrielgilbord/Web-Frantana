import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getGallery } from "@/lib/content/store";
import { GalleryAdminClient } from "@/components/admin/GalleryAdminClient";

export default async function AdminGalleryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const gallery = await getGallery({ includeUnpublished: true });
  return <GalleryAdminClient initialImages={gallery} />;
}
