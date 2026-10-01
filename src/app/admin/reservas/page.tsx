import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getBookings } from "@/lib/content/store";
import { BookingsAdminClient } from "@/components/admin/BookingsAdminClient";

export default async function AdminReservasPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const bookings = await getBookings();
  return <BookingsAdminClient initialBookings={bookings} />;
}
