import { getConcerts, splitConcerts } from "@/lib/content/store";
import { ConcertsArchive } from "@/components/concerts/ConcertsArchive";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Conciertos",
  description: "Agenda de conciertos de Frantana.",
});

export default async function ConciertosPage() {
  const concerts = await getConcerts();
  const { upcoming, past } = splitConcerts(concerts);

  return (
    <div className="pt-[var(--header-h)]">
      <ConcertsArchive upcoming={upcoming} past={past} />
    </div>
  );
}
