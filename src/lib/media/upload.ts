import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = "media";

export type UploadResult = { src: string };

function extensionFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

export function assertUploadableImage(file: File) {
  const mime = (file.type || "").toLowerCase();
  if (mime.includes("heic") || mime.includes("heif")) {
    throw new Error(
      "Este formato (HEIC/HEIF) no es compatible. En el iPhone elige «Más compatible» o convierte a JPEG/PNG/WebP."
    );
  }
  if (!ALLOWED.has(mime)) {
    throw new Error("Formato no permitido. Usa JPEG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Archivo demasiado grande (máx. 8 MB).");
  }
}

/** Sube a Supabase Storage si hay service role; si no, a disco local (solo dev). */
export async function storeUploadedImage(file: File): Promise<UploadResult> {
  assertUploadableImage(file);
  const ext = extensionFor(file.type.toLowerCase());
  const filename = `${randomUUID()}.${ext}`;
  const objectPath = `uploads/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const sb = createAdminClient();
  if (sb) {
    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buffer, {
      contentType: file.type || `image/${ext}`,
      upsert: false,
      cacheControl: "31536000",
    });
    if (error) {
      throw new Error(`No se pudo subir a Storage: ${error.message}`);
    }
    const { data } = sb.storage.from(BUCKET).getPublicUrl(objectPath);
    if (!data?.publicUrl) {
      throw new Error("Subida OK pero no se obtuvo URL pública.");
    }
    return { src: data.publicUrl };
  }

  // Dev local sin service role
  try {
    const dir = path.join(process.cwd(), "public/media/uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
    return { src: `/media/uploads/${filename}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error de disco";
    throw new Error(
      `No se pudo guardar la imagen (${msg}). En producción configura SUPABASE_SERVICE_ROLE_KEY y el bucket «media».`
    );
  }
}
