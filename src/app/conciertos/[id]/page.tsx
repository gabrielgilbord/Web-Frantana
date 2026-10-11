import { notFound } from "next/navigation";
import {
  getConcertById,
  getConcerts,
  getGallery,
} from "@/lib/content/store";
import { ConcertDetailExperience } from "@/components/concerts/ConcertDetailExperience";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatConcertLongDate } from "@/lib/concerts/format";
import {
  breadcrumbJsonLd,
  buildMetadata,
  concertEventJsonLd,
} from "@/lib/seo/metadata";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const concerts = await getConcerts({ includeUnpublished: true });
  return concerts.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const concert = await getConcertById(id);
  if (!concert) {
    return buildMetadata({
      path: "/conciertos",
      title: "Concierto",
      noIndex: true,
    });
  }

  const path = `/conciertos/${concert.id}`;
  const when = formatConcertLongDate(concert.date);
  const description = `${concert.title} en ${concert.venue} (${concert.city}) — ${when}${
    concert.time ? ` a las ${concert.time}` : ""
  }. Concierto de Frantana.`;

  return buildMetadata({
    path,
    title: {
      absolute: `${concert.title} en ${concert.city} | Concierto Frantana`,
    },
    description,
    image: concert.image || undefined,
    imageAlt: `${concert.title} — ${concert.city}`,
    keywords: [
      `concierto ${concert.city}`,
      concert.title,
      "Frantana",
      "conciertos Canarias",
      concert.venue,
    ],
    openGraph: {
      type: "website",
      title: `${concert.title} · ${concert.city}`,
      description,
      url: path,
    },
  });
}

export default async function ConcertDetailPage({ params }: Props) {
  const { id } = await params;
  const concert = await getConcertById(id);
  if (!concert) notFound();

  const gallery = await getGallery();
  const fallback =
    gallery.find((g) => g.published)?.src ?? "/media/gallery/frantana/shot-01.jpg";
  const heroImage = concert.image || fallback;
  const path = `/conciertos/${concert.id}`;

  return (
    <>
      <JsonLd
        data={[
          concertEventJsonLd(concert, heroImage),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Conciertos", path: "/conciertos" },
            { name: concert.title, path },
          ]),
        ]}
      />
      <ConcertDetailExperience concert={concert} heroImage={heroImage} />
    </>
  );
}
