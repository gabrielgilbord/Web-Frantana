import { getGallery } from "@/lib/content/store";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal } from "@/components/motion/Reveal";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Galería",
  description: "Galería fotográfica editorial de Frantana.",
});

export default async function GaleriaPage() {
  const images = await getGallery();

  return (
    <div className="pt-[var(--header-h)]">
      <section className="section-pad surface-ivory">
        <div className="container-editorial">
          <Reveal>
            <h1 className="display-title text-[clamp(3rem,12vw,7rem)]">Galería</h1>
            <p className="prose-editorial mt-6 max-w-xl">
              Fotografías oficiales de Frantana.
            </p>
          </Reveal>
          <div className="mt-10">
            <GalleryGrid images={images} />
          </div>
        </div>
      </section>
    </div>
  );
}
