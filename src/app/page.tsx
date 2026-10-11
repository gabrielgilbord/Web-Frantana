import dynamic from "next/dynamic";
import {
  getConcerts,
  getContent,
  getGallery,
  getNewsPosts,
  splitConcerts,
} from "@/lib/content/store";
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
  path: "/",
  title: {
    absolute:
      "Frantana | Cantante y compositor canario — Música, conciertos y contrataciones",
  },
  description:
    "Frantana, cantante y compositor canario: música oficial, agenda de conciertos en Canarias y España, novedades y contrataciones para eventos.",
  keywords: [
    "Frantana",
    "cantante canario",
    "compositor canario",
    "música canaria",
    "conciertos Canarias",
    "contratar cantante Canarias",
  ],
});

/**
 * Fase C final: Ascending Name + home narrativa (capítulos 01–07).
 * Fase D aún no.
 */
export default async function HomePage() {
  const [content, gallery, concerts, newsPosts] = await Promise.all([
    getContent(),
    getGallery(),
    getConcerts(),
    getNewsPosts({ limit: 3 }),
  ]);
  const { upcoming } = splitConcerts(concerts);

  return (
    <>
      <HeroExperience />
      <HomeNarrative
        content={content}
        gallery={gallery}
        concerts={upcoming}
        newsPosts={newsPosts}
      />
    </>
  );
}
