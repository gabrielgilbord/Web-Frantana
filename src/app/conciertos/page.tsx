import { getConcerts, splitConcerts } from "@/lib/content/store";
import { ConcertList } from "@/components/concerts/ConcertList";
import { Reveal } from "@/components/motion/Reveal";
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
      <section className="section-pad">
        <div className="container-editorial">
          <Reveal>
            <h1 className="display-title text-6xl md:text-8xl">Conciertos</h1>
            <p className="prose-editorial mt-6">
              Agenda dinámica gestionada desde el panel. Fechas, recintos y
              estados de entradas se actualizan sin desplegar código.
            </p>
          </Reveal>

          <div className="mt-16">
            <h2 className="font-display text-3xl md:text-4xl">Próximos</h2>
            <ConcertList
              concerts={upcoming}
              emptyMessage="[PROVISIONAL] No hay conciertos próximos publicados."
            />
          </div>

          <div className="mt-20">
            <h2 className="font-display text-3xl md:text-4xl">Anteriores</h2>
            <ConcertList
              concerts={past}
              emptyMessage="[PROVISIONAL] Todavía no hay conciertos anteriores registrados."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
