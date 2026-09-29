import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPEG, PNG, WebP o AVIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Archivo demasiado grande (máx. 8 MB)." },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/avif"
          ? "avif"
          : "jpg";

  const dir = path.join(process.cwd(), "public/media/uploads");
  await fs.mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({
    src: `/media/uploads/${filename}`,
  });
}
