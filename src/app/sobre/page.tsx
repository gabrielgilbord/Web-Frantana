import { getContent } from "@/lib/content/store";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/Reveal";
import { MediaReveal } from "@/components/motion/MediaReveal";

export const metadata = buildMetadata({
  title: "Sobre Frantana",
  description: "Biografía y presentación de Frantana.",
});

export default async function SobrePage() {
  const content = await getContent();

  return (
    <div className="pt-[var(--header-h)]">
      <section className="section-pad">
        <div className="container-editorial grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <h1 className="display-title text-6xl md:text-7xl lg:text-8xl">
              {content.aboutTitle}
            </h1>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
            <p
              className={
                content.aboutBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional prose-editorial text-lg"
                  : "prose-editorial text-lg"
              }
            >
              {content.aboutBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <MediaReveal
          src="/media/editorial/microphone.jpg"
          alt="Micrófono en estudio — fotografía editorial de archivo (placeholder, no representa a Frantana)"
          className="aspect-[16/9] w-full md:aspect-[2.2/1]"
          sizes="100vw"
          parallax
        />
      </section>

      <section className="section-pad bg-beige/40">
        <div className="container-editorial grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-4">
            <h2 className="display-title text-4xl md:text-5xl">
              {content.aboutStoryTitle}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.08}>
            <p
              className={
                content.aboutStoryBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional prose-editorial"
                  : "prose-editorial"
              }
            >
              {content.aboutStoryBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-editorial grid gap-6 md:grid-cols-2">
          <MediaReveal
            src="/media/editorial/piano-keys.jpg"
            alt="Teclas de piano — fotografía editorial de archivo (placeholder)"
            className="aspect-[4/5]"
          />
          <MediaReveal
            src="/media/editorial/studio-headphones.jpg"
            alt="Auriculares de estudio — fotografía editorial de archivo (placeholder)"
            className="aspect-[4/5] md:mt-16"
          />
        </div>
      </section>
    </div>
  );
}
