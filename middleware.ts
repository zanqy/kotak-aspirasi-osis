import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: pelindung utama /dashboard.
 *
 * Catatan penting:
 * - Next.js 14 middleware berjalan di Edge runtime, sedangkan firebase-admin
 *   hanya bisa jalan di Node.js. Karena itu verifikasi penuh session + role
 *   dilakukan di API routes (`verifyAuthDashboard`) dan `/api/auth/session`.
 * - Middleware ini hanya mencegah halaman dashboard dirender sebelum redirect
 *   ke login (UX), dengan mengecek keberadaan cookie session `fb-session`.
 *   Verifikasi keaslian cookie tetap dilakukan server-side di API routes.
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ============== /dashboard/* (page routes) ==============
  if (path.startsWith("/dashboard") && path !== "/dashboard/login") {
    const sessionCookie = request.cookies.get("fb-session")?.value;

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};