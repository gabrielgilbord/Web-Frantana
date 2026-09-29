import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content/store";
import { ContentAdminClient } from "@/components/admin/ContentAdminClient";

export default async function AdminContentPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const content = await getContent();
  return <ContentAdminClient initialContent={content} />;
}
