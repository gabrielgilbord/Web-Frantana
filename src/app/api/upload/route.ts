import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { storeUploadedImage } from "@/lib/media/upload";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const result = await storeUploadedImage(file);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al subir";
    const status =
      message.includes("Formato") ||
      message.includes("grande") ||
      message.includes("HEIC") ||
      message.includes("requerido")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
