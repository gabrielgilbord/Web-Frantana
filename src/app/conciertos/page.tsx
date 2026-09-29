import { getConcerts, splitConcerts } from "@/lib/content/store";
import { ConcertList } from "@/components/concerts/ConcertList";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";
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
      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-7">
            <h1 className="display-title text-[clamp(3rem,12vw,7rem)]">
              Conciertos
            </h1>
          </Reveal>
          <Reveal className="md:col-span-5" delay={0.06}>
            <p className="prose-editorial">
              Agenda dinámica gestionada desde el panel. Fechas, recintos y
              estados de entradas se actualizan sin desplegar código.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <MediaReveal
          src="/media/gallery/stage-lights-01.jpg"
          alt="Escenario iluminado — fotografía editorial de archivo (placeholder, no representa a Frantana)"
          className="min-h-[42svh] w-full md:min-h-[52svh]"
          sizes="100vw"
          parallax
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(23,20,17,0.55))]" />
      </section>

      <section className="section-pad surface-ivory">
        <div className="container-editorial">
          <h2 className="font-display text-3xl md:text-4xl">Próximos</h2>
          <ConcertList
            concerts={upcoming}
            emptyMessage="[PROVISIONAL] No hay conciertos próximos publicados."
          />
        </div>
      </section>

      <section className="section-pad surface-beige">
        <div className="container-editorial">
          <h2 className="font-display text-3xl md:text-4xl">Anteriores</h2>
          <ConcertList
            concerts={past}
            emptyMessage="[PROVISIONAL] Todavía no hay conciertos anteriores registrados."
          />
        </div>
      </section>
    </div>
  );
}
