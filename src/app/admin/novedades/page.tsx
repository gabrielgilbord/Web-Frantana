import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getNewsPosts } from "@/lib/content/store";
import { NewsAdminClient } from "@/components/admin/NewsAdminClient";

export default async function AdminNovedadesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const posts = await getNewsPosts({ includeUnpublished: true });
  return <NewsAdminClient initialPosts={posts} />;
}
