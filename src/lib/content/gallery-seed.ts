import { promises as fs } from "fs";
import path from "path";
import type { GalleryImage } from "@/types";
import {
  dbGetGallery,
  dbUpsertGalleryImage,
  useSupabaseStore,
} from "@/lib/content/supabase-store";

const DATA_PATH = path.join(process.cwd(), "src/data/site.json");

let seedPromise: Promise<void> | null = null;

async function readSeedGallery(): Promise<GalleryImage[]> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const data = JSON.parse(raw) as { gallery?: GalleryImage[] };
  return data.gallery ?? [];
}

/**
 * Inserta en gallery_images las fotos del seed que aún no existan.
 * Evita que la primera subida deje la galería solo con esa foto.
 */
export async function ensureGallerySeedInDb(): Promise<void> {
  if (!useSupabaseStore()) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await dbGetGallery({ includeUnpublished: true });
      if (existing === null) return;
      const have = new Set(existing.map((g) => g.id));
      const seed = await readSeedGallery();
      await Promise.all(
        seed
          .filter((image) => !have.has(image.id))
          .map((image) => dbUpsertGalleryImage(image))
      );
    })().finally(() => {
      seedPromise = null;
    });
  }
  await seedPromise;
}
