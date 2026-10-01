import { notFound } from "next/navigation";
import {
  getConcertById,
  getConcerts,
  getGallery,
} from "@/lib/content/store";
import { ConcertDetailExperience } from "@/components/concerts/ConcertDetailExperience";
import { formatConcertLongDate } from "@/lib/concerts/format";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const concerts = await getConcerts({ includeUnpublished: true });
  return concerts.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const concert = await getConcertById(id);
  if (!concert) return buildMetadata({ title: "Concierto" });
  return buildMetadata({
    title: `${concert.title} · ${concert.city}`,
    description: `${concert.venue} — ${formatConcertLongDate(concert.date)}${
      concert.time ? ` · ${concert.time}` : ""
    }`,
  });
}

export default async function ConcertDetailPage({ params }: Props) {
  const { id } = await params;
  const concert = await getConcertById(id);
  if (!concert) notFound();

  const gallery = await getGallery();
  const fallback =
    gallery.find((g) => g.published)?.src ?? "/media/gallery/frantana/06.jpg";
  const heroImage = concert.image || fallback;

  return (
    <ConcertDetailExperience concert={concert} heroImage={heroImage} />
  );
}
