import { promises as fs } from "fs";
import path from "path";
import type {
  Concert,
  GalleryImage,
  Product,
  SiteContent,
  SiteData,
} from "@/types";

const DATA_PATH = path.join(process.cwd(), "src/data/site.json");

async function readRaw(): Promise<SiteData> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as SiteData;
}

async function writeRaw(data: SiteData) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function getSiteData(): Promise<SiteData> {
  return readRaw();
}

export async function getContent(): Promise<SiteContent> {
  const data = await readRaw();
  return data.content;
}

export async function updateContent(
  patch: Partial<SiteContent>
): Promise<SiteContent> {
  const data = await readRaw();
  data.content = {
    ...data.content,
    ...patch,
    social: {
      ...data.content.social,
      ...(patch.social ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };
  await writeRaw(data);
  return data.content;
}

export async function getConcerts(options?: {
  includeUnpublished?: boolean;
}): Promise<Concert[]> {
  const data = await readRaw();
  const list = options?.includeUnpublished
    ? data.concerts
    : data.concerts.filter((c) => c.published);
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

export async function upsertConcert(
  concert: Omit<Concert, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<Concert> {
  const data = await readRaw();
  const now = new Date().toISOString();
  const existingIndex = data.concerts.findIndex((c) => c.id === concert.id);
  const next: Concert = {
    ...concert,
    createdAt:
      existingIndex >= 0 ? data.concerts[existingIndex].createdAt : now,
    updatedAt: now,
  };
  if (existingIndex >= 0) {
    data.concerts[existingIndex] = next;
  } else {
    data.concerts.push(next);
  }
  await writeRaw(data);
  return next;
}

export async function deleteConcert(id: string) {
  const data = await readRaw();
  data.concerts = data.concerts.filter((c) => c.id !== id);
  await writeRaw(data);
}

export async function getGallery(options?: {
  includeUnpublished?: boolean;
}): Promise<GalleryImage[]> {
  const data = await readRaw();
  const list = options?.includeUnpublished
    ? data.gallery
    : data.gallery.filter((g) => g.published);
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertGalleryImage(image: GalleryImage) {
  const data = await readRaw();
  const idx = data.gallery.findIndex((g) => g.id === image.id);
  if (idx >= 0) data.gallery[idx] = image;
  else data.gallery.push(image);
  await writeRaw(data);
  return image;
}

export async function deleteGalleryImage(id: string) {
  const data = await readRaw();
  data.gallery = data.gallery.filter((g) => g.id !== id);
  await writeRaw(data);
}

export async function getProducts(options?: {
  includeUnpublished?: boolean;
}): Promise<Product[]> {
  const data = await readRaw();
  return options?.includeUnpublished
    ? data.products
    : data.products.filter((p) => p.published);
}

export async function upsertProduct(product: Product) {
  const data = await readRaw();
  const idx = data.products.findIndex((p) => p.id === product.id);
  const next = { ...product, updatedAt: new Date().toISOString() };
  if (idx >= 0) data.products[idx] = next;
  else data.products.push(next);
  await writeRaw(data);
  return next;
}

export async function deleteProduct(id: string) {
  const data = await readRaw();
  data.products = data.products.filter((p) => p.id !== id);
  await writeRaw(data);
}

export function splitConcerts(concerts: Concert[]) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = concerts.filter((c) => c.date >= today);
  const past = concerts
    .filter((c) => c.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}
