import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tienda",
    "/tienda/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
