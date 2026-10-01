import dynamic from "next/dynamic";
import { getConcerts, getContent, getGallery, splitConcerts } from "@/lib/content/store";
import { buildMetadata } from "@/lib/seo/metadata";
import { HomeNarrative } from "@/components/experience/HomeNarrative";

const HeroExperience = dynamic(
  () =>
    import("@/components/experience/HeroExperience").then(
      (m) => m.HeroExperience
    ),
  {
    ssr: true,
    loading: () => (
      <div
        className="hero-experience__stage"
        aria-busy="true"
        aria-label="Cargando presentación"
      />
    ),
  }
);

export const metadata = buildMetadata({
  title: "Frantana",
  description:
    "Frantana — cantante y compositor canario. Música, conciertos y novedades.",
});

/**
 * Fase C final: Ascending Name + home narrativa (capítulos 01–07).
 * Fase D aún no.
 */
export default async function HomePage() {
  const [content, gallery, concerts] = await Promise.all([
    getContent(),
    getGallery(),
    getConcerts(),
  ]);
  const { upcoming } = splitConcerts(concerts);

  return (
    <>
      <HeroExperience />
      <HomeNarrative
        content={content}
        gallery={gallery}
        concerts={upcoming}
      />
    </>
  );
}
