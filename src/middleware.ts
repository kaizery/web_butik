import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// OWASP Top 10 A01:2021 - Broken Access Control Protection Middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionRole = request.cookies.get("aura_session_role")?.value;

  // 1. Proteksi Khusus Portal Kasir (/kasir)
  if (pathname.startsWith("/kasir")) {
    if (!sessionRole || (sessionRole !== "CASHIER" && sessionRole !== "ADMIN")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized_kasir");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Proteksi Khusus Portal Super Admin (/portal-admin)
  if (pathname.startsWith("/portal-admin")) {
    if (!sessionRole || sessionRole !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Proteksi API Admin & POS (/api/admin/*, /api/pos/*)
  if (pathname.startsWith("/api/admin")) {
    if (!sessionRole || (sessionRole !== "ADMIN" && sessionRole !== "CASHIER")) {
      return NextResponse.json(
        { error: "Akses ditolak" },
        { status: 401 }
      );
    }
  }

  if (pathname.startsWith("/api/pos")) {
    if (!sessionRole || (sessionRole !== "ADMIN" && sessionRole !== "CASHIER")) {
      return NextResponse.json(
        { error: "Akses ditolak" },
        { status: 401 }
      );
    }
  }

  // 4. Blokir total akses URL usang /admin
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kasir/:path*",
    "/portal-admin/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/pos/:path*",
  ],
};
