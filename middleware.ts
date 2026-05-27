import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const secret =
    process.env.JWT_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = request.cookies.get("onyxx_admin")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("onyxx_admin");
      return response;
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("onyxx_admin");
    return response;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
