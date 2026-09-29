import { NextResponse } from "next/server";
import {
  clearAdminSession,
  getConfiguredAdmin,
  setAdminSession,
  verifyPassword,
  hashPassword,
} from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const admin = getConfiguredAdmin();

    if (body.email.toLowerCase() !== admin.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    let ok = false;
    if (admin.passwordHash) {
      ok = verifyPassword(body.password, admin.passwordHash);
    } else {
      // Dev fallback: compare plaintext env password via hashed check
      const hashed = hashPassword(admin.password, "dev-salt-frantana");
      ok = verifyPassword(body.password, hashed) || body.password === admin.password;
    }

    if (!ok) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    await setAdminSession(admin.email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
