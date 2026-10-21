import { promises as fs } from "fs";
import path from "path";
import type { GalleryImage } from "@/types";
import {
  dbGetGallery,
  dbUpsertGalleryImage,
  useSupabaseStore,
} from "@/lib/content/supabase-store";
import { createAdminClient } from "@/lib/supabase/admin";

const DATA_PATH = path.join(process.cwd(), "src/data/site.json");

/**
 * Fotos oficiales. IDs en UUID porque en prod `gallery_images.id` es uuid
 * (001_initial); la migración a text (002) puede no estar aplicada.
 */
export const GALLERY_SEED: GalleryImage[] = [
  {
    id: "a7f7a001-0001-4000-8000-000000000001",
    src: "/media/gallery/frantana/shot-01.jpg",
    alt: "Frantana — retrato de estudio",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 1,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000003",
    src: "/media/gallery/frantana/shot-03.jpg",
    alt: "Frantana — fotografía oficial",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 2,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000004",
    src: "/media/gallery/frantana/shot-04.jpg",
    alt: "Frantana — plano horizontal de estudio",
    width: 1800,
    height: 1197,
    published: true,
    sortOrder: 4,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000005",
    src: "/media/gallery/frantana/shot-05.jpg",
    alt: "Frantana — fotografía oficial",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 5,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000006",
    src: "/media/gallery/frantana/shot-06.jpg",
    alt: "Frantana — estudio, sonrisa y bandana amarilla",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 6,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000007",
    src: "/media/gallery/frantana/shot-07.jpg",
    alt: "Frantana — estudio con foco en el suelo",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 7,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000008",
    src: "/media/gallery/frantana/shot-08.jpg",
    alt: "Frantana — pose de estudio, mano en la cadera",
    width: 1800,
    height: 2705,
    published: true,
    sortOrder: 8,
    credit: "@frantana",
  },
  {
    id: "a7f7a001-0001-4000-8000-000000000009",
    src: "/media/gallery/frantana/shot-09.jpg",
    alt: "Frantana — retrato en arena blanca, look blanco",
    width: 2200,
    height: 1464,
    published: true,
    sortOrder: 9,
    credit: "@frantana",
  },
];

let seedPromise: Promise<void> | null = null;

function normalizeSeedRow(image: GalleryImage): GalleryImage {
  const bySrc = GALLERY_SEED.find((s) => s.src === image.src);
  if (bySrc) return { ...image, id: bySrc.id };
  // ids legacy "ig-01" → UUID estable
  if (/^ig-\d+$/i.test(image.id)) {
    const n = image.id.replace(/\D/g, "").padStart(3, "0");
    return {
      ...image,
      id: `a7f7a001-0001-4000-8000-000000000${n}`,
    };
  }
  return image;
}

async function readSeedGallery(): Promise<GalleryImage[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const data = JSON.parse(raw) as { gallery?: GalleryImage[] };
    if (data.gallery?.length) {
      return data.gallery.map(normalizeSeedRow);
    }
  } catch {
    /* usar constante */
  }
  return GALLERY_SEED;
}

export type SeedGalleryResult = {
  ok: boolean;
  upserted: number;
  total: number;
  ids: string[];
  error?: string;
};

/** Upsert forzado de todas las fotos seed en gallery_images (service role). */
export async function seedGalleryToSupabase(): Promise<SeedGalleryResult> {
  const sb = createAdminClient();
  if (!sb) {
    return {
      ok: false,
      upserted: 0,
      total: GALLERY_SEED.length,
      ids: [],
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY) en el entorno.",
    };
  }

  const seed = await readSeedGallery();
  const rows = seed.map((image) => ({
    id: image.id,
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    published: image.published,
    sort_order: image.sortOrder,
    credit: image.credit,
  }));

  const { data, error } = await sb
    .from("gallery_images")
    .upsert(rows, { onConflict: "id" })
    .select("id");

  if (error) {
    return {
      ok: false,
      upserted: 0,
      total: seed.length,
      ids: [],
      error: error.message,
    };
  }

  const ids = (data ?? []).map((r) => String((r as { id: string }).id));
  return {
    ok: true,
    upserted: ids.length || seed.length,
    total: seed.length,
    ids: ids.length ? ids : seed.map((s) => s.id),
  };
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
      if (existing.length === 0) {
        await seedGalleryToSupabase();
        return;
      }
      const have = new Set(existing.map((g) => g.id));
      const haveSrc = new Set(existing.map((g) => g.src));
      const seed = await readSeedGallery();
      await Promise.all(
        seed
          .filter((image) => !have.has(image.id) && !haveSrc.has(image.src))
          .map((image) => dbUpsertGalleryImage(image))
      );
    })().finally(() => {
      seedPromise = null;
    });
  }
  await seedPromise;
}
