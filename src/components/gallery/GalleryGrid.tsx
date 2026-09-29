"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import type { GalleryImage } from "@/types";
import { Reveal } from "@/components/motion/Reveal";
import clsx from "clsx";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(() => {
    setActive((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);
  const prev = useCallback(() => {
    setActive((i) =>
      i === null ? i : (i - 1 + images.length) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, prev]);

  if (!images.length) {
    return (
      <p className="provisional">
        [PROVISIONAL] La galería se completará con fotografías oficiales del artista.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
        {images.map((image, index) => {
          const span =
            index % 5 === 0
              ? "md:col-span-7 md:row-span-2 min-h-[18rem] md:min-h-[28rem]"
              : index % 5 === 1
                ? "md:col-span-5 min-h-[14rem] md:min-h-[18rem]"
                : index % 5 === 2
                  ? "md:col-span-5 min-h-[14rem] md:min-h-[20rem]"
                  : index % 5 === 3
                    ? "md:col-span-4 min-h-[12rem] md:min-h-[16rem]"
                    : "md:col-span-8 min-h-[14rem] md:min-h-[18rem]";

          return (
            <Reveal key={image.id} className={clsx("col-span-1", span)} delay={(index % 4) * 0.06}>
              <button
                type="button"
                className="group relative h-full w-full overflow-hidden bg-beige text-left"
                onClick={() => setActive(index)}
                aria-label={`Ampliar: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width:768px) 50vw, 40vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                />
              </button>
            </Reveal>
          );
        })}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p id={titleId} className="sr-only">
              {images[active].alt}
            </p>
            <div className="relative aspect-[16/10] w-full bg-ink">
              <Image
                src={images[active].src}
                alt={images[active].alt}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-ivory">
              <p className="text-sm text-ivory/80">
                {images[active].alt}
                {images[active].credit ? ` · ${images[active].credit}` : ""}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-ivory/40 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em]"
                  onClick={prev}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="border border-ivory/40 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em]"
                  onClick={next}
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  className="border border-ivory/40 px-3 py-2 text-[0.68rem] uppercase tracking-[0.16em]"
                  onClick={close}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
