import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getConcerts } from "@/lib/content/store";
import { ConcertsAdminClient } from "@/components/admin/ConcertsAdminClient";

export default async function AdminConcertsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const concerts = await getConcerts({ includeUnpublished: true });
  return <ConcertsAdminClient initialConcerts={concerts} />;
}
