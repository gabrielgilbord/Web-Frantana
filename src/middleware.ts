import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/tienda", "/tienda/:path*", "/admin/:path*"],
};
