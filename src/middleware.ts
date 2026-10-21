import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Block any accidental public shop surface while disabled
  if (pathname === "/tienda" || pathname.startsWith("/tienda/")) {
    const enabled =
      process.env.SHOP_ENABLED === "true" ||
      process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";
    if (!enabled) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Keep Supabase Auth cookies fresh on admin / shop routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tienda") ||
    pathname.startsWith("/api/auth")
  ) {
    const { response } = await updateSession(request);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Todas las rutas de página (para x-pathname del header home).
     * Excluye estáticos / media.
     */
    "/((?!_next/static|_next/image|favicon.ico|media/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2)$).*)",
  ],
};
