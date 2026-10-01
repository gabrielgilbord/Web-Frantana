import { notFound } from "next/navigation";
import { getBookingByToken } from "@/lib/content/store";
import { BookingTrackClient } from "@/components/booking/BookingTrackClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Seguimiento de reserva",
  description: "Consulta y responde a tu solicitud de contratación con Frantana.",
});

type Props = { params: Promise<{ token: string }> };

export default async function BookingTrackPage({ params }: Props) {
  const { token } = await params;
  const booking = await getBookingByToken(token);
  if (!booking) notFound();

  return (
    <div className="booking-page-shell pt-[var(--header-h)]">
      <section className="booking-page booking-page--track">
        <div className="container-editorial" style={{ maxWidth: "42rem" }}>
          <BookingTrackClient initial={booking} />
        </div>
      </section>
    </div>
  );
}
