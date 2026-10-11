import { getConcerts, splitConcerts } from "@/lib/content/store";
import { ConcertsArchive } from "@/components/concerts/ConcertsArchive";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  path: "/conciertos",
  title: {
    absolute: "Conciertos Frantana | Agenda en Canarias y España",
  },
  description:
    "Agenda de conciertos de Frantana en Canarias y España. Fechas próximas, salas, ciudades y entradas cuando estén disponibles.",
  keywords: [
    "conciertos Frantana",
    "conciertos Canarias",
    "agenda Frantana",
    "entradas Frantana",
    "conciertos Tenerife",
    "conciertos Gran Canaria",
  ],
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
