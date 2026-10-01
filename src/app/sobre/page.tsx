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
      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <h1 className="display-title text-[clamp(3rem,10vw,6.5rem)]">
              {content.aboutTitle}
            </h1>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
            <p
              className={
                content.aboutBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional"
                  : "prose-editorial text-lg"
              }
            >
              {content.aboutBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative">
        <MediaReveal
          src="/media/gallery/frantana/03.jpg"
          alt="Frantana — fotografía oficial"
          className="min-h-[55svh] w-full md:min-h-[75svh]"
          sizes="100vw"
          parallax
        />
      </section>

      <section className="section-pad surface-beige">
        <div className="container-editorial grid gap-8 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <h2 className="display-title text-[clamp(2.25rem,6vw,3.75rem)]">
              {content.aboutStoryTitle}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6" delay={0.06}>
            <p
              className={
                content.aboutStoryBody.includes("[TEXTO PROVISIONAL]")
                  ? "provisional"
                  : "prose-editorial"
              }
            >
              {content.aboutStoryBody}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad surface-ivory">
        <div className="container-editorial grid gap-5 md:grid-cols-2">
          <MediaReveal
            src="/media/gallery/frantana/07.jpg"
            alt="Frantana — imagen oficial"
            className="aspect-[4/5]"
          />
          <MediaReveal
            src="/media/gallery/frantana/08.jpg"
            alt="Frantana — captura oficial"
            className="aspect-[4/5] md:mt-16"
          />
        </div>
      </section>
    </div>
  );
}
