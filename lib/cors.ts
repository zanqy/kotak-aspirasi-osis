import { NextResponse } from "next/server";
import { env } from "./env";

/**
 * Bangun header CORS berbasis whitelist origin (lihat `env.allowedOrigins`).
 * Kalau origin request ada di whitelist → kembalikan origin tsb (echo).
 * Kalau tidak → kembalikan origin pertama di whitelist sebagai default aman.
 *
 * Bedanya dengan `*`:
 * - `*` mengizinkan SEMUA domain → dangerous, terutama untuk endpoint auth.
 * - Whitelist echo → cuma domain yang kita percaya yang boleh akses.
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const requestOrigin = request.headers.get("origin") ?? "";
  const allowed = env.allowedOrigins;
  const allowOrigin =
    requestOrigin && allowed.includes(requestOrigin)
      ? requestOrigin
      : allowed[0] ?? env.NEXT_PUBLIC_APP_URL;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

/**
 * Helper untuk preflight handler yang reusable di tiap route publik.
 */
export function handleCorsOptions(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}